import mongoose from "mongoose";
import { DatabaseConectionError } from "@gcmlearn/common";
import { app } from "./app";

const start = async () => {
  console.log("starting");
  if (!process.env.JWT_KEY || !process.env.MONGO_URI) {
    throw new Error("JWT_KEY and MONGO_URI must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Auth connected to MongoDB.");
  } catch {
    throw new DatabaseConectionError();
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
