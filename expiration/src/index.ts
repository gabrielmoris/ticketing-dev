import { DatabaseConectionError } from "@gcmlearn/common";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  if (
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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch {
    throw new DatabaseConectionError();
  }
};

start();
