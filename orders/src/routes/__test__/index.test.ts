import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

let ticketnr = 1;

const buidTicket = async () => {
  const ticket = Ticket.build({
    title: "Concert" + ticketnr,
    price: 23,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();
  ticketnr++;
  return ticket;
};

it("Fetches orders of an user", async () => {
  // Create 3 tickets
  const ticket1 = await buidTicket();
  const ticket2 = await buidTicket();
  const ticket3 = await buidTicket();

  // Cookies for the users
  const userOne = global.signin();
  const userTwo = global.signin();

  // User #1 creates an order

  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({
      ticketId: ticket1.id,
    })
    .expect(201);

  // User #2 creates 2 orders
  const { body: order1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({
      ticketId: ticket2.id,
    })
    .expect(201);
  const { body: order2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({
      ticketId: ticket3.id,
    })
    .expect(201);

  // Make Request to get orders of User #2 and show only his orders

  const res = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  expect(res.body.length).toEqual(2);

  expect(res.body[0].id).toEqual(order1.id);
  expect(res.body[1].id).toEqual(order2.id);

  expect(res.body[0].ticket.id).toEqual(ticket2.id);
  expect(res.body[1].ticket.id).toEqual(ticket3.id);
});
