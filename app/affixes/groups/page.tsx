import React, { Suspense } from "react";
import AffixGroupTable from "@/app/affixes/groups/table";
import { getCountAction, getDataAction } from "@/lib/actions/affix-group";

export default async function Page() {
  return (
    <div className="px-4 lg:px-6">
      <h1 className="mb-6 text-3xl font-bold">Affix Groups</h1>
      <p className="text-muted-foreground mb-8">
        Manage affixes in the dictionary database
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <AffixGroupTable
          getDataAction={getDataAction}
          getCountAction={getCountAction}
        />
      </Suspense>
    </div>
  );
}
