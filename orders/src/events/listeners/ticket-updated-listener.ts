import { Listener, Subjects, TicketUpdatedEvent } from "@gcmlearn/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) throw new Error("Ticket Not Found");

    // ticket.set({ title: data.title, price: data.price, version: data.version }); // Version has to be sent If i dont use mongoose-update-if-current
    ticket.set({ title: data.title, price: data.price }); // Version would be updated automatically by mongoose-update-if-current

    await ticket.save();

    // Send NATS acknowledge
    msg.ack();
  }
}
