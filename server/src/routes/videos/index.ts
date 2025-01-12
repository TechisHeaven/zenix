import { subscriptions } from "./../../db/schemas/main.schema";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { ensureAuthenticated, ensureEmailVerified } from "../../server";
import { createError } from "../../utils/error.utils";
import db from "../../db";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  comments,
  video_likes,
  video_reports,
  videos,
} from "../../db/schemas/video.schema";
import { uuidRegexTest } from "../../utils/uuidRegexTest";
import multer from "multer";
import multerS3 from "multer-s3";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import statusCodes from "../../utils/status.utils";
import sanitizedConfig from "../../utils/env.config";
import { validateFields } from "../../utils/validate.config";
import { upload_video_files } from "../../constants/requiredfields.constants";
import { getSortColumn, withPagination } from "../../utils/pagination.utils";
import { PAGE_SIZE_LIMIT } from "../../constants/main.constants";
// import { video_statistics } from "../../db/schemas/main.schema";

dotenv.config();
const router = express.Router();

// Configure AWS S3
const s3 = new S3Client({
  credentials: {
    accessKeyId: sanitizedConfig.AWS_ACCESS_KEY_ID!,
    secretAccessKey: sanitizedConfig.AWS_SECRET_ACCESS_KEY!,
  },
  region: sanitizedConfig.AWS_REGION!,
});

// Configure multer-s3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: sanitizedConfig.AWS_BUCKET_NAME!,
    serverSideEncryption: "AES256",
    key: function (req, file, cb) {
      cb(null, `videos/${uuidv4()}_${file.originalname}`);
    },
  }),
});

// Upload Video API
router.post(
  "/upload",
  ensureAuthenticated,
  ensureEmailVerified,
  (req: any, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        return next(err);
      }
      next();
    });
  },
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;
      // const metadata = req.body.metadata;
      // console.log(metadata);
      const { title, description } = req.body;
      // typeof metadata === "string" ? JSON.parse(metadata) : metadata || {};

      const file = req.file;

      const validate = validateFields(upload_video_files, {
        title,
        description,
        file,
      });
      if (!validate.isValid)
        throw createError(404, `Missing Fields ${validate.missingFields}`);
      if (!file) {
        throw createError(statusCodes.badRequest, "No file uploaded");
      }

      if (file.mimetype !== "video/mp4" && file.mimetype !== "video/mkv") {
        throw createError(
          statusCodes.badRequest,
          "Only video files are allowed"
        );
      }

      // Save video details to the database
      const video_id = uuidv4();
      const stat_id = uuidv4();

      await db.transaction(async (tx) => {
        await tx.insert(videos).values({
          video_id,
          user_id,
          title,
          description,
          url: file.location,
          file_size: file.size,
        });
        // await tx.insert(video_statistics).values({
        //   stat_id,
        //   video_id,
        // });
      });

      res.status(statusCodes.created).json({
        statusCode: statusCodes.created,
        ok: true,
        message: "Video uploaded successfully",
        data: { video_id },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get Video Details API
router.get(
  "/:video_id",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user_id = req.user.user_id;
      const { video_id } = req.params;

      if (!uuidRegexTest(video_id)) {
        throw createError(statusCodes.badRequest, "Invalid Video Id");
      }

      const subscriptions_user = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.user_id, user_id))
        .then((res) => res[0]);

      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .leftJoin(comments, eq(comments.video_id, video_id))
        .then((res) => res[0]);

      if (!video) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      if (
        (!subscriptions_user && video.videos.is_exclusive_for_premium) ||
        (subscriptions_user.status === "cancelled" &&
          video.videos.is_exclusive_for_premium)
      )
        throw createError(
          statusCodes.badRequest,
          "Non-Subscribed User cannot watch premium Videos"
        );

      const result = [video].reduce((acc: any[], current: any) => {
        const { videos: video, comments: comment } = current;

        // Check if the video is already added to the accumulator
        let videoEntry = acc.find(
          (v: { video_id: string }) => v.video_id === video.video_id
        );
        if (!videoEntry) {
          // Add the video and initialize its comments array
          videoEntry = { ...video, comments: [] };
          acc.push(videoEntry);
        }

        // Add the comment if it exists
        if (comment) {
          videoEntry.comments.push(comment);
        }

        return acc;
      }, []);

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Video fetched successfully",
        data: {
          ...result,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

type QueryParams = {
  page: string;
  limit: string;
  sort: "asc" | "desc";
  sortBy: string;
};
// Get All Videos API
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
      } = req.query as QueryParams;

      const subscriptions_user = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.user_id, user_id))
        .then((res) => res[0]);

      let query: any = db.select().from(videos);

      if (!subscriptions_user || subscriptions_user.status === "cancelled") {
        query = query.where(and(eq(videos.is_exclusive_for_premium, false)));
      }

      // Get Sorted Column for Dynamic Fetching
      const sortColumn = getSortColumn(videos, sortBy, "updated_at");

      const allVideos = await withPagination(
        query.$dynamic(),
        sort === "asc" ? asc(sortColumn) : desc(sortColumn),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Videos fetched successfully",
        data: {
          videos: allVideos,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Search Videos API
router.get(
  "/search/video",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        q,
        page = 1,
        limit = PAGE_SIZE_LIMIT,
        sort = "asc",
        sortBy,
      } = req.query;

      if (!q) {
        throw createError(statusCodes.badRequest, "Search term is required");
      }

      const sortColumn = getSortColumn(videos, sortBy, "updated_at");

      const query = db
        .select()
        .from(videos)
        .where(ilike(videos.title, `%${q}%`));

      const searchResults = await withPagination(
        query.$dynamic(),
        sort === "asc" ? asc(sortColumn) : desc(sortColumn),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Video Searched successfully",
        data: {
          videos: searchResults,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:video_id",
  ensureAuthenticated,
  ensureEmailVerified,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;
      const user_id = req.user.user_id;

      if (!uuidRegexTest(video_id)) {
        throw createError(statusCodes.badRequest, "Invalid Video Id");
      }

      // Fetch video details from the database
      const video = await db
        .select()
        .from(videos)
        .where(and(eq(videos.video_id, video_id), eq(videos.user_id, user_id)))
        .then((res) => res[0]);

      if (!video) {
        throw createError(
          statusCodes.notFound,
          "Video not found or not authorized"
        );
      }

      // Delete video from S3
      if (!video.url) {
        throw createError(statusCodes.badRequest, "Video URL is missing");
      }

      const deleteParams = {
        Bucket: sanitizedConfig.AWS_BUCKET_NAME!,
        Key: video.url.split("/").slice(3).join("/"), // Extract the key from the URL
      };

      await s3.send(new DeleteObjectCommand(deleteParams));

      // Delete video from the database
      await db.delete(videos).where(eq(videos.video_id, video_id));

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Video deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Like Video API
router.post(
  "/:video_id/like",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;
      const user_id = req.user.user_id;

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Invalid Video Id");

      // Check if the video exists
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);
      if (!video) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      const existingLike = await db
        .select()
        .from(video_likes)
        .where(
          and(
            eq(video_likes.video_id, video_id),
            eq(video_likes.user_id, user_id)
          )
        );

      if (existingLike.length > 0) {
        await db.transaction(async (tx) => {
          if (existingLike[0].is_like) {
            await tx
              .delete(video_likes)
              .where(
                and(
                  eq(video_likes.video_id, video_id),
                  eq(video_likes.user_id, user_id)
                )
              );
            await tx
              .update(videos)
              .set({
                likes_count:
                  video.likes_count === 0 ? 0 : video.likes_count! - 1,
              })
              .where(eq(videos.video_id, video_id));
          } else {
            await tx
              .update(video_likes)
              .set({
                is_like: true,
              })
              .where(
                and(
                  eq(video_likes.video_id, video_id),
                  eq(video_likes.user_id, user_id)
                )
              );
            await tx
              .update(videos)
              .set({
                likes_count: video.likes_count! + 1,
                dislikes_count:
                  video.dislikes_count === 0 ? 0 : video.dislikes_count! - 1,
              })
              .where(eq(videos.video_id, video_id));
          }
          // await tx
          //   .update(video_statistics)
          //   .set({
          //     video_id,
          //     total_likes: video.likes_count === 0 ? 0 : video.likes_count! - 1,
          //   })
          //   .where(eq(video_statistics.video_id, video_id));
        });
      } else {
        const video_like_id = uuidv4();
        // Add like to the database
        await db.insert(video_likes).values({
          like_id: video_like_id,
          video_id,
          user_id,
          is_like: true,
        });

        const currentLikes = await db
          .select({ likes_count: videos.likes_count })
          .from(videos)
          .where(eq(videos.video_id, video_id))
          .then((res) => res[0].likes_count);

        // Update the likes count in the videos table and statistics table
        await db.transaction(async (tx) => {
          await tx
            .update(videos)
            .set({
              likes_count: currentLikes! + 1,
            })
            .where(eq(videos.video_id, video_id));
          // Add like to the database
          // await tx
          //   .update(video_statistics)
          //   .set({
          //     video_id,
          //     total_likes: currentLikes! + 1,
          //   })
          //   .where(eq(video_statistics.video_id, video_id));
        });
      }
      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Video liked successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);
// Dislike Video API
router.post(
  "/:video_id/dislike",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;
      const user_id = req.user.user_id;

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Invalid Video Id");

      // Check if the video exists
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);
      if (!video) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      const existingLike = await db
        .select()
        .from(video_likes)
        .where(
          and(
            eq(video_likes.video_id, video_id),
            eq(video_likes.user_id, user_id)
          )
        );

      if (existingLike.length > 0) {
        await db.transaction(async (tx) => {
          if (!existingLike[0].is_like) {
            await tx
              .delete(video_likes)
              .where(
                and(
                  eq(video_likes.video_id, video_id),
                  eq(video_likes.user_id, user_id)
                )
              );

            await tx
              .update(videos)
              .set({
                dislikes_count:
                  video.dislikes_count === 0 ? 0 : video.dislikes_count! - 1,
              })
              .where(eq(videos.video_id, video_id));
          } else {
            await tx
              .update(video_likes)
              .set({
                is_like: false,
              })
              .where(
                and(
                  eq(video_likes.video_id, video_id),
                  eq(video_likes.user_id, user_id)
                )
              );

            await tx
              .update(videos)
              .set({
                dislikes_count:
                  video.dislikes_count! === 0 ? 1 : video.dislikes_count! + 1,
                likes_count:
                  video.likes_count === 0 ? 0 : video.likes_count! - 1,
              })
              .where(eq(videos.video_id, video_id));
          }
          // await tx
          //   .update(video_statistics)
          //   .set({
          //     total_dislikes:
          //       video.dislikes_count === 0 ? 0 : video.dislikes_count! - 1,
          //   })
          //   .where(eq(video_statistics.video_id, video_id));
        });
      } else {
        const video_like_id = uuidv4();
        // Add like to the database
        await db.insert(video_likes).values({
          like_id: video_like_id,
          video_id,
          user_id,
          is_like: false,
        });

        const currentLikes = await db
          .select({ likes_count: videos.likes_count })
          .from(videos)
          .where(eq(videos.video_id, video_id))
          .then((res) => res[0].likes_count);

        // Update the likes count in the videos table and statistics table
        await db.transaction(async (tx) => {
          await tx
            .update(videos)
            .set({
              dislikes_count: currentLikes === 0 ? 1 : currentLikes! + 1,
            })
            .where(eq(videos.video_id, video_id));
          // Add like to the database
          // await tx
          //   .update(video_statistics)
          //   .set({
          //     video_id,
          //     total_likes: currentLikes === 0 ? 0 : currentLikes! + 1,
          //   })
          //   .where(eq(video_statistics.video_id, video_id));
        });
      }

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Video Disliked successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:video_id/comments",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;
      const user_id = req.user.user_id;
      const { comment } = req.body;

      if (!comment)
        throw createError(statusCodes.badRequest, "Comment is required");

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Invalid Video Id");

      // Check if the video exists
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);

      if (!video) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      await db.transaction(async (tx) => {
        // Add comment to the database
        await tx.insert(comments).values({
          comment_id: uuidv4(),
          video_id,
          user_id,
          comment,
          created_at: new Date(),
        });
        // Increment comments count
        await tx
          .update(videos)
          .set({
            comments_count: video.comments_count! + 1,
          })
          .where(eq(videos.video_id, video_id));

        // await tx
        //   .update(video_statistics)
        //   .set({
        //     total_comments: video.comments_count! + 1,
        //   })
        //   .where(eq(videos.video_id, video_id));
      });

      res.status(statusCodes.created).json({
        statusCode: statusCodes.created,
        ok: true,
        message: "Comment added successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);
router.delete(
  "/:video_id/comment/:comment_id",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { video_id, comment_id } = req.params;
      const user_id = req.user.user_id;

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Invalid Video Id");
      if (!uuidRegexTest(comment_id))
        throw createError(statusCodes.badRequest, "Invalid Comment Id");

      // Check if the video exists
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);

      if (!video) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      await db.transaction(async (tx) => {
        // Add comment to the database
        await tx
          .delete(comments)
          .where(
            and(
              eq(comments.video_id, video_id),
              eq(comments.user_id, user_id),
              eq(comments.comment_id, comment_id)
            )
          );

        // Decrement comments count
        await tx
          .update(videos)
          .set({
            comments_count:
              video.comments_count === 0 ? 0 : video.comments_count! - 1,
          })
          .where(eq(videos.video_id, video_id));

        // await tx
        //   .update(video_statistics)
        //   .set({
        //     total_comments:
        //       video.comments_count === 0 ? 0 : video.comments_count! - 1,
        //   })
        //   .where(eq(videos.video_id, video_id));
      });

      res.status(statusCodes.created).json({
        statusCode: statusCodes.created,
        ok: true,
        message: "Comment Deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get Comments API
router.get(
  "/:video_id/comments",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;
      const {
        page = 1,
        limit = PAGE_SIZE_LIMIT,
        sort = "asc",
        sortBy,
      } = req.query;

      if (!video_id)
        throw createError(statusCodes.badRequest, "Video Id is required");

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Invalid Video Id");
      // Check if the video exists
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);
      if (!video) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      const sortColumn = getSortColumn(comments, sortBy, "updated_at");

      const query = db
        .select()
        .from(comments)
        .where(eq(comments.video_id, video_id));

      // Get comments from the database
      const videoComments = await withPagination(
        query.$dynamic(),
        sort === "asc" ? asc(sortColumn) : desc(sortColumn),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Comments fetched successfully",
        data: {
          comments: videoComments,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:video_id/report",
  ensureAuthenticated,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;
      const user_id = req.user.user_id;
      const { reason } = req.body;

      const validate = validateFields(["reason", "video_id", "user_id"], {
        video_id,
        user_id,
        reason,
      });
      if (!validate.isValid)
        throw createError(
          statusCodes.badRequest,
          `Missing Fields ${validate.missingFields}`
        );

      // Check if the video exists
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id));
      if (!video[0]) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      // Add report to the database
      await db.insert(video_reports).values({
        report_id: uuidv4(),
        video_id,
        user_id,
        reason,
        created_at: new Date(),
      });

      res.status(statusCodes.created).json({
        statusCode: statusCodes.created,
        ok: true,
        message: "Video reported successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:video_id/analytics",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Invalid Video Id");

      // Check if the video exists
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);
      if (!video) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      // Fetch video analytics
      const analytics = await db
        .select({
          views: videos.views,
          likes: videos.likes_count,
          dislikes: videos.dislikes_count,
          comments: videos.comments_count,
        })
        .from(videos)
        .where(eq(videos.video_id, video_id))
        .then((res) => res[0]);

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Video analytics fetched successfully",
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:video_id/premium",
  ensureAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;
      const { isPremium } = req.body;

      if (!uuidRegexTest(video_id))
        throw createError(statusCodes.badRequest, "Invalid Video Id");

      if (!isPremium)
        throw createError(statusCodes.badRequest, "values must be provided");
      // Check if the video exists
      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id));
      if (!video[0]) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      // Update video premium status
      await db
        .update(videos)
        .set({
          is_exclusive_for_premium: isPremium,
        })
        .where(eq(videos.video_id, video_id));

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Video premium status updated successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
);
export default router;
