-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('draft', 'agreed');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "primaryClientId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'active',
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateRevision" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "EstimateStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstimateRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateItem" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EstimateItem_pkey" PRIMARY KEY ("id")
);

-- AlterTable: add nullable projectId to Act (no data loss, existing rows get NULL)
ALTER TABLE "Act" ADD COLUMN "projectId" TEXT;

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "Project_primaryClientId_idx" ON "Project"("primaryClientId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_projectId_key" ON "Estimate"("projectId");

-- CreateIndex
CREATE INDEX "EstimateRevision_estimateId_idx" ON "EstimateRevision"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateRevision_estimateId_version_key" ON "EstimateRevision"("estimateId", "version");

-- CreateIndex
CREATE INDEX "EstimateItem_revisionId_idx" ON "EstimateItem"("revisionId");

-- CreateIndex
CREATE INDEX "Act_projectId_idx" ON "Act"("projectId");

-- AddForeignKey: Project belongs to Organization (same semantics as Client.organizationId)
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Project's primary client is optional; deleting the client detaches the project instead of deleting it
ALTER TABLE "Project" ADD CONSTRAINT "Project_primaryClientId_fkey" FOREIGN KEY ("primaryClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Estimate is 1:1 owned by Project; deleting the project removes its estimate
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Revisions are owned by the estimate; deleting the estimate removes its revisions
ALTER TABLE "EstimateRevision" ADD CONSTRAINT "EstimateRevision_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Items are owned by the revision; deleting the revision removes its items
ALTER TABLE "EstimateItem" ADD CONSTRAINT "EstimateItem_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "EstimateRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Act -> Project is optional; deleting a project detaches acts instead of deleting them
ALTER TABLE "Act" ADD CONSTRAINT "Act_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
