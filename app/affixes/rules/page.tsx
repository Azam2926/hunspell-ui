import React, { Suspense } from "react";
import AffixRulesTable from "@/app/affixes/rules/table";
import { getCountAction, getDataAction } from "@/lib/actions/affix-rules";

export default async function Page() {
  return (
    <div className="px-4 lg:px-6">
      <h1 className="mb-6 text-3xl font-bold">Affix Rules</h1>
      <p className="text-muted-foreground mb-8">
        Manage affixes in the dictionary database
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <AffixRulesTable
          getDataAction={getDataAction}
          getCountAction={getCountAction}
        />
      </Suspense>
    </div>
  );
}
