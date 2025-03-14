import mongoose from "mongoose";
import { DatabaseConectionError } from "@gcmlearn/common";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

const start = async () => {
  if (
    !process.env.JWT_KEY ||
    !process.env.MONGO_URI ||
    !process.env.NATS_CLIENT_ID ||
    !process.env.NATS_CLUSTER_ID ||
    !process.env.NATS_URL
  ) {
    throw new Error("All ENV params must be defined");
  }

  try {
    // NATS STREAMING SERVER
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed.");
      process.exit();
    });

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    // MONGO DB
    await mongoose.connect(process.env.MONGO_URI);

    // Listeners
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    console.log("Payments connected to MongoDB.");
  } catch {
    throw new DatabaseConectionError();
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
