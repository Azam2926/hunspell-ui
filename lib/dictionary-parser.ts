/**
 * Utility functions for parsing and working with .dic and .aff files
 */

/**
 * Parse a .dic file content
 * @param content The content of the .dic file
 * @returns Parsed dictionary entries
 */
export function parseDictionaryFile(content: string) {
  const lines = content.split("\n")
  const entries = []

  // Skip the first line (word count)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Parse line (format: word/flags)
    const parts = line.split("/")
    const word = parts[0]
    const flags = parts[1] || ""

    entries.push({ word, flags })
  }

  return entries
}

/**
 * Parse an .aff file content
 * @param content The content of the .aff file
 * @returns Parsed affix rules
 */
export function parseAffixFile(content: string) {
  const lines = content.split("\n")
  const prefixes = []
  const suffixes = []

  let currentSection = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith("#")) continue

    // Check for section headers
    if (line.startsWith("PFX")) {
      currentSection = "prefix"
      // Parse prefix rule
      const parts = line.split(/\s+/)
      if (parts.length >= 5) {
        prefixes.push({
          flag: parts[1],
          stripping: parts[2],
          addition: parts[3],
          condition: parts[4],
        })
      }
    } else if (line.startsWith("SFX")) {
      currentSection = "suffix"
      // Parse suffix rule
      const parts = line.split(/\s+/)
      if (parts.length >= 5) {
        suffixes.push({
          flag: parts[1],
          stripping: parts[2],
          addition: parts[3],
          condition: parts[4],
        })
      }
    }
  }

  return { prefixes, suffixes }
}

/**
 * Generate a .dic file content from word entries
 * @param entries Array of word entries
 * @returns Generated .dic file content
 */
export function generateDictionaryFile(entries: Array<{ word: string; flags?: string }>) {
  // First line is the word count
  let content = `${entries.length}\n`

  // Add each word entry
  for (const entry of entries) {
    if (entry.flags) {
      content += `${entry.word}/${entry.flags}\n`
    } else {
      content += `${entry.word}\n`
    }
  }

  return content
}

/**
 * Generate an .aff file content from affix rules
 * @param prefixes Array of prefix rules
 * @param suffixes Array of suffix rules
 * @returns Generated .aff file content
 */
export function generateAffixFile(
  prefixes: Array<{ flag: string; stripping: string; addition: string; condition: string }>,
  suffixes: Array<{ flag: string; stripping: string; addition: string; condition: string }>,
) {
  let content = "SET UTF-8\n\n"

  // Add prefix rules
  if (prefixes.length > 0) {
    content += `PFX ${prefixes[0].flag} Y ${prefixes.length}\n`
    for (const prefix of prefixes) {
      content += `PFX ${prefix.flag} ${prefix.stripping} ${prefix.addition} ${prefix.condition}\n`
    }
    content += "\n"
  }

  // Add suffix rules
  if (suffixes.length > 0) {
    content += `SFX ${suffixes[0].flag} Y ${suffixes.length}\n`
    for (const suffix of suffixes) {
      content += `SFX ${suffix.flag} ${suffix.stripping} ${suffix.addition} ${suffix.condition}\n`
    }
  }

  return content
}

