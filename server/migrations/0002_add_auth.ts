import { change } from '../db/config.js';

change(async (db) => {
  await db.createTable('users', (t) => ({
    id: t.identity().primaryKey(),
    username: t.text().unique(),
    password: t.text(),
  }));

  await db.changeTable('entries', (t) => ({
    userId: t.integer().foreignKey('users', 'id').index().nullable(),
  }));
});
