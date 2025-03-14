import { OrderCreatedEvent, OrderStatus } from "@gcmlearn/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: "Concert",
    price: 12,
    userId: "MockedUserId",
  });

  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: "MockedUserId",
    status: OrderStatus.Created,
    expiresAt: "Sometime",
    ticket: {
      id: ticket.id,
      price: ticket.price,
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

  return { listener, ticket, data, msg };
};

it("Publishes a ticket update event", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});

it("Sets the userId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it("Acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
