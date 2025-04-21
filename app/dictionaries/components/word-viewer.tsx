import { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { useLanguage } from "@/contexts/language/LanguageContext";
import { GroupRules } from "@/app/api/affix-rules/route";

interface WordViewerProps {
  word: string;
  sfxs?: string[];
  pfxs?: string[];
}

export default function WordViewer({ word, pfxs, sfxs }: WordViewerProps) {
  const { currentLanguage } = useLanguage();
  const { data }: { data: GroupRules[] } = useSWR(
    `/api/affix-rules?pfxs=${pfxs}&sfxs=${sfxs}&language=${currentLanguage?.id}`,
    fetcher,
  );
  useEffect(() => {}, [pfxs, sfxs]);
  console.log("data", data);
  if (!word) return null;
  return (
    <div className="max-w-[500px] overflow-auto">
      <ul>
        {data?.map((item, key) => {
          return (
            item && (
              <li
                key={key}
                className="flex gap-2"
                style={{ listStyle: "none" }}
              >
                <span>{item.group?.flag}:</span>
                <span>
                  {item.rules.map((rule, index) => {
                    if (index >= 10) {
                      if (index === 10) return "...";
                      return;
                    }
                    console.log("rule", rule);
                    console.log("word", word);
                    let tempWord = word;
                    if (!rule.match) {
                      if (rule.omit)
                        tempWord = tempWord.replace(
                          new RegExp(rule.omit.slice(1, -1)),
                          "",
                        );

                      return tempWord + rule.add + ", ";
                    }

                    if (
                      !(
                        rule.match &&
                        tempWord.match(new RegExp(rule.match.slice(1, -1)))
                      )
                    )
                      return;
                    console.log(
                      "new RegExp(rule.match.slice(1, -1))",
                      new RegExp(rule.match.slice(1, -1)),
                    );

                    if (rule.omit)
                      tempWord = tempWord.replace(
                        new RegExp(rule.omit.slice(1, -1)),
                        "",
                      );

                    return tempWord + rule.add + ", ";
                  })}
                </span>
              </li>
            )
          );
        })}
      </ul>
    </div>
  );
}
