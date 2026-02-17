import { DataSource } from "typeorm";
import { User, Product, Order } from "@ms-mono-share/database-entities";
import 'dotenv/config';
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_DATABASE || "/data/ms_db.sqlite",
  synchronize: false,
  logging: true,
  entities: [User, Product, Order],
  migrations: ["src/migrations/**/*.ts"],
});
