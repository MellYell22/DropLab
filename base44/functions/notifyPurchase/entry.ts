import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const purchase = body.data;
    if (!purchase) {
      return Response.json({ error: 'No purchase data' }, { status: 400 });
    }

    // Fetch the marketplace item for details
    let itemTitle = 'Unknown item';
    try {
      const item = await base44.asServiceRole.entities.MarketplaceItem.get(purchase.item_id);
      if (item) {
        itemTitle = item.title || 'Unknown item';
      }
    } catch {
      // Item may have been deleted, continue anyway
    }

    // Fetch buyer info
    let buyerName = 'Unknown buyer';
    let buyerEmail = 'unknown';
    try {
      const buyer = await base44.asServiceRole.entities.User.get(purchase.buyer_id);
      if (buyer) {
        buyerName = buyer.full_name || 'Unknown buyer';
        buyerEmail = buyer.email || 'unknown';
      }
    } catch {
      // Buyer may have been deleted
    }

    // Get admin users to notify
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    const amount = purchase.amount || 0;
    const platformRevenue = purchase.platform_revenue || 0;
    const creatorRevenue = purchase.creator_revenue || 0;

    const subject = `🛒 New Sale: ${itemTitle} — $${amount.toFixed(2)}`;
    const bodyText = `
New purchase on DropLab Marketplace!

📦 Item: ${itemTitle}
💰 Amount: $${amount.toFixed(2)}
🧑 Buyer: ${buyerName} (${buyerEmail})
🏪 Platform Revenue: $${platformRevenue.toFixed(2)}
🎨 Creator Revenue: $${creatorRevenue.toFixed(2)}
📅 Date: ${new Date(purchase.created_date || Date.now()).toLocaleString('en-US', { timeZone: 'America/New_York' })}

View in DropLab to manage your sales.
    `.trim();

    // Send to all admins
    for (const admin of admins) {
      if (admin.email) {
        await base44.integrations.Core.SendEmail({
          to: admin.email,
          subject: subject,
          body: bodyText,
        });
      }
    }

    return Response.json({ success: true, notified: admins.length });
  } catch (error) {
    console.error('notifyPurchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});