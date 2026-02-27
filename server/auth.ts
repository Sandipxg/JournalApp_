import { betterAuth } from "better-auth";
import pg from "pg";

export const auth = betterAuth({
    database: new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],
});
