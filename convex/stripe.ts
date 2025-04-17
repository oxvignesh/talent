import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

export const pay = action({
  args: { amount: v.number(), path: v.string() },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });

    const domain = process.env.NEXT_PUBLIC_HOSTING_URL;
    if (!domain) {
      throw new Error("Domain is not defined");
    }

    const session: Stripe.Response<Stripe.Checkout.Session> =
      await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "deposit fund",
                description: "Deposit fund to your wallet",
              },
              unit_amount: args.amount * 100,
            },
            quantity: 1,
          },
        ],
        success_url: `${domain}${args.path}?sessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}/dashboard`,
      });

    if (session.url) {
      const txnId: Id<"transactions"> = await ctx.runMutation(
        internal.transactions.deposit,
        {
          amount: args.amount,
          stripeSessionId: session.id,
        }
      );

      return { url: session.url, transactionId: txnId };
    }
  },
});

export const verifyPayment = action({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
      const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!, {
        apiVersion: "2025-02-24.acacia",
      });
  
      const session = await stripe.checkout.sessions.retrieve(args.sessionId);
      
      if (session.payment_status === "paid") {
        // Update transaction status to completed
        await ctx.runMutation(internal.transactions.updateBalance, {
          stripeSessionId: session.id,
          status: "completed"
        });
        return { success: true };
      }
      
      return { success: false };
    }
  });