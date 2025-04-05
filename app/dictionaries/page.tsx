import { AddWordForm } from "@/app/dictionaries/add-word-form";
import {
  getPrefixesAction,
  getSuffixesAction,
} from "@/lib/actions/affix-group";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Suspense } from "react";
import WordsTable from "@/app/dictionaries/table";
import { getCountAction, getDataAction } from "@/lib/actions/dictionary";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function Page() {
  const affixGroups = {
    sfxs: await getSuffixesAction(),
    pfxs: await getPrefixesAction(),
  };
  console.log("affixGroups asdad", affixGroups);
  return (
    <div className="px-4">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="mb-6 text-3xl font-bold">Dictionaries</h1>
          <p className="text-muted-foreground mb-8">
            Manage words in the dictionary
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <AddWordForm />
          <div className="flex grow gap-2">
            <Card className="w-full">
              <CardHeader>Prefixes</CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {affixGroups.pfxs.map((affx) => (
                      <TableRow key={affx.id}>
                        <TableCell className="font-medium">
                          {affx.flag}
                        </TableCell>
                        <TableCell>{affx.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>Suffixes</CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {affixGroups.sfxs.map((affx) => (
                      <TableRow key={affx.id}>
                        <TableCell className="font-medium">
                          {affx.flag}
                        </TableCell>
                        <TableCell>{affx.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
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
