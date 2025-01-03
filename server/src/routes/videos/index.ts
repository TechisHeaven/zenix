import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { ensureAuthenticated, ensureEmailVerified } from "../../server";
import { createError } from "../../utils/error.utils";
import db from "../../db";
import { and, eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { videos } from "../../db/schemas/video.schema";
import { uuidRegexTest } from "../../utils/uuidRegexTest";
import multer from "multer";
import multerS3 from "multer-s3";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import statusCodes from "../../utils/status.utils";
import sanitizedConfig from "../../utils/env.config";
import { validateFields } from "../../utils/validate.config";
import { upload_video_files } from "../../constants/requiredfields.constants";

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
      const { title, description } =
        typeof req.body.metadata === "string"
          ? JSON.parse(req.body.metadata)
          : req.body.metadata || {};

      const file = req.file;
      if (file.mimetype !== "video/mp4" && file.mimetype !== "video/mkv") {
        throw createError(
          statusCodes.badRequest,
          "Only video files are allowed"
        );
      }

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

      // Save video details to the database
      const video_id = uuidv4();
      const result = await db.insert(videos).values({
        video_id,
        user_id,
        title,
        description,
        url: file.location,
        file_size: file.size,
      });

      console.log(result);

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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { video_id } = req.params;

      if (!uuidRegexTest(video_id)) {
        throw createError(statusCodes.badRequest, "Invalid Video Id");
      }

      const video = await db
        .select()
        .from(videos)
        .where(eq(videos.video_id, video_id));
      if (!video[0]) {
        throw createError(statusCodes.notFound, "Video not found");
      }

      res.status(statusCodes.ok).json({
        statusCode: statusCodes.ok,
        ok: true,
        message: "Video fetched successfully",
        data: {
          video: video[0],
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get All Videos API
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allVideos = await db.select().from(videos);

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
});

// Search Videos API
router.get(
  "/search/video",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;

      if (!q) {
        throw createError(statusCodes.badRequest, "Search term is required");
      }

      const searchResults = await db
        .select()
        .from(videos)
        .where(ilike(videos.title, `%${q}%`));

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

export default router;
