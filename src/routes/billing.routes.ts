// apps/api/src/routes/billing.routes.ts
import { Router } from "express";
import { stripe } from "../lib/stripe.js";
import { prisma } from "../lib/prismaClient.js";
import type { Request, Response } from "express";
import { requireUser, requireUserFromRequest } from "../auth/lib/auth.js";

export const billingRouter = Router();

billingRouter.post(
  "/create-checkout-session",
  async (req: Request, res: Response) => {
    try {
            const userId = requireUserFromRequest(req);


      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(401).json({ 
          error: "Authentication required",
          message: "Your account could not be found. Please log in again."
        });
      }

      // 1. Ensure Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customer.id },
        });

        customerId = customer.id;
      }

      // 2. Create Checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [
          {
            price: process.env.STRIPE_PREMIUM_PRICE_ID!,
            quantity: 1,
          },
        ],
        success_url: `${process.env.APP_ORIGIN}/premium/success`,
        cancel_url: `${process.env.APP_ORIGIN}/premium/cancel`,
      });

      return res.json({ url: session.url });
    } catch (err) {
      console.error("[billing] create-checkout-session error:", err);
      return res.status(500).json({ 
        error: "Failed to create checkout session",
        message: "Unable to initialize payment. Please try again or contact support if the problem persists."
      });
    }
  }
);


billingRouter.post(
  "/create-portal-session",
  async (req: Request, res: Response) => {
    try {
      const userId = requireUserFromRequest(req);
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || !user.stripeCustomerId) {
        return res
          .status(400)
          .json({ 
            error: "Billing account not found",
            message: "You need an active subscription to access the billing portal. Please subscribe first."
          });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.APP_ORIGIN}/account`,
      });

      return res.json({ url: portalSession.url });
    } catch (err) {
      console.error("[billing] create-portal-session error:", err);
      return res.status(500).json({ 
        error: "Failed to create billing portal session",
        message: "Unable to access billing portal. Please try again or contact support if the problem persists."
      });
    }
  }
);
