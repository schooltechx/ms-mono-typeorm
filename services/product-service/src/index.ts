import "reflect-metadata";
import express from "express";
import { AppDataSource } from "@ms-mono-share/database";
import { Product } from "@ms-mono-share/database-entities";

const app = express();
const port = 3002;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.get("/products", async (req, res) => {
  const productRepository = AppDataSource.getRepository(Product);
  const products = await productRepository.find();
  res.json(products);
});

app.listen(port, () => {
  console.log(`Product service listening at http://localhost:${port}`);
});
