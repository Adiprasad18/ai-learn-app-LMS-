import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByExternalId } from "@/backend/server/user-service";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await getUserByExternalId(clerkUserId);
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: "No subscription found" },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return NextResponse.json(
      {
        success: true,
        data: { url: portalSession.url },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
