import { Subjects, Publisher, PaymentCreatedEvent } from "@gcmlearn/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
