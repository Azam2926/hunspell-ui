"use server";

import path from "path";
import fs from "fs";
import Dictionary, { Rule } from "@/lib/dictionary-typescript";
import { db } from "@/lib/db";
import {
  affixGroups,
  affixRules,
  dictionaryEntries,
  Language,
  NewAffixGroup,
  NewAffixRule,
  NewDictionaryEntry,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { formatLanguageIdentifier } from "../utils";

const DICTIONARY_BASE_PATH = path.join(process.cwd(), "dictionaries");
const DICTIONARY_BASE_PATH_EXPORTED = path.join(
  process.cwd(),
  "dictionaries_exported",
);

export async function syncDicFileAction(language: Language) {
  // Validate parameters to prevent directory traversal attacks
  const lang_name_code = formatLanguageIdentifier(language);
  if (!["uz_Latn_UZ", "uz_Cyrl_UZ"].includes(lang_name_code)) {
    return { success: false, error: "Invalid language or type" };
  }
  try {
    const filePath = path.join(
      DICTIONARY_BASE_PATH,
      `${lang_name_code}`,
      `${lang_name_code}.dic`,
    );

    const sp = new Dictionary();
    let count = 0;
    const parseDIC = sp._parseDIC(fs.readFileSync(filePath, "utf8"));
    for (const [word, outerArrays] of Object.entries(parseDIC)) {
      const sfxs = outerArrays.map((innerArray) => {
        if (Array.isArray(innerArray)) {
          return innerArray.join("");
        }
        return innerArray;
      });

      await saveDictionaryEntries([
        {
          word,
          langId: language.id,
          sfxs: sfxs,
        },
      ]);
      count++;
    }

    // await db.insert(dictionaryEntries).values(values);

    return { success: true, count };
  } catch (error) {
    console.error("Error syncing .dic file:", error);
    return { success: false, error: error };
  }
}

export async function countWordsAction(language: string) {
  // Validate parameters to prevent directory traversal attacks
  if (!["uz_Latn_UZ", "uz_Cyrl_UZ"].includes(language)) {
    return { success: false, error: "Invalid language or type" };
  }

  try {
    const filePath = path.join(
      DICTIONARY_BASE_PATH,
      `${language}`,
      `${language}.dic`,
    );
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // The first line is the word count so skip it.
    const [countLine, ...entries] = lines;
    console.log("Countline: ", countLine);

    // Parse each dictionary entry.
    // Each line is expected in the form: word/flags (or just word)
    const set = new Set<string>();
    //detect duplicate words
    let count = 0;
    entries.forEach((entry) => {
      const [word] = entry.split("/");

      if (set.has(word)) {
        count++;
        console.log("word already exists", word);
      } else set.add(word);
    });

    return { success: true, count: set.size };
  } catch (error) {
    console.error("Error syncing .dic file:", error);
    return { success: false, error: error };
  }
}

export async function exportDicFileAction(language: Language) {
  // Validate parameters to prevent directory traversal attacks
  const lang_name_code = formatLanguageIdentifier(language);
  if (!["uz_Latn_UZ", "uz_Cyrl_UZ"].includes(lang_name_code)) {
    return { success: false, error: "Invalid language or type" };
  }

  try {
    const content = await getDictionaryContent(language);
    return {
      success: true,
      content: content,
      filename: `${lang_name_code}.dic`,
    };
  } catch (error) {
    console.error("Error exporting dictionary:", error);
    return { success: false, error: error };
  }
}

// Function to generate dictionary content without saving to filesystem
export async function getDictionaryContent(language: Language) {
  const lang_name_code = formatLanguageIdentifier(language);

  const words = await db
    .select()
    .from(dictionaryEntries)
    .where(eq(dictionaryEntries.langId, language.id))
    .orderBy(dictionaryEntries.word);

  const lines = words.map((word) => {
    const pfxs = word.pfxs?.join("") || "";
    const sfxs = word.sfxs?.join("") || "";
    const affixes = pfxs + sfxs;
    return `${word.word}/${affixes}`;
  });

  // Return content as string
  return words.length + "\n" + lines.join("\n");
}

async function saveDictionaryEntries(entries: NewDictionaryEntry[]) {
  try {
    await db.insert(dictionaryEntries).values(entries);
  } catch (error) {
    console.error("Error saving dictionary entries:", error);
    throw new Error("Failed to save dictionary entries");
  }
}

export async function syncAffFileAction(language: Language) {
  const lang_name_code = formatLanguageIdentifier(language);
  if (!["uz_Latn_UZ", "uz_Cyrl_UZ"].includes(lang_name_code)) {
    return { success: false, error: "Invalid language or type" };
  }

  try {
    const filePath = path.join(
      DICTIONARY_BASE_PATH,
      lang_name_code,
      `${lang_name_code}.aff`,
    );
    const sp = new Dictionary();

    const parsedAFF: Record<string, Rule> = sp._parseAFF(
      fs.readFileSync(filePath, "utf8"),
    );
    const affixRuleEntries: NewAffixRule[] = [];

    await db.transaction(async (tx) => {
      for (const flag in parsedAFF) {
        const rule = parsedAFF[flag];

        // Insert or retrieve affix group
        const [res] = await tx
          .insert(affixGroups)
          .values({
            lang_id: language.id,
            type: rule.type,
            flag,
            multiUse: rule.combineable,
            description: "",
          } as NewAffixGroup)
          .onConflictDoNothing()
          .returning({ groupId: affixGroups.id });

        // If affix group was not inserted, retrieve existing ID
        const finalGroupId =
          res?.groupId ||
          (
            await tx
              .select({ id: affixGroups.id })
              .from(affixGroups)
              .where(
                and(
                  eq(affixGroups.lang_id, language.id), // Ensure correct language
                  eq(affixGroups.type, rule.type as "SFX" | "PFX"), // Ensure correct affix type (PFX/SFX)
                  eq(affixGroups.flag, flag), // Ensure correct flag
                ),
              )
          )[0]?.id;

        if (!finalGroupId) continue;

        // Collect affix rules for bulk insert
        rule.entries.forEach((entry) => {
          affixRuleEntries.push({
            groupId: finalGroupId,
            add: entry.add || "",
            omit: entry.remove?.toString() || "",
            match: entry.match?.toString() || "",
          });
        });
      }

      // Bulk insert affix rules
      if (affixRuleEntries.length > 0) {
        await tx.insert(affixRules).values(affixRuleEntries);
      }
    });

    return { success: true, count: affixRuleEntries.length };
  } catch (error) {
    console.error("Error syncing .aff file:", error);
    return { success: false, error: error };
  }
}
