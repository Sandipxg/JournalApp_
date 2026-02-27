import { BaseTable } from './baseTable.js';

export class EntryTable extends BaseTable {
    readonly table = 'entries'; // Matches your existing Postgres table name

    columns = this.setColumns((t) => ({
        // Using identity() to match your 'GENERATED ALWAYS AS IDENTITY'
        id: t.identity().primaryKey(),
        title: t.text(),
        content: t.text(),
        userId: t.text().foreignKey('user', 'id').index().nullable(),
    }));
}
