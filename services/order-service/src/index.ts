// import "reflect-metadata";
import 'dotenv/config';
import express from "express";
import { AppDataSource } from "@ms-mono-share/database";
import { Order } from "@ms-mono-share/database-entities";

const app = express();
const port = process.env.PORT || 80;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.get("/orders", async (req, res) => {
  const orderRepository = AppDataSource.getRepository(Order);
  const orders = await orderRepository.find({cache:true,
  relations: {
    user: true,
    product: true,
  },
});
  res.json(orders);
});

app.listen(port, () => {
  console.log(`Order service listening at http://localhost:${port}`);
});
