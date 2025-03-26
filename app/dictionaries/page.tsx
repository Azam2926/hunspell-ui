import { Suspense } from "react";
import WordsTable from "@/app/dictionaries/table";
import { getCountAction, getDataAction } from "@/lib/actions/dictionary";
import AddWordButton from "@/app/dictionaries/add-word-button";

export default function Page() {
  return (
    <div className="px-4">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="mb-6 text-3xl font-bold">Dictionaries</h1>
          <p className="text-muted-foreground mb-8">
            Manage words in the dictionary
          </p>
        </div>
        <AddWordButton />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <WordsTable
          getDataAction={getDataAction}
          getCountAction={getCountAction}
        />
      </Suspense>
    </div>
  );
}
