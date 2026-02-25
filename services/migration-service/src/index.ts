// import "reflect-metadata";
import 'dotenv/config';
import express from "express";
import { AppDataSource } from "@ms-mono-share/database";
const migrationsDir = __dirname + "/migrations/**/*.{ts,js}";
console.log("Migration service directory: "+migrationsDir)
const app = express();
const port = process.env.PORT || 80;
AppDataSource.setOptions({
  migrations: [migrationsDir],
});

app.get("/migrate", async (req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.runMigrations();
    res.send("Migrations have been run!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error running migrations");
  }
});

app.listen(port, () => {
  console.log(`Migration service listening at http://localhost:${port}`);
});
