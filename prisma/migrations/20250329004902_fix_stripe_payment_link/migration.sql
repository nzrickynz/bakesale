/*
  Warnings:

  - You are about to drop the column `organizationId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `causes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `listings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "organizations_adminId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "organizationId";

-- CreateIndex
CREATE UNIQUE INDEX "causes_title_key" ON "causes"("title");

-- CreateIndex
CREATE UNIQUE INDEX "listings_title_key" ON "listings"("title");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");
