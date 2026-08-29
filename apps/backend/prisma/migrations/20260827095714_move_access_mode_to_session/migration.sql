/*
  Warnings:

  - You are about to drop the column `accessMode` on the `exams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "exam_sessions" ADD COLUMN     "accessMode" "ExamAccessMode" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "accessMode";
