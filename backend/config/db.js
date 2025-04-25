import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: "localhost",
  user: "note_app",
  password: "bao12345",
  database: "note_app",
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  port: 3306,
  connectionLimit: 10, // Số lượng kết nối tối đa trong pool
});

export default db;
