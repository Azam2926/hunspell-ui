export class LatinCyrillicConverter {
  // Character mappings as static arrays
  private static alphaLatin: string[] = [
    "A",
    "B",
    "V",
    "G",
    "D",
    "E",
    "J",
    "Z",
    "I",
    "Y",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "R",
    "S",
    "T",
    "U",
    "F",
    "X",
    "Q",
    "H",
    "a",
    "b",
    "v",
    "g",
    "d",
    "e",
    "j",
    "z",
    "i",
    "y",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "r",
    "s",
    "t",
    "u",
    "f",
    "x",
    "q",
    "h",
    "'",
  ];

  private static alphaRus: string[] = [
    "А",
    "Б",
    "В",
    "Г",
    "Д",
    "Е",
    "Ж",
    "З",
    "И",
    "Й",
    "К",
    "Л",
    "М",
    "Н",
    "О",
    "П",
    "Р",
    "С",
    "Т",
    "У",
    "Ф",
    "Х",
    "Қ",
    "Ҳ",
    "а",
    "б",
    "в",
    "г",
    "д",
    "е",
    "ж",
    "з",
    "и",
    "й",
    "к",
    "л",
    "м",
    "н",
    "о",
    "п",
    "р",
    "с",
    "т",
    "у",
    "ф",
    "х",
    "қ",
    "ҳ",
    "ъ",
  ];

  private static alphaOddRus: string[] = [
    "А",
    "Б",
    "В",
    "Г",
    "Д",
    "Е",
    "Ж",
    "З",
    "И",
    "Й",
    "К",
    "Л",
    "М",
    "Н",
    "О",
    "П",
    "Р",
    "С",
    "Т",
    "У",
    "Ф",
    "Х",
    "Ғ",
    "Қ",
    "Ҳ",
    "Ў",
    "а",
    "б",
    "в",
    "г",
    "д",
    "е",
    "ж",
    "з",
    "и",
    "й",
    "к",
    "л",
    "м",
    "н",
    "о",
    "п",
    "р",
    "с",
    "т",
    "у",
    "ф",
    "х",
    "ғ",
    "қ",
    "ҳ",
    "ў",
  ];

  private static alpha: string[] = [
    "A",
    "B",
    "V",
    "G",
    "D",
    "E",
    "J",
    "Z",
    "I",
    "Y",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "R",
    "S",
    "T",
    "U",
    "F",
    "X",
    "G'",
    "Q",
    "H",
    "O'",
    "a",
    "b",
    "v",
    "g",
    "d",
    "e",
    "j",
    "z",
    "i",
    "y",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "r",
    "s",
    "t",
    "u",
    "f",
    "x",
    "g'",
    "q",
    "h",
    "o'",
  ];

  private static pairRus: string[] = ["Ё", "Ш", "Ю", "Я", "Ч"];
  private static pairLatUpper: string[] = ["YO", "SH", "YU", "YA", "CH"];
  private static pairLatLower: string[] = ["Yo", "Sh", "Yu", "Ya", "Ch"];
  private static cyrillicVowels: string[] = [
    "а",
    "о",
    "у",
    "и",
    "э",
    "е",
    "ё",
    "ю",
    "я",
    "А",
    "О",
    "У",
    "И",
    "Э",
    "Е",
    "Ё",
    "Ю",
    "Я",
  ];

  // Performance-optimized lookup maps
  private static latinToRusMap: Map<string, string> = new Map(
    this.alphaLatin.map((latin, index) => [latin, this.alphaRus[index]]),
  );

  private static rusToLatinMap: Map<string, string> = new Map(
    this.alphaOddRus.map((rus, index) => [rus, this.alpha[index]]),
  );

  // Reusable helper functions
  /** Checks if a character is uppercase */
  private static isUpperCase(char: string): boolean {
    return char === char.toUpperCase();
  }

  /** Determines if the character at the given index is the first in a word */
  private static isFirstCharOfWord(text: string, index: number): boolean {
    return index === 0 || [" ", "\n"].includes(text[index - 1]);
  }

  /** Finds all occurrences of words in text (case-insensitive) */
  private static searchWordInText(text: string, searchWord: string): string[] {
    const regex = new RegExp(searchWord, "gi");
    return text.match(regex) || [];
  }

  /** Converts only 'y' or 'Y' to 'й' or 'Й' */
  private static convertOnlyLetterY(text: string): string {
    return text.replace(/y/gi, (match) => (match === "Y" ? "Й" : "й"));
  }

  // Main conversion functions
  /**
   * Converts Latin text to Cyrillic
   * @param originalMessage The Latin text to convert
   * @returns The converted Cyrillic text
   */
  public static toCyrillic(originalMessage: string): string {
    let text = originalMessage;

    // Handle special words
    const specialWords = this.searchWordInText(text, "mayor|rayon|yogurt|yoga");
    for (const word of specialWords) {
      text = text.replace(word, this.convertOnlyLetterY(word));
    }

    // Preprocessing: Replace sequences and normalize apostrophes
    text = text
      .replace(/[`ʹʻʼʽˊˋ'']/g, "'")
      .replace(/G'/g, "Ғ")
      .replace(/O'/g, "Ў")
      .replace(/g'/g, "ғ")
      .replace(/o'/g, "ў")
      .replace(/Ye/g, "Е")
      .replace(/YE/g, "Е")
      .replace(/Yo/g, "Ё")
      .replace(/YO/g, "Ё")
      .replace(/Ch/g, "Ч")
      .replace(/CH/g, "Ч")
      .replace(/Sh/g, "Ш")
      .replace(/SH/g, "Ш")
      .replace(/Yu/g, "Ю")
      .replace(/YU/g, "Ю")
      .replace(/Ya/g, "Я")
      .replace(/YA/g, "Я")
      .replace(/Ts/g, "Ц")
      .replace(/TS/g, "Ц")
      .replace(/ye/g, "е")
      .replace(/yo/g, "ё")
      .replace(/ch/g, "ч")
      .replace(/sh/g, "ш")
      .replace(/yu/g, "ю")
      .replace(/ya/g, "я")
      .replace(/ts/g, "ц");

    // Encrypt remaining characters
    const result: string[] = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isFirst = this.isFirstCharOfWord(text, i);
      if ((char === "E" || char === "e") && isFirst) {
        result.push(char === "E" ? "Э" : "э");
      } else {
        const mapped = this.latinToRusMap.get(char);
        if (mapped) {
          if (char === "'") {
            const prevChar = i > 0 ? text[i - 1] : "";
            result.push(i > 0 && this.isUpperCase(prevChar) ? "Ъ" : mapped);
          } else {
            result.push(mapped);
          }
        } else {
          result.push(char);
        }
      }
    }
    return result.join("");
  }

  /**
   * Converts Cyrillic text to Latin
   * @param cyrillicMessage The Cyrillic text to convert
   * @returns The converted Latin text
   */
  public static toLatin(cyrillicMessage: string): string {
    const text = cyrillicMessage + " "; // Append space for boundary check
    const result: string[] = [];

    for (let i = 0; i < text.length - 1; i++) {
      const char = text[i];
      const isFirst = this.isFirstCharOfWord(text, i);
      const nextChar = text[i + 1];

      if (char === "Ц" || char === "ц") {
        if (isFirst) {
          result.push(char === "Ц" ? "S" : "s");
        } else if (this.cyrillicVowels.includes(text[i - 1])) {
          result.push(char === "Ц" ? "TS" : "ts");
        } else {
          result.push(char === "Ц" ? "S" : "s");
        }
      } else if (char === "Е" || char === "е") {
        if (isFirst) {
          result.push(
            char === "Е" && this.isUpperCase(nextChar)
              ? "YE"
              : char === "Е"
                ? "Ye"
                : "ye",
          );
        } else {
          result.push(char === "Е" ? "E" : "e");
        }
      } else {
        let translated = false;
        for (let k = 0; k < this.pairRus.length; k++) {
          if (char === this.pairRus[k]) {
            result.push(
              this.isUpperCase(nextChar)
                ? this.pairLatUpper[k]
                : this.pairLatLower[k],
            );
            translated = true;
            break;
          }
        }
        if (!translated) {
          const mapped = this.rusToLatinMap.get(char);
          result.push(mapped || char);
        }
      }
    }
    return result.join("");
  }
}
