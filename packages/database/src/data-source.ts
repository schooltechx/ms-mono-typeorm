import { DataSource } from "typeorm";
import { User, Product, Order } from "@ms-mono-share/database-entities";
import dotenv from 'dotenv'; 
dotenv.config();
const databasePath = process.env.DB_DATABASE || "/data/ms_db.sqlite";
console.log(`Using database path: ${databasePath}`);
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: databasePath,
  synchronize: false,
  logging: true,
  entities: [User, Product, Order],
  migrations: ["src/migrations/**/*.ts"],
});
