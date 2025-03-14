import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@gcmlearn/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketCreatedListener } from "../ticket-created-listener";

const setup = async () => {
  // Create listener instance, save Ticket to DB and create the Data Object
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "Updated Concert",
    price: 1.53,
    userId: "RandomStringHere",
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

  return { listener, ticket, data, msg };
};

it("Finds, updates, and saves a ticket", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);
});

it("Acks the message", async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("Doesn't call ack if the event skips a version number", async () => {
  const { msg, data, ticket, listener } = await setup();

  data.version = 12;

  try {
    await listener.onMessage(data, msg);
  } catch {}

  expect(msg.ack).not.toHaveBeenCalled();
});
