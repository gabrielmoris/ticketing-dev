import { Ticket } from "../ticket";

it("Implements optimistic concurrency control", async () => {
  // Create Ticket and save it in DB

  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "lkjlkj",
  });

  await ticket.save();

  // Fetch ticket twice make 2 changes

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Save 1st and then 2nd ticket and expect an error

  firstInstance?.set({ price: 25 });
  secondInstance?.set({ price: 10 });

  await firstInstance?.save();
  try {
    await secondInstance?.save(); // This triggers an error
  } catch {
    return;
  }

  throw new Error(
    "The secondInstance should fail because the version would be too low"
  );
});

it("Increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "lkjlkj",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
