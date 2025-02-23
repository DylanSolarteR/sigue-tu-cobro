import { int, text, singlestoreTableCreator, index, singlestoreEnum, boolean } from
  "drizzle-orm/singlestore-core";

export const createTable = singlestoreTableCreator((name): string => `stc_${name}`);

export const client = createTable("client_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  docType: singlestoreEnum("doc_type", ["CC", "CE", "NIT"]).notNull(),
  docNumber: text("doc_number").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const collector = createTable("collector_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  docType: singlestoreEnum("doc_type", ["CC", "CE", "NIT"]).notNull(),
  docNumber: text("doc_number").notNull(),
  expeditionPlace: text("expedition_place").notNull(),
  telephone: text("telephone").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const collection_account_item = createTable("collection_account_item_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  collection_account_id: text("collection_account_id").notNull(),
  amount: int("amount").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => {
  return [index("collection_account_id").on(t.collection_account_id)];
});

export const collection_account = createTable("collection_account_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  client_id: text("client_id").notNull(),
  collector_id: text("collector_id").notNull(),
  amount: int("amount").notNull(),
  status: text("status").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
},
  (t) => {
    return [
      index("client_id").on(t.client_id),
      index("collector_id").on(t.collector_id)
    ];
  }
);
