import Stripe from "stripe";
const stripekey = process.env.STRIPE_KEY;

if (!stripekey) throw new Error("No Stripe Key provided");

export const stripe = new Stripe(stripekey, {
  apiVersion: "2025-02-24.acacia",
});
