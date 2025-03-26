"use server";

import { db } from "@/lib/db";
import { AffixRule, affixRules } from "@/lib/db/schema";
import { AnyColumn, asc, count, desc } from "drizzle-orm";
import { PaginationState, SortingState } from "@tanstack/react-table";

export async function getDataAction(
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

  return db
    .select()
    .from(affixRules)
    .orderBy(
      ...sorting?.map((sort) =>
        sort.desc
          ? desc(orderByOptions[sort.id])
          : asc(orderByOptions[sort.id]),
      ),
    )
    .limit(state.pageSize)
    .offset(state.pageIndex * state.pageSize);
}

export async function getCountAction() {
  const [result] = await db.select({ count: count() }).from(affixRules);
  return result.count;
}
