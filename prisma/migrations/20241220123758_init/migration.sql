-- CreateTable
CREATE TABLE "YoutubeData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentVideoId" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WebsiteData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "currentPostId" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "donationId" INTEGER NOT NULL,
    "donorName" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "message" TEXT,
    "donationDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "roles" TEXT NOT NULL,
    "firstJoinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "points_challenge" INTEGER NOT NULL DEFAULT 0,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "lastDailyExp" DATETIME,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "birthday" TEXT,
    "count_quiz_Success" INTEGER NOT NULL DEFAULT 0,
    "count_quiz_Fail" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nb_response_success" INTEGER NOT NULL,
    "nb_response_fail" INTEGER NOT NULL,
    "note" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThreadReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "theme" TEXT NOT NULL,
    "dateLimite" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "ChallengeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeSubmission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChallengeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UdemyCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "numSubscribers" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TutorCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "numStudents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_donationId_key" ON "Donation"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadReward_threadId_userId_key" ON "ThreadReward"("threadId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewId_key" ON "Review"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "UdemyCourse_courseId_key" ON "UdemyCourse"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorCourse_courseId_key" ON "TutorCourse"("courseId");
