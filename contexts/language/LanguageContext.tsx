"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/lib/db/schema";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export interface LanguageContextType {
  currentLanguage: Language | null;
  language_with_code: string;
  languages: Language[];
  setCurrentLanguage: (language: Language) => void;
  isLoading: boolean;
  error: Error | null;
  mutateLanguages: () => Promise<Language[] | undefined>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguages?: Language[];
}

export function LanguageProvider({
  children,
  initialLanguages = [],
}: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);

  // Use SWR for data fetching with initial data if provided
  const {
    data: languages = initialLanguages,
    error,
    isLoading,
    mutate: mutateLanguages,
  } = useSWR<Language[]>("/api/languages", fetcher, {
    fallbackData: initialLanguages,
    revalidateOnFocus: false, // Don't refetch when a window regains focus
    dedupingInterval: 60000, // Deduplicate requests within 1 minute
  });

  // Set default language when language data changes
  useEffect(() => {
    if (languages.length > 0 && !currentLanguage) {
      setCurrentLanguage(languages[0]);
    }
  }, [languages, currentLanguage]);

  const value = {
    currentLanguage,
    language_with_code: currentLanguage
      ? `${currentLanguage.name}_${currentLanguage.code}`
      : "",
    languages,
    setCurrentLanguage,
    isLoading,
    error,
    mutateLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
