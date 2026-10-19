const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../Data/db.sqlite');
const sqlPath = process.env.SQL_PATH || path.join(__dirname, '../../Data/commands.sql');

function schemaSql() {
  return fs
    .readFileSync(sqlPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
}

function open() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => (err ? reject(err) : resolve(db)));
  });
}

function get(db, sql) {
  return new Promise((resolve, reject) => {
    db.get(sql, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function exec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

function close(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });
}

async function main() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = await open();
  try {
    const table = await get(
      db,
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'",
    );
    if (table) {
      const count = await get(db, 'SELECT COUNT(*) AS count FROM users');
      console.log(`database ready at ${dbPath}, users=${count.count}`);
      return;
    }
    await exec(db, schemaSql());
    const count = await get(db, 'SELECT COUNT(*) AS count FROM users');
    console.log(`database initialised at ${dbPath}, users=${count.count}`);
  } finally {
    await close(db);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
