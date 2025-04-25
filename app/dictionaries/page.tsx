import { AddWordForm } from "@/app/dictionaries/add-word-form";
import { Suspense } from "react";
import WordsTable from "@/app/dictionaries/table";
import { getCountAction, getDataAction } from "@/lib/actions/dictionary";
import AffixTable from "@/app/dictionaries/affix-table";

export default async function Page() {
  return (
    <div className="px-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="mb-2 text-3xl font-bold">Lug&#39;at</h1>
          <p className="text-muted-foreground mb-8">
            Lug&#39;atdagi so&apos;zlarni boshqarish
          </p>
        </div>
        Umumiy so'zlar 1554
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <AddWordForm />
          <AffixTable />
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <WordsTable
            getDataAction={getDataAction}
            getCountAction={getCountAction}
          />
        </Suspense>
      </div>
    </div>
  );
}
