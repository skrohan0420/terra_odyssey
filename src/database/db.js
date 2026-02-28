import Database from "better-sqlite3";
import path from "path";

// Absolute path to your DB file
const dbPath = path.resolve("src/database/terra_db.db");

console.log("Opening DB at:", dbPath);

try {
    const db = new Database(dbPath);

    // Check tables
    const tables = db.prepare(`
        SELECT name 
        FROM sqlite_master 
        WHERE type='table'
    `).all();

    console.log("Tables:", tables);

    // Try reading players table
    const rows = db.prepare("SELECT * FROM players").all();
    console.log("Players:", rows);

} catch (err) {
    console.error("Error:", err.message);
}