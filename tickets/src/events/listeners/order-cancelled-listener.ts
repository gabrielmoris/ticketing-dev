import { Listener, OrderCancelledEvent, Subjects } from "@gcmlearn/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;

  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // Find ticket that the order reserves
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) throw new Error("Ticket not found");

    // Mark the ticket as NOT reserved adding the OrderId
    ticket.set({ orderId: undefined });

    await ticket.save();

    // Public the Event to make the rest of the services to update the version too
    try {
      new TicketUpdatedPublisher(this.client).publish({
        id: ticket.id,
        price: ticket.price,
        title: ticket.title,
        userId: ticket.userId,
        version: ticket.version,
      });
    } catch (e) {
      throw new Error("Couldn't publish ticket");
    }

    msg.ack();
  }
}
