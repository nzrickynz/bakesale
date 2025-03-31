/*
  Warnings:

  - You are about to drop the column `stripePaymentLink` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `donations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "donations" DROP CONSTRAINT "donations_causeId_fkey";

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "stripePaymentLink",
ADD COLUMN     "paymentLink" TEXT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentStatus";

-- DropTable
DROP TABLE "donations";

-- DropEnum
DROP TYPE "PaymentStatus";
