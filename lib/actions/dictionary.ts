"use server";

import { db } from "@/lib/db";
import { dictionaryEntries, languages } from "@/lib/db/schema";
import { AnyColumn, asc, count, desc, eq, ilike } from "drizzle-orm";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { revalidatePath } from "next/cache";

export type DictionaryData = {
  id: number;
  word: string;
  sfxs: string[] | null;
  pfxs: string[] | null;
  language: { id: number; name: string; code: string };
  createdAt: Date | null;
};

export async function getDataAction(
  search: string,
  sorting: SortingState,
  state?: PaginationState,
): Promise<DictionaryData[]> {
  console.log("Search:", search);
  if (!sorting || sorting?.length === 0) {
    sorting = [{ id: "id", desc: true }];
  }
  const orderByOptions: Record<string, AnyColumn> = {
    id: dictionaryEntries.id,
    word: dictionaryEntries.word,
  };

  const selects = {
    id: dictionaryEntries.id,
    word: dictionaryEntries.word,
    sfxs: dictionaryEntries.sfxs,
    pfxs: dictionaryEntries.pfxs,
    language: {
      id: languages.id,
      name: languages.name,
      code: languages.code,
    },
    createdAt: dictionaryEntries.createdAt,
  };

  if (!state)
    return db
      .select(selects)
      .from(dictionaryEntries)
      .where(ilike(dictionaryEntries.word, `%${search}%`))
      .orderBy(
        ...sorting?.map((sort) =>
          sort.desc
            ? desc(orderByOptions[sort.id])
            : asc(orderByOptions[sort.id]),
        ),
      )
      .innerJoin(languages, eq(dictionaryEntries.langId, languages.id));

  return db
    .select(selects)
    .from(dictionaryEntries)
    .where(ilike(dictionaryEntries.word, `%${search}%`))
    .orderBy(
      ...sorting?.map((sort) =>
        sort.desc
          ? desc(orderByOptions[sort.id])
          : asc(orderByOptions[sort.id]),
      ),
    )
    .limit(state.pageSize)
    .offset(state.pageIndex * state.pageSize)
    .innerJoin(languages, eq(dictionaryEntries.langId, languages.id));
}

export async function getCountAction() {
  const [result] = await db.select({ count: count() }).from(dictionaryEntries);
  return result.count;
}

// New action to add a dictionary entry
export async function addAction(data: {
  word: string;
  langId: number;
  sfxs?: string[];
  pfxs?: string[];
}) {
  try {
    await db.insert(dictionaryEntries).values({
      word: data.word,
      langId: data.langId,
      sfxs: data.sfxs || [],
      pfxs: data.pfxs || [],
    });

    // Revalidate the words page to show the new entry
    revalidatePath("/words");

    return { success: true };
  } catch (error) {
    console.error("Error adding dictionary entry:", error);
    throw new Error("Failed to add dictionary entry");
  }
}

// Update dictionary entry
export async function updateAction(
  id: number,
  data: {
    word?: string;
    langId?: number;
    sfxs?: string[];
    pfxs?: string[];
  },
) {
  try {
    await db
      .update(dictionaryEntries)
      .set({
        word: data.word,
        langId: data.langId,
        sfxs: data.sfxs,
        pfxs: data.pfxs,
      })
      .where(eq(dictionaryEntries.id, id));

    // Revalidate the words page to show the updated entry
    revalidatePath("/words");

    return { success: true };
  } catch (error) {
    console.error("Error updating dictionary entry:", error);
    throw new Error("Failed to update dictionary entry");
  }
}

// Delete dictionary entry
export async function deleteAction(id: number) {
  try {
    await db.delete(dictionaryEntries).where(eq(dictionaryEntries.id, id));

    // Revalidate the words page to show the deletion
    revalidatePath("/words");

    return { success: true };
  } catch (error) {
    console.error("Error deleting dictionary entry:", error);
    throw new Error("Failed to delete dictionary entry");
  }
}
