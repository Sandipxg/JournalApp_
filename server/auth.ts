import { betterAuth } from "better-auth";
import pg from "pg";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
    advanced: {
        defaultCookieAttributes: {
            httpOnly: true,
            secure: false, // Set to false for local testing without HTTPS
            sameSite: "lax",
        },
        useSecureCookies: false,
    },
    basePath: "/api/auth",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
    secret: process.env.BETTER_AUTH_SECRET,
    database: new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true,
    },
    logger: {
        enabled: true,
        level: "debug",
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    account: {
        skipStateCookieCheck: true,
    },
    trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:3001",
        "http://localhost:8080",
        "http://localhost:50080",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:50080",
        "http://localhost:51951", // Added your recent port
        "https://journalapp-pi.vercel.app",
        ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
    ],
});

