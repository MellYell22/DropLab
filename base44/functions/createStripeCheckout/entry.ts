import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.7.0';

const PRICE_MAP = {
  price_basic: "price_1Tka3SGDw0P2L0A1piscjECa",
  price_popular: "price_1Tka5kGDw0P2L0A1vpHLOv6Y",
  price_pro: "price_1Tka8AGDw0P2L0A1dBwqemKK",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Please sign in to purchase credits" }, { status: 401 });
    }

    const { packageId, credits, successUrl, cancelUrl } = await req.json();

    const priceId = PRICE_MAP[packageId];
    if (!priceId) {
      return Response.json({ error: "Invalid package" }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        credits: String(credits),
        user_id: user.id,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error full:", error.message, error.stack);
    return Response.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
});