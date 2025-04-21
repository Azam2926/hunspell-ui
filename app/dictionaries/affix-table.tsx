"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  getPrefixesAction,
  getSuffixesAction,
} from "@/lib/actions/affix-group";
import { useLanguage } from "@/contexts/language/LanguageContext";
import { useEffect, useState } from "react";
import { AffixGroup } from "@/lib/db/schema";
import { Info } from "lucide-react";

export default function AffixTable() {
  const { currentLanguage } = useLanguage();
  const [affixGroups, setAffixGroups] = useState<{
    sfxs: AffixGroup[];
    pfxs: AffixGroup[];
  }>({ sfxs: [], pfxs: [] });

  useEffect(() => {
    if (!currentLanguage) return;

    const fetchData = async () => {
      const affixGroups = {
        sfxs: await getSuffixesAction(currentLanguage),
        pfxs: await getPrefixesAction(currentLanguage),
      };
      setAffixGroups(affixGroups);
    };

    fetchData();
  }, [currentLanguage]);
  return (
    <div className="flex grow gap-2">
      {currentLanguage && affixGroups.pfxs.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" title="Prefikslar">
              <Info className="opacity-50" />
              Prefikslar
            </CardTitle>
            <CardDescription>
              So&#39;z oldidan keladigan qo'shimchalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentLanguage && <div>Loading ...</div>}
            <Table>
              <TableBody>
                {affixGroups.pfxs.map((affx) => (
                  <TableRow key={affx.id}>
                    <TableCell className="font-medium">{affx.flag}</TableCell>
                    <TableCell>{affx.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {currentLanguage && affixGroups.sfxs.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" title="Prefikslar">
              <Info className="opacity-50" />
              Suffikslar
            </CardTitle>
            <CardDescription>
              So&#39;z ketidan keladigan qo'shimchalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentLanguage && <div>Loading ...</div>}
            <Table>
              <TableBody>
                {affixGroups.sfxs.map((affx) => (
                  <TableRow key={affx.id}>
                    <TableCell className="font-medium">{affx.flag}</TableCell>
                    <TableCell>{affx.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
