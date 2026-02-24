import { change } from '../db/config.js';

change(async (db) => {
  await db.createTable('entries', (t) => ({
    id: t.identity().primaryKey(),
    title: t.text(),
    content: t.text(),
  }));
});
