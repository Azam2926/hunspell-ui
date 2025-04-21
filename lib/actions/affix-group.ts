"use server";

import { db } from "@/lib/db";
import { AffixGroup, affixGroups, Language } from "@/lib/db/schema";
import { and, count, eq } from "drizzle-orm";
import { PaginationState } from "@tanstack/react-table";

export async function getDataAction(
  language: Language,
  state?: PaginationState,
): Promise<AffixGroup[]> {
  if (!state) return db.select().from(affixGroups);

  return db
    .select()
    .from(affixGroups)
    .where(eq(affixGroups.lang_id, language.id))
    .limit(state.pageSize)
    .offset(state.pageIndex * state.pageSize);
}

export async function getSuffixesAction(
  language: Language,
): Promise<AffixGroup[]> {
  return db
    .select()
    .from(affixGroups)
    .where(
      and(eq(affixGroups.type, "SFX"), eq(affixGroups.lang_id, language.id)),
    )
    .orderBy(affixGroups.flag);
}

export async function getPrefixesAction(
  language: Language,
): Promise<AffixGroup[]> {
  return db
    .select()
    .from(affixGroups)
    .where(
      and(eq(affixGroups.type, "PFX"), eq(affixGroups.lang_id, language.id)),
    )
    .orderBy(affixGroups.flag);
}

export async function getCountAction(language: Language) {
  const [result] = await db
    .select({ count: count() })
    .from(affixGroups)
    .where(eq(affixGroups.lang_id, language.id));
  return result.count;
}
