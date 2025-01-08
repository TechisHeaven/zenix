import express from "express";
import { ensureAuthenticated } from "../../server";
import db from "../../db";
import { subscriptions } from "../../db/schemas/main.schema";
import { v4 as uuidv4 } from "uuid";
import { validateFields } from "../../utils/validate.config";
import { createError } from "../../utils/error.utils";
import statusCodes from "../../utils/status.utils";
import { eq } from "drizzle-orm";
import { PLAN_ONE, PLAN_TWO } from "../../constants/main.constants";
const router = express.Router();

// Subscribe to Premium
router.post("/subscribe", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { planId, paymentDetails } = req.body;
    const validate = validateFields(["planId", "paymentDetails"], {
      planId,
      paymentDetails,
    });
    if (!validate.isValid)
      throw createError(
        statusCodes.badRequest,
        `Missing Fields: ${validate.missingFields}`
      );

    if (planId !== PLAN_ONE && planId !== PLAN_TWO)
      throw createError(statusCodes.badRequest, "Plan Type Not Allowed");

    const subscriptions_exists = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, user_id))
      .then((res) => res[0]);

    if (subscriptions_exists && subscriptions_exists.status === "cancelled")
      throw createError(statusCodes.badRequest, "User Already Subscription");

    const subscription_id = uuidv4();
    // Add your subscription logic here
    await db.insert(subscriptions).values({
      subscription_id,
      user_id,
      plan_id: planId,
      payment_details: paymentDetails,
      status: "active",
      subscribed_at: new Date(),
    });

    res.status(statusCodes.ok).json({
      statusCode: statusCodes.ok,
      ok: true,
      message: "Subscripted successfully",
      data: {
        planId,
        paymentDetails,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Cancel Subscription
router.post("/cancel", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;

    const subscriptions_exists = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, user_id))
      .then((res) => res[0]);

    if (subscriptions_exists && subscriptions_exists.status === "cancelled")
      throw createError(
        statusCodes.badRequest,
        "Subscription Already Cancelled"
      );
    // Add your cancellation logic here
    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        cancelled_at: new Date(),
      })
      .where(eq(subscriptions.user_id, user_id));

    res.status(statusCodes.ok).json({
      statusCode: statusCodes.ok,
      ok: true,
      message: "Subscription Cancelled successfully",
      data: {},
    });
    res.status(200).send({ message: "Subscription cancelled" });
  } catch (error) {
    next(error);
  }
});
// Update Subscription
router.put("/subscribe", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { planId, paymentDetails } = req.body;
    const validate = validateFields(["planId", "paymentDetails"], {
      planId,
      paymentDetails,
    });
    if (!validate.isValid)
      throw createError(
        statusCodes.badRequest,
        `Missing Fields: ${validate.missingFields}`
      );

    if (planId !== PLAN_ONE && planId !== PLAN_TWO)
      throw createError(statusCodes.badRequest, "Plan Type Not Allowed");

    const subscriptions_exists = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, user_id))
      .then((res) => res[0]);

    if (!subscriptions_exists)
      throw createError(statusCodes.badRequest, "Subscription Not Exists");
    // Add your update logic here
    await db
      .update(subscriptions)
      .set({
        plan_id: planId,
        payment_details: paymentDetails,
        status: "active",
        subscribed_at: new Date(),
      })
      .where(eq(subscriptions.user_id, user_id));

    res.status(statusCodes.ok).json({
      statusCode: statusCodes.ok,
      ok: true,
      message: "Subscription Updated successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

// Get Subscription Details
router.get("/details", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;

    // Add your logic to get subscription details here
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, user_id))
      .then((res) => res[0]);

    if (!subscription) {
      throw createError(statusCodes.notFound, "Subscription not found");
    }

    res.status(statusCodes.ok).json({
      statusCode: statusCodes.ok,
      ok: true,
      message: "Subscription Fetched successfully",
      data: {
        details: subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
