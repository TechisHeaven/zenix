import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { ensureAuthenticated } from "../../server";
import { uuidRegexTest } from "../../utils/uuidRegexTest";
import { createError } from "../../utils/error.utils";
import statusCodes from "../../utils/status.utils";
import db from "../../db";
import { and, asc, desc, eq } from "drizzle-orm";
import { validateFields } from "../../utils/validate.config";
import { playlist_videos, playlists } from "../../db/schemas/main.schema";
import { v4 as uuidv4 } from "uuid";
import { alias } from "drizzle-orm/pg-core";
import { videos } from "../../db/schemas/video.schema";
import { transformPlaylistVideosData } from "../../utils/format.utils";
import { getSortColumn, withPagination } from "../../utils/pagination.utils";
import { PAGE_SIZE_LIMIT } from "../../constants/main.constants";
dotenv.config();
const router = express.Router();

// Create Playlist API
router.post(
  "/",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;
      const { title, description, is_public } = req.body;

      const validate = validateFields(["title", "description", "is_public"], {
        title,
        description,
        is_public,
      });

      if (!validate.isValid)
        throw createError(
          statusCodes.badRequest,
          `Missing Fields: ${validate.missingFields}`
        );

      const playlist_id = uuidv4();
      await db.insert(playlists).values({
        playlist_id,
        user_id,
        title,
        description,
        is_public,
        created_at: new Date(),
      });

      res.status(statusCodes.created).json({
        statusCode: statusCodes.created,
        ok: true,
        message: "Playlist Created successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update Playlist API
router.put(
  "/:playlist_id",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;
      const { playlist_id } = req.params;
      const { title, description, is_public } = req.body;

      const validate = validateFields(["title", "description", "is_public"], {
        title,
        description,
        is_public,
      });

      if (!validate.isValid)
        throw createError(
          statusCodes.badRequest,
          `Missing Fields: ${validate.missingFields}`
        );

      await db
        .update(playlists)
        .set({
          playlist_id,
          user_id,
          title,
          description,
          is_public,
          updated_at: new Date(),
        })
        .where(eq(playlists.playlist_id, playlist_id));

      res.status(statusCodes.created).json({
        statusCode: statusCodes.created,
        ok: true,
        message: "Playlist Updated successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

// Fetch Playlist API
router.get(
  "/",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;
      const {
        page = 1,
        limit = PAGE_SIZE_LIMIT,
        sort = "asc",
        sortBy,
      } = req.query;

      const sortColumn = getSortColumn(playlists, sortBy, "updated_at");

      let query = db
        .select()
        .from(playlists)
        .where(eq(playlists.user_id, user_id));

      // Get Playlists from the database
      const playlists_result = await withPagination(
        query.$dynamic(),
        sort === "asc" ? asc(sortColumn) : desc(sortColumn),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Playlist Fetched successfully",
        data: {
          playlists: playlists_result,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
// Fetch User Playlist API
router.get(
  "/user/:user_id",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.params;

      const {
        page = 1,
        limit = PAGE_SIZE_LIMIT,
        sort = "asc",
        sortBy,
      } = req.query;

      const sortColumn = getSortColumn(playlists, sortBy, "updated_at");

      let query = db
        .select()
        .from(playlists)
        .where(
          and(eq(playlists.user_id, user_id), eq(playlists.is_public, true))
        );

      // Get Playlists from the database
      const playlists_result = await withPagination(
        query.$dynamic(),
        sort === "asc" ? asc(sortColumn) : desc(sortColumn),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Playlist Fetched successfully",
        data: {
          playlists: playlists_result,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Fetch Playlist API
router.get(
  "/:playlist",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;
      const { playlist } = req.params;

      let playlists_result = await db
        .select()
        .from(playlists)
        .where(eq(playlists.playlist_id, playlist))
        .then((res) => res[0]);

      if (!playlists_result)
        throw createError(statusCodes.notFound, "Playlist Not Found");

      if (playlists_result.user_id !== user_id && !playlists_result.is_public)
        throw createError(statusCodes.badRequest, "Playlist is Private");

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Playlist Fetched successfully",
        data: {
          playlist: playlists_result,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete Playlist
router.delete(
  "/:playlist_id",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { playlist_id } = req.params;

      const playlist = await db
        .select()
        .from(playlists)
        .where(eq(playlists.playlist_id, playlist_id))
        .then((res) => res[0]);

      if (!playlist)
        throw createError(statusCodes.notFound, "Playlist Not Found");

      await db.delete(playlists).where(eq(playlists.playlist_id, playlist_id));

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Playlist Deleted successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);

// Push Playlist Video to Playlist
router.put(
  "/video/:video_id/:playlist_id",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { playlist_id, video_id } = req.params;

      if (!uuidRegexTest(playlist_id) || !uuidRegexTest(video_id))
        throw createError(
          statusCodes.badRequest,
          "Video or Playlist Id isn't Valid"
        );

      const playlist = await db
        .select()
        .from(playlists)
        .where(eq(playlists.playlist_id, playlist_id))
        .then((res) => res[0]);

      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);

      if (!playlist)
        throw createError(statusCodes.notFound, "Playlist Not Found");
      if (!video) throw createError(statusCodes.notFound, "Video Not Found");

      const playlist_video_id = uuidv4();

      await db.transaction(async (tx) => {
        const playlist_exists = await tx
          .select()
          .from(playlist_videos)
          .where(
            and(
              eq(playlist_videos.playlist_id, playlist_id),
              eq(playlist_videos.video_id, video_id)
            )
          )
          .then((res) => res[0]);

        if (playlist_exists)
          throw createError(
            statusCodes.badRequest,
            "Video Already Added in Playlist"
          );

        await tx.insert(playlist_videos).values({
          playlist_video_id: playlist_video_id,
          playlist_id: playlist_id,
          video_id: video_id,
          added_at: new Date(),
        });

        await tx
          .update(playlists)
          .set({
            video_count: playlist.video_count! + 1,
          })
          .where(eq(playlists.playlist_id, playlist_id));
      });

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Playlist video added successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);
// Remove Playlist Video to Playlist
router.delete(
  "/video/:video_id/:playlist_id",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { playlist_id, video_id } = req.params;

      if (!uuidRegexTest(playlist_id) || !uuidRegexTest(video_id))
        throw createError(
          statusCodes.badRequest,
          "Video or Playlist Id isn't Valid"
        );

      const playlist = await db
        .select()
        .from(playlists)
        .where(eq(playlists.playlist_id, playlist_id))
        .then((res) => res[0]);
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);

      if (!playlist)
        throw createError(statusCodes.notFound, "Playlist Not Found");
      if (!video) throw createError(statusCodes.notFound, "Video Not Found");

      await db.transaction(async (tx) => {
        const playlist_exists = await tx
          .select()
          .from(playlist_videos)
          .where(
            and(
              eq(playlist_videos.playlist_id, playlist_id),
              eq(playlist_videos.video_id, video_id)
            )
          )
          .then((res) => res[0]);

        if (!playlist_exists)
          throw createError(
            statusCodes.badRequest,
            "Video Not Exists in Playlist"
          );

        await tx
          .delete(playlist_videos)
          .where(
            and(
              eq(playlist_videos.playlist_id, playlist_id),
              eq(playlist_videos.video_id, video_id)
            )
          );

        await tx
          .update(playlists)
          .set({
            video_count:
              playlist.video_count === 0 ? 0 : playlist.video_count! - 1,
          })
          .where(eq(playlists.playlist_id, playlist_id));
      });

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Playlist video removed successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);
// Fetch Playlist Video
router.get(
  "/videos/:playlist_id",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { playlist_id } = req.params;

      const {
        page = 1,
        limit = PAGE_SIZE_LIMIT,
        sort = "asc",
        sortBy,
      } = req.query;

      if (!uuidRegexTest(playlist_id))
        throw createError(statusCodes.badRequest, " Playlist Id isn't Valid");

      const playlist = await db
        .select()
        .from(playlists)
        .where(eq(playlists.playlist_id, playlist_id))
        .then((res) => res[0]);

      if (!playlist)
        throw createError(statusCodes.notFound, "Playlist Not Found");

      const sortColumn = getSortColumn(playlist_videos, sortBy, "added_at");
      let query = db
        .select()
        .from(playlist_videos)
        .where(eq(playlist_videos.playlist_id, playlist_id))
        .leftJoin(videos, eq(playlist_videos.video_id, videos.video_id));

      // Get Playlists from the database
      const playlist_videos_result = await withPagination(
        query.$dynamic(),
        sort === "asc" ? asc(sortColumn) : desc(sortColumn),
        parseInt(page as string),
        parseInt(limit as string)
      );

      const newPlaylist_videos_result = transformPlaylistVideosData(
        playlist_videos_result
      );

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Playlists Videos Fetched successfully",
        data: {
          playlist_videos: newPlaylist_videos_result,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
