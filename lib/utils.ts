import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from "@/lib/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a language identifier in the format "name_code" (e.g., "uz_Latn_UZ")
 * @param language The language object containing name and code
 * @returns Formatted language identifier string
 * @throws Error if language parameters are invalid
 */
export function formatLanguageIdentifier(language: Language): string {
  if (!language?.name || !language?.code) {
    throw new Error("Invalid language: name and code are required");
  }
  return `${language.name}_${language.code}`;
}

export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
  });
