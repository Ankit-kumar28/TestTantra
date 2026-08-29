/*
  Warnings:

  - Added the required column `clubId` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "questions_difficulty_idx";

-- DropIndex
DROP INDEX "questions_type_idx";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "clubId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "questions_clubId_idx" ON "questions"("clubId");

-- CreateIndex
CREATE INDEX "questions_clubId_type_idx" ON "questions"("clubId", "type");

-- CreateIndex
CREATE INDEX "questions_clubId_difficulty_idx" ON "questions"("clubId", "difficulty");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
