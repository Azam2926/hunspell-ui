"use server";

import { db } from "@/lib/db";
import { AffixGroup, affixGroups } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { PaginationState } from "@tanstack/react-table";

export async function getDataAction(
  state?: PaginationState,
): Promise<AffixGroup[]> {
  if (!state) return db.select().from(affixGroups);

  return db
    .select()
    .from(affixGroups)
    .limit(state.pageSize)
    .offset(state.pageIndex * state.pageSize);
}

export async function getSuffixesAction(): Promise<AffixGroup[]> {
  return db
    .select()
    .from(affixGroups)
    .where(eq(affixGroups.type, "SFX"))
    .orderBy(affixGroups.flag);
}

export async function getPrefixesAction(): Promise<AffixGroup[]> {
  return db
    .select()
    .from(affixGroups)
    .where(eq(affixGroups.type, "PFX"))
    .orderBy(affixGroups.flag);
}

export async function getCountAction() {
  const [result] = await db.select({ count: count() }).from(affixGroups);
  return result.count;
}
