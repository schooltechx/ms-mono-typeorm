import "reflect-metadata";
import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");
    await AppDataSource.runMigrations();
    console.log("Migrations have been run!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
    process.exit(1);
  });
