/*
  Warnings:

  - You are about to drop the column `dispatch_type` on the `Verification` table. All the data in the column will be lost.
  - Added the required column `event_type` to the `Verification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Verification_user_id_dispatch_type_idx";

-- AlterTable
ALTER TABLE "Verification" DROP COLUMN "dispatch_type",
ADD COLUMN     "event_type" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Verification_user_id_event_type_idx" ON "Verification"("user_id", "event_type");
