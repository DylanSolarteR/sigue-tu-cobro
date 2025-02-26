import { int, text, singlestoreTableCreator, index, singlestoreEnum, boolean } from
  "drizzle-orm/singlestore-core";

export const createTable = singlestoreTableCreator((name): string => `stc_${name}`);

export const actor = createTable("actor_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  docType: singlestoreEnum("doc_type", ["CC", "CE", "NIT"]).notNull(),
  docNumber: text("doc_number").notNull(),
  type: singlestoreEnum("type", ["client", "creditor"]).notNull(),
  expeditionPlace: text("expedition_place"),
  telephone: text("telephone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const billing_statement_item = createTable("billing_statement_item_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  billing_statement_id: text("billing_statement_id").notNull(),
  amount: int("amount").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => {
  return [index("billing_statement_id").on(t.billing_statement_id)];
});

export const billing_statement = createTable("billing_statement_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  client_id: text("client_id").notNull(),
  creditor_id: text("creditor_id").notNull(),
  amount: int("amount").notNull(),
  status: text("status").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
},
  (t) => {
    return [
      index("client_id").on(t.client_id),
      index("creditor_id").on(t.creditor_id)
    ];
  }
);
