import { Publisher, Subjects, OrderCreatedEvent } from "@gcmlearn/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
