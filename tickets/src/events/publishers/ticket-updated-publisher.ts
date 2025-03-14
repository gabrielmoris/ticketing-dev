import { Publisher, Subjects, TicketUpdatedEvent } from "@gcmlearn/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
