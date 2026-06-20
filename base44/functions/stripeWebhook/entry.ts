import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: '2023-10-16' });
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")
      );
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { credits, user_id } = session.metadata;

      if (credits && user_id) {
        const purchasedCredits = parseInt(credits, 10);

        const userRecord = await base44.asServiceRole.entities.User.list({
          query: { id: user_id },
          limit: 1,
        });

        if (userRecord.length > 0) {
          const currentCredits = userRecord[0].credits || 0;
          await base44.asServiceRole.entities.User.update(user_id, {
            credits: currentCredits + purchasedCredits,
          });
          console.log(`Added ${purchasedCredits} credits to user ${user_id}. New balance: ${currentCredits + purchasedCredits}`);
        } else {
          console.error("User not found:", user_id);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: "Webhook handler error" }, { status: 500 });
  }
});