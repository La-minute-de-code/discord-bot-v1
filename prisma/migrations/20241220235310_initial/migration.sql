/*
  Warnings:

  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TutorCourse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `currentPostId` on the `WebsiteData` table. All the data in the column will be lost.
  - You are about to drop the column `currentVideoId` on the `YoutubeData` table. All the data in the column will be lost.
  - Added the required column `description` to the `WebsiteData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postId` to the `WebsiteData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishedAt` to the `WebsiteData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `WebsiteData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `WebsiteData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `YoutubeData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishedAt` to the `YoutubeData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailUrl` to the `YoutubeData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `YoutubeData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoId` to the `YoutubeData` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Review_reviewId_key";

-- DropIndex
DROP INDEX "TutorCourse_courseId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Review";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TutorCourse";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LiveStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "platform" TEXT NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "streamId" TEXT,
    "title" TEXT,
    "thumbnail" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WebsiteData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "url" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_WebsiteData" ("id", "updatedAt") SELECT "id", "updatedAt" FROM "WebsiteData";
DROP TABLE "WebsiteData";
ALTER TABLE "new_WebsiteData" RENAME TO "WebsiteData";
CREATE UNIQUE INDEX "WebsiteData_postId_key" ON "WebsiteData"("postId");
CREATE TABLE "new_YoutubeData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_YoutubeData" ("id", "updatedAt") SELECT "id", "updatedAt" FROM "YoutubeData";
DROP TABLE "YoutubeData";
ALTER TABLE "new_YoutubeData" RENAME TO "YoutubeData";
CREATE UNIQUE INDEX "YoutubeData_videoId_key" ON "YoutubeData"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LiveStatus_platform_key" ON "LiveStatus"("platform");
