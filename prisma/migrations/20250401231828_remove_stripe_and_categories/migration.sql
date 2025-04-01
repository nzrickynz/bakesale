/*
  Warnings:

  - The `fulfillmentStatus` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "fulfillmentStatus",
ADD COLUMN     "fulfillmentStatus" "OrderStatus" NOT NULL DEFAULT 'ORDERED';

-- CreateIndex
CREATE INDEX "causes_organizationId_idx" ON "causes"("organizationId");
