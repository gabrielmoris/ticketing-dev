import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@gcmlearn/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // Create listener instance and event-data object
  const listener = new TicketCreatedListener(natsWrapper.client);

  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Mock message Obj from NATS
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

  return { listener, data, msg };
};

it("Creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);

  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
});

it("Acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
