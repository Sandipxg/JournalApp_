import { BaseTable } from './baseTable.js';

export class UserTable extends BaseTable {
  readonly table = 'user';

  columns = this.setColumns((t) => ({
    id: t.text().primaryKey(),
    name: t.text(),
    email: t.text().unique(),
    emailVerified: t.boolean(),
    image: t.text().nullable(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }));
}
