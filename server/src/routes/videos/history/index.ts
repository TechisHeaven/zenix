import express from "express";
import { ensureAuthenticated } from "../../../server";
import { watch_history } from "../../../db/schemas/main.schema";
import db from "../../../db";
import { v4 as uuidv4 } from "uuid";
import statusCodes from "../../../utils/status.utils";
import { and, eq } from "drizzle-orm";
import { createError } from "../../../utils/error.utils";
import { uuidRegexTest } from "../../../utils/uuidRegexTest";

const router = express.Router();

// Add Watch History
router.post("/", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { video_id } = req.body;

    if (!video_id)
      throw createError(statusCodes.badRequest, "Video Id Required");

    if (!uuidRegexTest(video_id))
      throw createError(statusCodes.badRequest, "Invalid Video Id");

    const watch_history_exists = await db
      .select()
      .from(watch_history)
      .where(
        and(
          eq(watch_history.video_id, video_id),
          eq(watch_history.user_id, user_id)
        )
      )
      .then((res) => res[0]);

    if (watch_history_exists)
      throw createError(statusCodes.badRequest, "Watch History Already Exists");

    const history_id = uuidv4();
    // Add watch history logic here
    await db.insert(watch_history).values({
      history_id,
      user_id,
      video_id,
      watched_at: new Date(),
      is_completed: false,
    });

    res.status(statusCodes.created).json({
      statusCode: statusCodes.created,
      ok: true,
      message: "Watch History added successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
});
// Update Watch History
router.put("/", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { video_id, watch_time, is_completed } = req.body;

    if (!video_id)
      throw createError(statusCodes.badRequest, "Video Id Required");
    if (!watch_time)
      throw createError(statusCodes.badRequest, "Watch Time Required");

    if (!uuidRegexTest(video_id))
      throw createError(statusCodes.badRequest, "Invalid Video Id");

    const watch_history_exists = await db
      .select()
      .from(watch_history)
      .where(
        and(
          eq(watch_history.video_id, video_id),
          eq(watch_history.user_id, user_id)
        )
      )
      .then((res) => res[0]);

    if (!watch_history_exists) {
      const history_id = uuidv4();
      // Add watch history logic here
      await db.insert(watch_history).values({
        history_id,
        user_id,
        video_id,
        watched_at: new Date(),
        is_completed: false,
      });
    } else {
      await db
        .update(watch_history)
        .set({
          watch_time,
          is_completed,
        })
        .where(
          and(
            eq(watch_history.video_id, video_id),
            eq(watch_history.user_id, user_id)
          )
        );
    }

    res.status(statusCodes.ok).json({
      statusCode: statusCodes.ok,
      ok: true,
      message: "Watch History Updated successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

// Get Watch History
router.get("/", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;

    // Get watch history logic here
    const history = await db
      .select()
      .from(watch_history)
      .where(eq(watch_history.user_id, user_id));

    res.status(statusCodes.ok).json({
      statusCode: statusCodes.ok,
      ok: true,
      message: "Watch History Fetched successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
});
// Get Watch History For Video
router.get("/:video_id", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { video_id } = req.params;

    if (!uuidRegexTest(video_id))
      throw createError(statusCodes.badRequest, "Video Id is not Valid");

    const history = await db
      .select()
      .from(watch_history)
      .where(
        and(
          eq(watch_history.user_id, user_id),
          eq(watch_history.video_id, video_id)
        )
      )
      .then((res) => res[0]);

    res.status(statusCodes.ok).json({
      statusCode: statusCodes.ok,
      ok: true,
      message: "Watch History fetched successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

// Delete Watch History For Video
router.delete(
  "/:video_id",
  ensureAuthenticated,
  async (req: any, res, next) => {
    try {
      const user_id = req.user.user_id;
      const { video_id } = req.params;

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Video Id is not Valid");

      await db
        .delete(watch_history)
        .where(
          and(
            eq(watch_history.user_id, user_id),
            eq(watch_history.video_id, video_id)
          )
        );

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Watch History Deleted successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
