import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("Fetches the order", async () => {
  // Create Ticket and make an order With one user
  const ticket = Ticket.build({
    title: "Concert",
    price: 23,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  // Fetch the order and get exactly the order with the same ticket id

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
  expect(fetchedOrder.ticket.id).toEqual(order.ticket.id);
});

it("An User cannot fetch another user's order", async () => {
  // Create Ticket and make an order With one user
  const ticket = Ticket.build({
    title: "Concert",
    price: 23,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  // Fetch the order id from another user
  const wrongUser = global.signin();
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", wrongUser)
    .send()
    .expect(401);
});
