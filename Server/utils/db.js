import pg from "pg";
import dotenv from "dotenv";

const saltRounds = 10;
dotenv.config();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "work_suite_db",
  password: process.env.DB_PASSWORD,
  port: 5432,
});
db.connect((err) => {
  if (err) {
    console.log("Error establishing Connection", err);
  } else {
    console.log("Connection Succesfull");
  }
});

export default db;
