import { change } from '../db/config.js';

change(async (db) => {
    // Drop the old users table and remove its foreign key from entries
    await db.changeTable('entries', (t) => ({
        userId: t.drop(t.integer().foreignKey('users', 'id').index().nullable()),
    }));
    await db.dropTable('users');

    // Create BetterAuth tables
    await db.createTable('user', (t) => ({
        id: t.text().primaryKey(),
        name: t.text(),
        email: t.text().unique(),
        emailVerified: t.boolean(),
        image: t.text().nullable(),
        createdAt: t.timestamp(),
        updatedAt: t.timestamp(),
    }));

    await db.createTable('session', (t) => ({
        id: t.text().primaryKey(),
        expiresAt: t.timestamp(),
        token: t.text().unique(),
        createdAt: t.timestamp(),
        updatedAt: t.timestamp(),
        ipAddress: t.text().nullable(),
        userAgent: t.text().nullable(),
        userId: t.text().foreignKey('user', 'id'),
    }));

    await db.createTable('account', (t) => ({
        id: t.text().primaryKey(),
        accountId: t.text(),
        providerId: t.text(),
        userId: t.text().foreignKey('user', 'id'),
        accessToken: t.text().nullable(),
        refreshToken: t.text().nullable(),
        idToken: t.text().nullable(),
        accessTokenExpiresAt: t.timestamp().nullable(),
        refreshTokenExpiresAt: t.timestamp().nullable(),
        scope: t.text().nullable(),
        password: t.text().nullable(),
        createdAt: t.timestamp(),
        updatedAt: t.timestamp(),
    }));

    await db.createTable('verification', (t) => ({
        id: t.text().primaryKey(),
        identifier: t.text(),
        value: t.text(),
        expiresAt: t.timestamp(),
        createdAt: t.timestamp().nullable(),
        updatedAt: t.timestamp().nullable(),
    }));

    // Add userId back to entries, referencing the new user table
    await db.changeTable('entries', (t) => ({
        userId: t.text().foreignKey('user', 'id').index().nullable(),
    }));
});
