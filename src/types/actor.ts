// export const actor = createTable("actor_table", {
//   id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
//   name: text("name").notNull(),
//   docType: singlestoreEnum("doc_type", ["CC", "CE", "NIT"]).notNull(),
//   docNumber: text("doc_number").notNull(),
//   type: singlestoreEnum("type", ["client", "collector"]).notNull(),
//   expeditionPlace: text("expedition_place"),
//   telephone: text("telephone"),
//   isActive: boolean("is_active").notNull().default(true),
//   createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
//   updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
// });

interface Actor {
    id: string;
    name: string;
    docType: "CC" | "CE" | "NIT";
    docNumber: string;
    type: "client" | "collector";
    expeditionPlace?: string;
    telephone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}