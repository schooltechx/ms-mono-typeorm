import { DataSource } from "typeorm";
import { User, Product, Order } from "@ms-mono-share/database-entities";
import 'dotenv/config';

const databasePath = process.env.DB_DATABASE || "/data/ms_db.sqlite";
console.log(`Using database path: ${databasePath}`);
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: databasePath,
  synchronize: false,
  logging: true,
  entities: [User, Product, Order],
  cache: true,
  migrations: ["src/migrations/**/*.ts"],
});
