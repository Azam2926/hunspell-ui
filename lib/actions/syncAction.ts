"use server";

import path from "path";
import fs from "fs";
import Dictionary, { Rule } from "@/lib/dictionary-typescript";
import { db } from "@/lib/db";
import { affixGroups, affixRules } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const DICTIONARY_BASE_PATH = path.join(process.cwd(), "dictionaries");

export async function syncDicFileAction(language: string) {
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
    // const content = await fs.readFile(filePath, "utf8");
    // const lines = content
    //   .split("\n")
    //   .map((line) => line.trim())
    //   .filter((line) => line.length > 0);
    //
    // // The first line is the word count so skip it.
    // const [countLine, ...entries] = lines;
    //
    // // Parse each dictionary entry.
    // // Each line is expected in the form: word/flags (or just word)
    // const wordEntries = entries.map(async (entry) => {
    //   const [word, flags] = entry.split("/");
    //   await db.insert(words).values({ value: word, script: language, flags });
    // });

    // Optionally, you can add conflict handling if you have a unique constraint.
    // For example, you might use an upsert or filter out duplicates before inserting.

    const sp = new Dictionary();

    const parseDIC = sp._parseDIC(fs.readFileSync(filePath, "utf8"));

    return { success: true, count: 0 };
  } catch (error: any) {
    console.error("Error syncing .dic file:", error);
    return { success: false, error: error.message };
  }
}

export async function syncAffFileAction(language: string) {
  if (!["uz_Latn_UZ", "uz_Cyrl_UZ"].includes(language)) {
    return { success: false, error: "Invalid language or type" };
  }

  try {
    const filePath = path.join(
      DICTIONARY_BASE_PATH,
      language,
      `${language}.aff`,
    );
    const sp = new Dictionary();

    const parsedAFF: Record<string, Rule> = sp._parseAFF(
      fs.readFileSync(filePath, "utf8"),
    );
    const affixRuleEntries: {
      groupId: number;
      add?: string;
      omit?: string;
      match?: string;
    }[] = [];

    await db.transaction(async (tx) => {
      for (const flag in parsedAFF) {
        const rule = parsedAFF[flag];

        // Insert or retrieve affix group
        const [res] = await tx
          .insert(affixGroups)
          .values({
            lang_id: 1,
            type: rule.type,
            flag,
            multiUse: rule.combineable,
          })
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
                  eq(affixGroups.lang_id, 1), // Ensure correct language
                  eq(affixGroups.type, rule.type), // Ensure correct affix type (PFX/SFX)
                  eq(affixGroups.flag, flag), // Ensure correct flag
                ),
              )
          )[0]?.id;

        if (!finalGroupId) continue;

        // Collect affix rules for bulk insert
        rule.entries.forEach((entry) => {
          affixRuleEntries.push({
            groupId: finalGroupId,
            add: entry.add,
            omit: entry.remove?.toString(),
            match: entry.match?.toString(),
          });
        });
      }

      // Bulk insert affix rules
      if (affixRuleEntries.length > 0) {
        await tx.insert(affixRules).values(affixRuleEntries);
      }
    });

    return { success: true, count: affixRuleEntries.length };
  } catch (error: any) {
    console.error("Error syncing .aff file:", error);
    return { success: false, error: error.message };
  }
}
