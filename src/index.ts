import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `🚀 App is running on http://localhost:${process.env.SERVER_PORT}`,
  );
});
