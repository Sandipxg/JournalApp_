import { betterAuth } from "better-auth";
import pg from "pg";

export const auth = betterAuth({
    database: new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],
});
