/*
  Warnings:

  - You are about to drop the column `stripePaymentLink` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `stripeProductId` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountId` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "listings" DROP COLUMN "stripePaymentLink",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeProductId";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "stripeAccountId";
