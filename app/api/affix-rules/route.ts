import { affixGroups, affixRules } from "@/lib/db/schema";
import { NextRequest } from "next/server";
import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";

export interface GroupRules {
  group: {
    id: number;
    type: "PFX" | "SFX";
    flag: string;
    description: string | null;
  } | null;
  rules: {
    id: number;
    omit: string | null;
    add: string;
    match: string | null;
  }[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sfxs =
    searchParams
      .get("sfxs")
      ?.split(",")
      ?.flatMap((i) => i.split("")) || [];
  const pfxs =
    searchParams
      .get("pfxs")
      ?.split(",")
      ?.flatMap((i) => i.split("")) || [];
  const language = Number(searchParams.get("language"));

  const data = await db
    .select({
      group: {
        id: affixGroups.id,
        type: affixGroups.type,
        flag: affixGroups.flag,
        description: affixGroups.description,
      },
      rule: {
        id: affixRules.id,
        omit: affixRules.omit,
        add: affixRules.add,
        match: affixRules.match,
      },
    })
    .from(affixRules)
    .leftJoin(affixGroups, eq(affixRules.groupId, affixGroups.id))
    .where(
      and(
        or(
          and(inArray(affixGroups.flag, pfxs), eq(affixGroups.type, "PFX")),
          and(inArray(affixGroups.flag, sfxs), eq(affixGroups.type, "SFX")),
        ),
        eq(affixGroups.lang_id, language),
      ),
    );
  const n = data.reduce((acc, { group, rule }) => {
    if (!group) return acc;

    if (!acc[group.id]) {
      acc[group.id] = {
        group,
        rules: [],
      };
    }

    acc[group.id].rules.push(rule);
    return acc;
  }, [] as GroupRules[]);

  return Response.json(n);
}
