import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 5 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  options: jsonb("options").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const languageRelations = relations(languages, ({ many }) => ({
  dictionaryEntries: many(dictionaryEntries),
}));

export const dictionaryEntries = pgTable(
  "dictionary_entries",
  {
    id: serial("id").primaryKey(),
    langId: integer("lang_id")
      .notNull()
      .references(() => languages.id),
    word: varchar("word", { length: 256 }).notNull(),
    sfxs: varchar("sfxs", { length: 30 })
      .array()
      .default(
        sql`ARRAY
        []::varchar[]`,
      )
      .$type<string[]>(), // Store multiple flags
    pfxs: varchar("pfxs", { length: 30 })
      .array()
      .default(
        sql`ARRAY
        []::varchar[]`,
      )
      .$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Ensure unique combination of word and langId
    unique().on(table.word, table.langId, table.sfxs, table.pfxs),
  ],
);

export const dictionaryEntriesRelations = relations(
  dictionaryEntries,
  ({ one }) => ({
    language: one(languages, {
      fields: [dictionaryEntries.langId],
      references: [languages.id],
    }),
  }),
);

export const affixGroups = pgTable(
  "affix_groups",
  {
    id: serial("id").primaryKey(),
    lang_id: integer("lang_id")
      .notNull()
      .references(() => languages.id),
    type: varchar("type", { length: 3 }).notNull().$type<"SFX" | "PFX">(),
    flag: varchar("flag", { length: 32 }).notNull(),
    multiUse: boolean("multi_use").notNull(),
    description: text("description").default(""), // Description of the affix group
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Ensure unique combination of type and flag
    unique().on(table.type, table.flag, table.lang_id),
  ],
);

export const affixRules = pgTable("affix_rules", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => affixGroups.id, { onDelete: "cascade" }),
  omit: varchar("omit", { length: 10 }).default(""),
  add: varchar("add", { length: 30 }).notNull(),
  match: varchar("match", { length: 30 }).default(""),
  comment: text("comment").default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const affixGroupsRelations = relations(affixGroups, ({ many }) => ({
  rules: many(affixRules),
}));

export const affixRulesRelations = relations(affixRules, ({ one }) => ({
  group: one(affixGroups, {
    fields: [affixRules.groupId],
    references: [affixGroups.id],
  }),
}));

export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;
export type DictionaryEntry = typeof dictionaryEntries.$inferSelect;
export type NewDictionaryEntry = typeof dictionaryEntries.$inferInsert;
export type AffixGroup = typeof affixGroups.$inferSelect;
export type NewAffixGroup = typeof affixGroups.$inferInsert;
export type AffixRule = typeof affixRules.$inferSelect;
export type NewAffixRule = typeof affixRules.$inferInsert;

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
