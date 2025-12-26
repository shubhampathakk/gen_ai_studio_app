import Database from "better-sqlite3";
try {
  const db = new Database("test.db");
  db.exec("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)");
  console.log("Database works");
} catch (e) {
  console.error("Database failed", e);
}
