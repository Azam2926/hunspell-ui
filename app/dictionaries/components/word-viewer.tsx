"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { useLanguage } from "@/contexts/language/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Type definitions for better code structure
interface Rule {
  match?: string;
  omit?: string;
  add: string;
}

interface Group {
  flag: string;
  id: string;
}

interface GroupRules {
  group: Group;
  rules: Rule[];
}

interface WordViewerProps {
  word: string;
  sfxs?: string[];
  pfxs?: string[];
}

export default function WordViewer({
  word,
  pfxs = [],
  sfxs = [],
}: WordViewerProps) {
  const { currentLanguage } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // API fetch with proper query parameters
  const { data: groupRules, isLoading } = useSWR<GroupRules[]>(
    currentLanguage?.id
      ? `/api/affix-rules?pfxs=${pfxs?.join(",")}&sfxs=${sfxs?.join(",")}&language=${currentLanguage.id}`
      : null,
    fetcher,
  );

  // Process each rule to generate the word forms
  const processRule = (rule: Rule, wordBase: string): string | null => {
    let tempWord = wordBase;

    // Only process if there's no match condition or if the match condition is met
    if (!rule.match || tempWord.match(new RegExp(rule.match.slice(1, -1)))) {
      // Apply omit pattern if provided
      if (rule.omit) {
        tempWord = tempWord.replace(new RegExp(rule.omit.slice(1, -1)), "");
      }

      // Return the modified word with the suffix
      return `${tempWord}${rule.add}`;
    }

    return null;
  };

  // Toggle expanded state for a group
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Copy word to clipboard
  const copyToClipboard = async (text: string) => {
    toast.info("So'z: " + text);
    // await navigator.clipboard.writeText(text);
    setSelectedWord(text);
    setTimeout(() => setSelectedWord(null), 1500);
  };

  if (!word) return null;

  if (isLoading) {
    return (
      <div className="max-w-[500px] rounded-md border p-6 shadow-sm">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-sm text-gray-500">Loading word forms...</p>
        </div>
      </div>
    );
  }

  if (!groupRules || groupRules.length === 0) {
    return (
      <div className="max-w-[500px] rounded-md border p-6 shadow-sm">
        <p className="text-center text-gray-500">
          So'z ko'rinishlarini ko'rish uchun guruh tanlang;
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] overflow-hidden rounded-lg">
      <div className="border-b px-4 py-3">
        <h3 className="font-medium">So&apos;zning ko&apos;rinishlari</h3>
      </div>

      <div className="overflow-y-auto p-4">
        <ul className="space-y-4">
          {groupRules?.map(
            (item, index) =>
              item &&
              item.group && (
                <li key={`group-${index}`} className="rounded-md border">
                  <button
                    onClick={() => toggleGroup(item.group.id)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left"
                    aria-expanded={expandedGroups[item.group.id]}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.group.flag}</Badge>
                      <span className="text-sm font-medium">
                        {item.rules
                          .slice(0, 10)
                          .map((rule) => processRule(rule, word))
                          .filter(Boolean)
                          .join(", ")}
                        {item.rules.length > 10 && "..."}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {expandedGroups[item.group.id] ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </span>
                  </button>

                  {expandedGroups[item.group.id] && (
                    <div className="border-t px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.rules.map((rule, ruleIndex) => {
                          const processedWord = processRule(rule, word);
                          if (!processedWord) return null;

                          return (
                            <button
                              key={`word-${ruleIndex}`}
                              onClick={() => copyToClipboard(processedWord)}
                              className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-all ${
                                selectedWord === processedWord
                                  ? "bg-green-100 text-green-700"
                                  : "hover:bg-blue-50 hover:text-gray-600"
                              }`}
                            >
                              {processedWord}
                              {selectedWord === processedWord && (
                                <span className="ml-1 text-xs">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </li>
              ),
          )}
        </ul>
      </div>
    </div>
  );
}
