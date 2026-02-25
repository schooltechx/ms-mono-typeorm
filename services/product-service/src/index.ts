// import "reflect-metadata";
import 'dotenv/config';
import express from "express";
import { AppDataSource } from "@ms-mono-share/database";
import { Product } from "@ms-mono-share/database-entities";

const app = express();
const port = process.env.PORT || 80;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.get("/products", async (req, res) => {
  const productRepository = AppDataSource.getRepository(Product);
  const products = await productRepository.find({cache: 60000}); // 1 minute
  res.json(products);
});

app.listen(port, () => {
  console.log(`Product service listening at http://localhost:${port}`);
});
