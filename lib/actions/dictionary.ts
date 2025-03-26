"use server";

import { db } from "@/lib/db";
import { dictionaryEntries, DictionaryEntry } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { PaginationState } from "@tanstack/react-table";
import { revalidatePath } from "next/cache";

export async function getDataAction(
  state?: PaginationState,
): Promise<DictionaryEntry[]> {
  if (!state) return db.select().from(dictionaryEntries);

  return db
    .select()
    .from(dictionaryEntries)
    .limit(state.pageSize)
    .offset(state.pageIndex * state.pageSize);
}

export async function getCountAction() {
  const [result] = await db.select({ count: count() }).from(dictionaryEntries);
  return result.count;
}

// New action to add a dictionary entry
export async function addAction(data: {
  word: string;
  langId: number;
  affixFlags?: string[];
}) {
  try {
    await db.insert(dictionaryEntries).values({
      word: data.word,
      langId: data.langId,
      affixFlags: data.affixFlags || [],
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
    affixFlags?: string[];
  },
) {
  try {
    await db
      .update(dictionaryEntries)
      .set({
        word: data.word,
        langId: data.langId,
        affixFlags: data.affixFlags,
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
