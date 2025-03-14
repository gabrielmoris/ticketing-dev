import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from "@gcmlearn/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "test",
    price: 30,
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: "mockedId",
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
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

it("Updates the order status to cancelled", async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("Emit an OrderCancelled event", async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[1][1] // I check the second call, since the first one is the last test
  );

  expect(eventData.id).toEqual(order.id);
});

it("Acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
