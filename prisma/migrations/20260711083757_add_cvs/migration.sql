-- CreateEnum
CREATE TYPE "CvStatus" AS ENUM ('draft', 'published');

-- CreateTable
CREATE TABLE "cvs" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "status" "CvStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cvs_profile_id_position_id_key" ON "cvs"("profile_id", "position_id");

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
