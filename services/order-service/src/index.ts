import "reflect-metadata";
import express from "express";
import { AppDataSource } from "@ms-mono-share/database";
import { Order } from "@ms-mono-share/database-entities";

const app = express();
const port = 3003;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.get("/orders", async (req, res) => {
  const orderRepository = AppDataSource.getRepository(Order);
  const orders = await orderRepository.find();
  res.json(orders);
});

app.listen(port, () => {
  console.log(`Order service listening at http://localhost:${port}`);
});
