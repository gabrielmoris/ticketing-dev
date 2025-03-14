import { ExpirationCompleteEvent, Publisher, Subjects } from "@gcmlearn/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
