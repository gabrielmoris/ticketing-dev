import { OrderCancelledEvent, OrderStatus } from "@gcmlearn/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 12,
    userId: "TestId",
    version: 0,
  });

  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: "RandomString",
    },
  };

  const msg: Message = {
    ack: jest.fn(),
    getSubject: jest.fn().mockReturnValue("subject"),
    getSequence: jest.fn().mockReturnValue(1),
    getRawData: jest.fn().mockReturnValue(Buffer.from("")),
    getData: jest.fn().mockReturnValue(""),
    isRedelivered: jest.fn().mockReturnValue(false),
    getCrc32: jest.fn().mockReturnValue(0),
    getTimestampRaw: jest.fn().mockReturnValue(0),
    getTimestamp: jest.fn().mockReturnValue(new Date()),
  };

  return { listener, order, data, msg };
};

it("Replicates the order Info", async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("Acks the Message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
