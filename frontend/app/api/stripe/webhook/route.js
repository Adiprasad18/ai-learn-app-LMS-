import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { updateUserSubscription } from "@/backend/server/user-service";

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
}

const stripe = new Stripe(stripeSecret);

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("Received Stripe webhook:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const clerkUserId = session.metadata?.clerkUserId;
        
        if (clerkUserId) {
          await updateUserSubscription(clerkUserId, {
            stripeCustomerId: session.customer,
            subscriptionStatus: "active",
            isMember: true,
          });
          console.log(`Subscription activated for user: ${clerkUserId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const clerkUserId = customer.metadata?.clerkUserId;
        
        if (clerkUserId) {
          const isActive = subscription.status === "active";
          await updateUserSubscription(clerkUserId, {
            subscriptionStatus: subscription.status,
            isMember: isActive,
          });
          console.log(`Subscription updated for user: ${clerkUserId}, status: ${subscription.status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const clerkUserId = customer.metadata?.clerkUserId;
        
        if (clerkUserId) {
          await updateUserSubscription(clerkUserId, {
            subscriptionStatus: "canceled",
            isMember: false,
          });
          console.log(`Subscription canceled for user: ${clerkUserId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        const clerkUserId = customer.metadata?.clerkUserId;
        
        if (clerkUserId) {
          await updateUserSubscription(clerkUserId, {
            subscriptionStatus: "past_due",
            isMember: false,
          });
          console.log(`Payment failed for user: ${clerkUserId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
