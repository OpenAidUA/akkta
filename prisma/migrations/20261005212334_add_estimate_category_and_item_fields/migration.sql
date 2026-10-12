-- CreateEnum
CREATE TYPE "EstimateCategory" AS ENUM ('WORK', 'MATERIAL', 'MACHINERY', 'DELIVERY', 'TAX');

-- DropForeignKey
ALTER TABLE "Estimate" DROP CONSTRAINT "Estimate_projectId_fkey";

-- DropForeignKey
ALTER TABLE "EstimateItem" DROP CONSTRAINT "EstimateItem_revisionId_fkey";

-- DropForeignKey
ALTER TABLE "EstimateRevision" DROP CONSTRAINT "EstimateRevision_estimateId_fkey";

-- AlterTable
ALTER TABLE "EstimateItem" ADD COLUMN     "category" "EstimateCategory" NOT NULL DEFAULT 'WORK',
ADD COLUMN     "note" TEXT,
ADD COLUMN     "source" VARCHAR(255),
ADD COLUMN     "sourceDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "EstimateItem_revisionId_category_idx" ON "EstimateItem"("revisionId", "category");

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateRevision" ADD CONSTRAINT "EstimateRevision_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateItem" ADD CONSTRAINT "EstimateItem_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "EstimateRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
