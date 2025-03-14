import {
  Listener,
  Subjects,
  PaymentCreatedEvent,
  OrderStatus,
} from "@gcmlearn/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error("Order not found.");

    order.set({
      status: OrderStatus.Complete,
    });
    order.save();

    // The version of the order will be updated automatically at this point.
    // I could create a new publisher to tell the rest of the services, but It will never need to be changed again.

    // Send NATS acknowledge
    msg.ack();
  }
}
