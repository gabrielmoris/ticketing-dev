import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("Has a route handler listening to /api/tickets for POST requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("It is only accessible for users already signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("It is accessible for users signed in", async () => {
  const response = await request(app).post("/api/tickets").set("Cookie", global.signin()).send({});

  expect(response.status).not.toEqual(401);
});

it("Return an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 23,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      price: 23,
    })
    .expect(400);
});

it("Return an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Valid Title",
      price: -23,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Valid Title",
    })
    .expect(400);
});

it("Creates a ticket with valid parameters", async () => {
  // add a check to make sure a ticket was saved
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Valid Title",
      price: 23,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(23);
});

it("Publishes an event", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Valid Title",
      price: 23,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
