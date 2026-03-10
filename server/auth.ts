import { betterAuth } from "better-auth";
import pg from "pg";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
    advanced: {
        defaultCookieAttributes: {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        },
        useSecureCookies: isProduction,
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
            redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`
        },
    },
    trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:3001",
        "https://journalapp-pi.vercel.app",
        ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
    ],
});

