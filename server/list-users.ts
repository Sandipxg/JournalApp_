import { db } from './db/db.js';

async function listUsers() {
  try {
    const users = await db.user.select('id', 'email', 'name');
    console.table(users);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listUsers();
