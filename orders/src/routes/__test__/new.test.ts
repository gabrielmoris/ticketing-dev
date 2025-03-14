import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("Has a route handler listening to /api/orders for POST requests", async () => {
  const response = await request(app).post("/api/orders").send({});

  expect(response.status).not.toEqual(404);
});

it("It is only accessible for users already signed in", async () => {
  await request(app).post("/api/orders").send({}).expect(401);
});

it("It is accessible for users signed in", async () => {
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

// Business Logic

it("Returns an error if the Ticket doesn't exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId })
    .expect(404);
});

it("Returns an error if the Ticket is reserved", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 39,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "RandomId",
    status: OrderStatus.Created,
    expiresAt: new Date(), // I am not going to check if the order is expired by time, but if its status is not right
  });

  await order.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("Ticket is reserved", async () => {
  const ticket = Ticket.build({
    title: "Theater",
    price: 19,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("Emits an order:created event", async () => {
  const ticket = Ticket.build({
    title: "Theater",
    price: 19,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
