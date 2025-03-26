/*
SFX <Flag> <Cross-Product> <Number of Rules>
SFX <Flag> <Stripped> <Added> <Condition> [Morphological Information]
PFX <Flag> <Cross-Product> <Number of Rules>
PFX <Flag> <Stripped> <Added> <Condition> [Morphological Information]

Explanation of Parameters:
SFX(PFX) → Declares this as a suffix(prefix) rule.
<Flag> → A single character (or Unicode) identifier used in the .dic file to apply the suffix(prefix).
<Cross-Product> → Y or N. If Y, the suffix(prefix) can be applied to words that already have another affix.
<Number of Rules> → The number of rules listed under this suffix(prefix).
Suffix<Stripped> → The ending to remove from the root word before adding the suffix.
Prefix<Stripped> → The beginning of the word to remove before adding the prefix.
<Added> → The suffix(prefix) to add to the word.
<Condition> → A pattern that the root word must match before the suffix(prefix) is applied (regex-like syntax).
[Morphological Information] (Optional) → Provides extra information about the word transformation.
 */
/**
 * Interface representing the dictionary data source containing affix and dictionary files.
 */
interface DictionaryData {
  /** The content of the affix (.aff) file */
  aff?: string;
  /** The content of the dictionary (.dic) file */
  dic?: string;
}

/**
 * Interface representing an affix rule (prefix or suffix).
 */
export interface Rule {
  /** The rule type: "PFX" (prefix) or "SFX" (suffix) */
  type: string;
  /** Whether this rule can be combined with other rules */
  combineable: boolean;
  /** The entries for this rule */
  entries: RuleEntry[];
}

/**
 * Interface representing an entry in an affix rule.
 */
interface RuleEntry {
  /** The characters to add (affix) */
  add: string;
  /** Additional rule codes that can be applied after this one */
  continuationClasses?: string[];
  /** Regular expression pattern that the word must match for this rule to apply */
  match?: RegExp;
  /** Characters or pattern to remove before applying the affix */
  remove?: RegExp | string;
}

/**
 * Interface representing the complete dictionary object structure with all its components.
 */
interface DictionaryObject {
  /** Map of rule codes to rule definitions */
  rules: Record<string, Rule>;
  /** Lookup table of words and their associated rule codes */
  dictionaryTable: Record<string, string[][]>;
  /** List of compound rules (either as strings or compiled RegExp) */
  compoundRules: (RegExp | string)[];
  /** Map of compound rule codes to the words they apply to */
  compoundRuleCodes: Record<string, string[]>;
  /** List of string replacements [from, to] */
  replacementTable: string[][];
  /** Dictionary flags and their values */
  flags: Record<string, string>;
}

/**
 * Dictionary class for processing spell-checking dictionaries in Hunspell format.
 * Handles parsing and applying affix rules to generate word forms.
 */
class Dictionary {
  /** Map of rule codes to rule definitions */
  rules: Record<string, Rule> = {};

  /** Lookup table of words and their associated rule codes */
  dictionaryTable: Record<string, string[][]> = {};

  /** List of compound rules (either as strings or compiled RegExp) */
  compoundRules: (RegExp | string)[] = [];

  /** Map of compound rule codes to the words they apply to */
  compoundRuleCodes: Record<string, string[]> = {};

  /** List of string replacements [from, to] */
  replacementTable: string[][] = [];

  /** Dictionary flags and their values */
  flags: Record<string, string> = {};

  /**
   * Creates a new Dictionary instance.
   *
   * @param dict Optional dictionary object to load
   */
  constructor(dict?: DictionaryObject) {
    if (dict) this.load(dict);
  }

  /**
   * Loads dictionary data from a DictionaryObject.
   *
   * @param obj The dictionary object to load
   */
  load(obj: Partial<DictionaryObject>): void {
    for (const i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        this[i as keyof Dictionary] = obj[i as keyof DictionaryObject] as any;
      }
    }
  }

  /**
   * Returns the dictionary as a serializable object.
   *
   * @returns A plain object representation of the dictionary
   */
  toJSON(): DictionaryObject {
    return {
      rules: this.rules,
      dictionaryTable: this.dictionaryTable,
      compoundRules: this.compoundRules,
      compoundRuleCodes: this.compoundRuleCodes,
      replacementTable: this.replacementTable,
      flags: this.flags,
    };
  }

  /**
   * Parses dictionary data from affix (.aff) and dictionary (.dic) files.
   * Processes the rules and builds the necessary lookup tables.
   *
   * @param dictionary The dictionary data containing affix and dictionary content
   * @throws Error if either the affix or dictionary content is missing
   */
  parse(dictionary: DictionaryData): void {
    if (!dictionary.aff && !dictionary.dic) {
      throw new Error("Invalid dictionary to parse");
    }

    this.rules = this._parseAFF("" + dictionary.aff!);

    // Save the rule codes that are used in compound rules.
    this.compoundRuleCodes = {};

    for (let i = 0, _len = this.compoundRules.length; i < _len; i++) {
      const rule = this.compoundRules[i] as string;

      for (let j = 0, _jlen = rule.length; j < _jlen; j++) {
        this.compoundRuleCodes[rule[j]] = [];
      }
    }

    // If we add this ONLYINCOMPOUND flag to this.compoundRuleCodes, then _parseDIC
    // will do the work of saving the list of words that are compound-only.
    if ("ONLYINCOMPOUND" in this.flags) {
      this.compoundRuleCodes[this.flags.ONLYINCOMPOUND] = [];
    }

    this.dictionaryTable = this._parseDIC("" + dictionary.dic!);

    // Get rid of any codes from the compound rule codes that are never used
    // (or that were special regex characters).  Not especially necessary...
    for (const i in this.compoundRuleCodes) {
      if (this.compoundRuleCodes[i].length === 0) {
        delete this.compoundRuleCodes[i];
      }
    }

    // Build the full regular expressions for each compound rule.
    // I have a feeling (but no confirmation yet) that this method of
    // testing for compound words is probably slow.
    for (let i = 0, _len = this.compoundRules.length; i < _len; i++) {
      const ruleText = this.compoundRules[i] as string;

      let expressionText = "";

      for (let j = 0, _jlen = ruleText.length; j < _jlen; j++) {
        const character = ruleText[j];

        if (character in this.compoundRuleCodes) {
          expressionText +=
            "(" + this.compoundRuleCodes[character].join("|") + ")";
        } else {
          expressionText += character;
        }
      }

      this.compoundRules[i] = new RegExp(expressionText, "i");
    }
  }

  /**
   * Parse the rules out from a .aff file.
   *
   * @param {string} data The contents of the affix file.
   * @returns {Record<string, Rule>} The rules from the file.
   */
  /**
   * Parses the affix (.aff) file content and extracts rules and flags.
   * Handles prefix (PFX) and suffix (SFX) rules, compound rules, and replacement tables.
   *
   * @param data The affix file content
   * @returns A map of rule codes to rule definitions
   */
  _parseAFF(data: string): Record<string, Rule> {
    const rules: Record<string, Rule> = {};

    // Remove comment lines
    data = this._removeAffixComments(data);

    const lines = data.split("\n");

    for (let i = 0, _len = lines.length; i < _len; i++) {
      const line = lines[i];

      // Split line into parts (rule type, code, etc.)
      const definitionParts = line.split(/\s+/);

      const ruleType = definitionParts[0];

      if (ruleType === "PFX" || ruleType === "SFX") {
        const ruleCode = definitionParts[1];
        const combineable = definitionParts[2];
        const numEntries = parseInt(definitionParts[3], 10);

        const entries: RuleEntry[] = [];

        for (let j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
          const line = lines[j];

          const lineParts = line.split(/\s+/);
          const charactersToRemove = lineParts[2];

          const additionParts = lineParts[3].split("/");

          let charactersToAdd = additionParts[0];
          if (charactersToAdd === "0") charactersToAdd = "";

          const continuationClasses = this.parseRuleCodes(additionParts[1]);

          const regexToMatch = lineParts[4];

          const entry: RuleEntry = {
            add: charactersToAdd,
          };

          if (continuationClasses.length > 0)
            entry.continuationClasses = continuationClasses;

          if (regexToMatch !== ".") {
            if (ruleType === "SFX") {
              entry.match = new RegExp(regexToMatch + "$");
            } else {
              entry.match = new RegExp("^" + regexToMatch);
            }
          }

          if (charactersToRemove !== "0") {
            if (ruleType === "SFX") {
              entry.remove = new RegExp(charactersToRemove + "$");
            } else {
              entry.remove = charactersToRemove;
            }
          }

          entries.push(entry);
        }

        rules[ruleCode] = {
          type: ruleType,
          combineable: combineable === "Y",
          entries: entries,
        };

        i += numEntries;
      } else if (ruleType === "COMPOUNDRULE") {
        const numEntries = parseInt(definitionParts[1], 10);

        for (let j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
          const line = lines[j];

          const lineParts = line.split(/\s+/);
          this.compoundRules.push(lineParts[1]);
        }

        i += numEntries;
      } else if (ruleType === "REP") {
        const lineParts = line.split(/\s+/);

        if (lineParts.length === 3) {
          this.replacementTable.push([lineParts[1], lineParts[2]]);
        }
      } else {
        // ONLYINCOMPOUND
        // COMPOUNDMIN
        // FLAG
        // KEEPCASE
        // NEEDAFFIX

        this.flags[ruleType] = definitionParts[1];
      }
    }

    return rules;
  }

  /**
   * Removes comment lines and then cleans up blank lines and trailing whitespace.
   *
   * @param {string} data The data from an affix file.
   * @return {string} The cleaned-up data.
   */
  /**
   * Removes comment lines and cleans up whitespace in affix file content.
   * Comments start with '#' and continue to the end of the line.
   *
   * @param data The affix file content
   * @returns The cleaned affix content
   */
  _removeAffixComments(data: string): string {
    // Remove comments (everything from # to the end of the line)
    data = data.replace(/#.*$/gm, "");

    // Trim each line (remove leading and trailing whitespace)
    data = data.replace(/^\s\s*/m, "").replace(/\s\s*$/m, "");

    // Remove multiple consecutive blank lines, replacing with a single newline
    data = data.replace(/\n{2,}/g, "\n");

    // Trim the entire string (remove leading and trailing whitespace)
    data = data.replace(/^\s\s*/, "").replace(/\s\s*$/, "");

    return data;
  }

  /**
   * Parses the words out from the .dic file.
   *
   * @param {string} data The data from the dictionary file.
   * @returns {Record<string, string[][]>} The lookup table containing all of the words and
   *                 word forms from the dictionary.
   */
  /**
   * Parses the dictionary (.dic) file content and builds the dictionary lookup table.
   * Applies affix rules to generate all word forms.
   *
   * @param data The dictionary file content
   * @returns The dictionary lookup table mapping words to their rule codes
   */
  _parseDIC(data: string): Record<string, string[][]> {
    data = this._removeDicComments(data);

    const lines = data.split("\n");
    const dictionaryTable: Record<string, string[][]> = {};

    /**
     * Helper function to add a word to the dictionary table.
     * Handles cases where the same word appears multiple times with different rule sets.
     *
     * @param word The word to add
     * @param rules The rules that apply to this word
     */
    const addWord = (word: string, rules: string[]) => {
      // Some dictionaries will list the same word multiple times with different rule sets.
      if (!(word in dictionaryTable) || !Array.isArray(dictionaryTable[word])) {
        dictionaryTable[word] = [];
      }

      dictionaryTable[word].push(rules);
    };

    // The first line is the number of words in the dictionary.
    for (let i = 1, _len = lines.length; i < _len; i++) {
      const line = lines[i];

      const parts = line.split("/", 2);

      const word = parts[0];

      // Now for each affix rule, generate that form of the word.
      if (parts.length > 1) {
        const ruleCodesArray = this.parseRuleCodes(parts[1]);

        // Save the ruleCodes for compound word situations.
        if (
          !("NEEDAFFIX" in this.flags) ||
          ruleCodesArray.indexOf(this.flags.NEEDAFFIX) === -1
        ) {
          addWord(word, ruleCodesArray);
        }

        for (let j = 0, _jlen = ruleCodesArray.length; j < _jlen; j++) {
          const code = ruleCodesArray[j];

          const rule = this.rules[code];

          if (rule) {
            const newWords = this._applyRule(word, rule);

            for (let ii = 0, _iilen = newWords.length; ii < _iilen; ii++) {
              const newWord = newWords[ii];

              addWord(newWord, []);

              if (rule.combineable) {
                for (let k = j + 1; k < _jlen; k++) {
                  const combineCode = ruleCodesArray[k];

                  const combineRule = this.rules[combineCode];

                  if (combineRule) {
                    if (
                      combineRule.combineable &&
                      rule.type !== combineRule.type
                    ) {
                      const otherNewWords = this._applyRule(
                        newWord,
                        combineRule,
                      );

                      for (
                        let iii = 0, _iiilen = otherNewWords.length;
                        iii < _iiilen;
                        iii++
                      ) {
                        const otherNewWord = otherNewWords[iii];
                        addWord(otherNewWord, []);
                      }
                    }
                  }
                }
              }
            }
          }

          if (code in this.compoundRuleCodes) {
            this.compoundRuleCodes[code].push(word);
          }
        }
      } else {
        addWord(word.trim(), []);
      }
    }

    return dictionaryTable;
  }

  /**
   * Removes comment lines and then cleans up blank lines and trailing whitespace.
   *
   * @param {string} data The data from a .dic file.
   * @return {string} The cleaned-up data.
   */
  /**
   * Removes comment lines from dictionary (.dic) file data.
   *
   * @param data The dictionary file content
   * @returns The cleaned dictionary content without comments
   * @note There's unreachable code after the first return statement that was
   *       present in the original implementation. It's kept for reference but
   *       never executed.
   */
  _removeDicComments(data: string): string {
    // I can't find any official documentation on it, but at least the de_DE
    // dictionary uses tab-indented lines as comments.

    // Remove comments
    data = data.replace(/^\t.*$/gm, "");

    return data;

    // Note: The code below is unreachable due to the return statement above
    // Keeping it here to match the original implementation

    // // Trim each line
    // data = data.replace(/^\s\s*/m, "").replace(/\s\s*$/m, "");
    //
    // // Remove blank lines.
    // data = data.replace(/\n{2,}/g, "\n");
    //
    // // Trim the entire string
    // data = data.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
    //
    // return data;
  }

  /**
   * Parses rule codes from a string based on the FLAG type in the dictionary.
   * Handles different FLAG types: default (single character), "long" (2-character),
   * and "num" (comma-separated numbers).
   *
   * @param textCodes The string containing rule codes
   * @returns An array of rule codes
   */
  parseRuleCodes(textCodes: string | undefined): string[] {
    if (!textCodes) {
      return [];
    } else if (!("FLAG" in this.flags)) {
      // Default flag type: each character is a flag
      return textCodes.split("");
    } else if (this.flags.FLAG === "long") {
      // Long flag type: each two characters is a flag
      const flags: string[] = [];

      for (let i = 0, _len = textCodes.length; i < _len; i += 2) {
        flags.push(textCodes.substr(i, 2));
      }

      return flags;
    } else if (this.flags.FLAG === "num") {
      // Numeric flag type: flags are comma-separated numbers
      return textCodes.split(",");
    }

    return [];
  }

  /**
   * Applies an affix rule to a word.
   *
   * @param {string} word The base word.
   * @param {Rule} rule The affix rule.
   * @returns {string[]} The new words generated by the rule.
   */
  /**
   * Applies an affix rule to a word to generate new word forms.
   * Handles both prefixes (PFX) and suffixes (SFX).
   * Can recursively apply continuation rules.
   *
   * @param word The base word to apply the rule to
   * @param rule The rule to apply
   * @returns An array of new words generated by applying the rule
   */
  _applyRule(word: string, rule: Rule): string[] {
    const entries = rule.entries;
    const newWords: string[] = [];

    for (let i = 0, _len = entries.length; i < _len; i++) {
      const entry = entries[i];

      // Only apply the rule if either there's no match pattern or the word matches the pattern
      if (!entry.match || word.match(entry.match)) {
        let newWord = word;

        // Apply character removal if specified
        if (entry.remove) {
          if (typeof entry.remove === "string") {
            // If it's a string (PFX rule), just remove the prefix
            if (rule.type === "PFX") {
              newWord = newWord.substring(entry.remove.length);
            }
          } else {
            // If it's a RegExp (SFX rule), use replace
            newWord = newWord.replace(entry.remove, "");
          }
        }

        // Add the affix (either at the end for suffix or beginning for prefix)
        if (rule.type === "SFX") {
          newWord = newWord + entry.add;
        } else {
          newWord = entry.add + newWord;
        }

        newWords.push(newWord);

        if (entry.continuationClasses) {
          for (
            let j = 0, _jlen = entry.continuationClasses.length;
            j < _jlen;
            j++
          ) {
            const continuationRule = this.rules[entry.continuationClasses[j]];

            if (continuationRule) {
              newWords.push(...this._applyRule(newWord, continuationRule));
            }
            /*
            else {
                // This shouldn't happen, but it does, at least in the de_DE dictionary.
                // I think the author mistakenly supplied lower-case rule codes instead
                // of upper-case.
            }
            */
          }
        }
      }
    }

    return newWords;
  }
}

export default Dictionary;
