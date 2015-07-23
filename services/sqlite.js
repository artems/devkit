import sqlite3 from 'sqlite3';

export default function (options, imports, provide) {
    const dbfile = options.dbfile || 'database.sqlite';
    const database = new sqlite3.Database(dbfile);

    provide(database);
}
