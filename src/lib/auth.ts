import { db } from "@/server/db";
import { Schema } from "@/server/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema: {
            ...Schema,
            user: Schema.user,
        },
    })
});

export default auth;