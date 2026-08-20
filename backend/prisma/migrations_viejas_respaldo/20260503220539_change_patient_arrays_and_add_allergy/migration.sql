/*
  Warnings:

  - The `allergies` column on the `Patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `chronicDiseases` column on the `Patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "currentTreatments" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "allergies",
ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "chronicDiseases",
ADD COLUMN     "chronicDiseases" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Allergy_name_key" ON "Allergy"("name");
