import express from "express";
import { ensureAuthenticated } from "../../../server";
import {
  download_history,
  watch_history,
} from "../../../db/schemas/main.schema";
import db from "../../../db";
import { v4 as uuidv4 } from "uuid";
import statusCodes from "../../../utils/status.utils";
import { and, asc, desc, eq } from "drizzle-orm";
import { createError } from "../../../utils/error.utils";
import { uuidRegexTest } from "../../../utils/uuidRegexTest";
import { getSortColumn, withPagination } from "../../../utils/pagination.utils";
import { PAGE_SIZE_LIMIT } from "../../../constants/main.constants";
import { videos } from "../../../db/schemas/video.schema";

const router = express.Router();

// Add Download History
router.post("/", ensureAuthenticated, async (req: any, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { video_id } = req.body;

    if (!video_id)
      throw createError(statusCodes.badRequest, "Video Id is Required");

    const video = await db
      .select()
      .from(videos)
      .where(eq(videos.video_id, video_id))
      .then((res) => res[0]);

    if (!video) throw createError(statusCodes.badRequest, "Video Not Exists");

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

    await db.transaction(async (tx) => {
      tx.insert(download_history).values({
        download_id,
        user_id,
        video_id,
        download_at: new Date(),
      }),
        tx.update(videos).set({
          download_count: video.download_count!++,
        });
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
    const {
      page = 1,
      limit = PAGE_SIZE_LIMIT,
      sort = "asc",
      sortBy,
    } = req.query;

    // Get download history logic here
    const query = db
      .select()
      .from(download_history)
      .where(eq(download_history.user_id, user_id));

    const sortColumn = getSortColumn(download_history, sortBy, "added_at");

    // Get Playlists from the database
    const history = await withPagination(
      query.$dynamic(),
      sort === "asc" ? asc(sortColumn) : desc(sortColumn),
      parseInt(page as string),
      parseInt(limit as string)
    );

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

      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);

      if (!video) throw createError(statusCodes.badRequest, "Video Not Exists");

      // Delete download history logic here
      await db.transaction(async (tx) => {
        tx
          .delete(download_history)
          .where(
            and(
              eq(download_history.user_id, user_id),
              eq(download_history.user_id, user_id)
            )
          ),
          tx.update(videos).set({
            download_count:
              video.download_count === 0 ? 0 : video.download_count!--,
          });
      });

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
