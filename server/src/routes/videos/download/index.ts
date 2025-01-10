import express from "express";
import { ensureAuthenticated } from "../../../server";
import {
  download_history,
  watch_history,
} from "../../../db/schemas/main.schema";
import db from "../../../db";
import { v4 as uuidv4 } from "uuid";
import statusCodes from "../../../utils/status.utils";
import { and, eq } from "drizzle-orm";
import { createError } from "../../../utils/error.utils";
import { uuidRegexTest } from "../../../utils/uuidRegexTest";

const router = express.Router();

// Add Download History
router.post("/", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { video_id } = req.body;

    const download_exists = await db
      .select()
      .from(download_history)
      .where(
        and(
          eq(download_history.user_id, user_id),
          eq(download_history.video_id, video_id)
        )
      )
      .then((res) => res[0]);
    if (download_exists)
      throw createError(
        statusCodes.badRequest,
        "Download History Already Exists"
      );
    const download_id = uuidv4();
    // Add download history logic here
    await db.insert(download_history).values({
      download_id,
      user_id,
      video_id,
      download_at: new Date(),
    });

    res.status(statusCodes.created).json({
      statusCode: statusCodes.created,
      ok: true,
      message: "Download history added successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

// Get Download History
router.get("/", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;

    // Get download history logic here
    const history = await db
      .select()
      .from(download_history)
      .where(eq(download_history.user_id, user_id));

    res.status(statusCodes.ok).json({
      statusCode: statusCodes.ok,
      ok: true,
      message: "Download history fetched successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
});
// Delete Download History
router.delete(
  "/:video_id",
  ensureAuthenticated,
  async (req: any, res, next) => {
    try {
      const user_id = req.user.user_id;
      const { video_id } = req.params;

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Invalid Video Id");

      // Delete download history logic here
      await db
        .delete(download_history)
        .where(
          and(
            eq(download_history.user_id, user_id),
            eq(download_history.user_id, user_id)
          )
        );

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Download history Deleted successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
