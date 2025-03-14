import { Publisher, Subjects, OrderCancelledEvent } from "@gcmlearn/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
