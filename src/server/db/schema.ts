import { int, text, singlestoreTableCreator, index, singlestoreEnum, boolean } from
  "drizzle-orm/singlestore-core";

export const createTable = singlestoreTableCreator((name): string => `stc_${name}`);

export const actor = createTable("actor_table_v2", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  docType: singlestoreEnum("doc_type", ["CC", "CE", "NIT"]).notNull(),
  docNumber: text("doc_number").notNull(),
  type: singlestoreEnum("type", ["client", "creditor"]).notNull(),
  expeditionPlace: text("expedition_place"),
  telephone: text("telephone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
},
  (t) => {
    return [
      index("ownerId").on(t.ownerId),
    ]
  }
);

export const billing_statement_item = createTable("billing_statement_item_table_v2", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id").notNull(),
  billing_statement_id: text("billing_statement_id"),
  client_id: text("client_id").notNull(),
  status: singlestoreEnum("status", ["pending", "added", "paid"]).notNull().default("pending"),
  desc: text("desc").notNull(),
  amount: int("amount").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => {
  return [
    index("billing_statement_id").on(t.billing_statement_id),
    index("item_client_id").on(t.client_id),
    index("ownerId").on(t.ownerId),
  ];
});

export const billing_statement = createTable("billing_statement_table_v2", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id").notNull(),
  client_id: text("client_id").notNull(),
  creditor_id: text("creditor_id").notNull(),
  amount: int("amount").notNull(),
  extraInfo: text("extra_info").notNull().default(""),
  status: singlestoreEnum("status", ["pending", "paid"]).notNull(),
  showItemAmount: boolean("show_item_amount").notNull().default(false),
  payDate: text("pay_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
},
  (t) => {
    return [
      index("client_id").on(t.client_id),
      index("creditor_id").on(t.creditor_id),
      index("ownerId").on(t.ownerId),
    ];
  }
);
