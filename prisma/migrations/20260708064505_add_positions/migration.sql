-- CreateEnum
CREATE TYPE "PositionVisibility" AS ENUM ('public', 'restricted');

-- CreateEnum
CREATE TYPE "PositionLevel" AS ENUM ('junior', 'middle', 'senior', 'c_level');

-- CreateTable
CREATE TABLE "positions" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company" TEXT,
    "level" "PositionLevel",
    "visibility" "PositionVisibility" NOT NULL DEFAULT 'public',
    "max_projects" INTEGER NOT NULL DEFAULT 3,
    "project_tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_attributes" (
    "position_id" UUID NOT NULL,
    "attribute_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "position_attributes_pkey" PRIMARY KEY ("position_id","attribute_id")
);

-- AddForeignKey
ALTER TABLE "position_attributes" ADD CONSTRAINT "position_attributes_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_attributes" ADD CONSTRAINT "position_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
