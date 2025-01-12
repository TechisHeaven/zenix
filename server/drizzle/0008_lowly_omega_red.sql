ALTER TABLE "videos" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[];--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "category" SET DEFAULT ARRAY[]::text[];