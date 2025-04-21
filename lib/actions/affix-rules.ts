"use server";

import { db } from "@/lib/db";
import { affixGroups, AffixRule, affixRules, Language } from "@/lib/db/schema";
import { AnyColumn, asc, count, desc, eq } from "drizzle-orm";
import { PaginationState, SortingState } from "@tanstack/react-table";

export async function getDataAction(
  language: Language,
  state: PaginationState,
  sorting: SortingState,
): Promise<AffixRule[]> {
  if (!sorting || sorting?.length === 0) {
    sorting = [{ id: "id", desc: true }];
  }

  const orderByOptions: Record<string, AnyColumn> = {
    id: affixRules.id,
    groupId: affixRules.groupId,
    omit: affixRules.omit,
    add: affixRules.add,
  };

  return (
    await db
      .select()
      .from(affixRules)
      .leftJoin(affixGroups, eq(affixGroups.id, affixRules.groupId))
      .where(eq(affixGroups.lang_id, language.id))
      .orderBy(
        ...sorting?.map((sort) =>
          sort.desc
            ? desc(orderByOptions[sort.id])
            : asc(orderByOptions[sort.id]),
        ),
      )
      .limit(state.pageSize)
      .offset(state.pageIndex * state.pageSize)
  ).map((rule) => rule.affix_rules);
}

export async function getCountAction(language: Language) {
  const [result] = await db
    .select({ count: count() })
    .from(affixRules)
    .leftJoin(affixGroups, eq(affixGroups.id, affixRules.groupId))
    .where(eq(affixGroups.lang_id, language.id));
  return result.count;
}
