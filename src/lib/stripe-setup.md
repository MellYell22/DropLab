// Stripe Integration Reference
// Step 1: Upgrade to Builder+ subscription
// Step 2: Create these products in Stripe Dashboard (or ask AI chat: "Create 3 credit products")
//    - 10 Credits — $5   (price_basic)
//    - 50 Credits — $20  (price_popular)  
//    - 150 Credits — $50 (price_pro)
// Step 3: Create a backend function called "createStripeCheckout" that:
//    - Accepts: { packageId, credits, amount, successUrl, cancelUrl }
//    - Maps packageId to Stripe price IDs
//    - Creates a Stripe Checkout Session
//    - Returns: { url: session.url }
// Step 4: Create a backend function called "stripeWebhook" that:
//    - Listens for checkout.session.completed events
//    - Reads metadata: { credits, user_id }
//    - Updates user: base44.entities.User.update(user_id, { credits: currentCredits + purchasedCredits })
// Step 5: Set STRIPE_SECRET_KEY in Dashboard → Integrations → Stripe
// Step 6: Set STRIPE_PUBLISHABLE_KEY in components/payments/CreditStore.jsx
// Step 7: Set Stripe webhook endpoint to: https://your-app.base44.app/functions/stripeWebhook