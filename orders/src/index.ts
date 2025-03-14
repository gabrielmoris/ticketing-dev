import mongoose from "mongoose";
import { DatabaseConectionError } from "@gcmlearn/common";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";

const start = async () => {
  console.log("Starting orders service");
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

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    // MONGO DB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Tickets connected to MongoDB.");
  } catch {
    throw new DatabaseConectionError();
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
