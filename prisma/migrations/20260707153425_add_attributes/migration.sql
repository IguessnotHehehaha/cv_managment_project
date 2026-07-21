-- CreateEnum
CREATE TYPE "AttributeCategory" AS ENUM ('certification', 'domain_knowledge', 'personal_information', 'soft_skills');

-- CreateEnum
CREATE TYPE "AttributeDataType" AS ENUM ('string', 'text', 'image', 'numeric', 'date', 'period', 'boolean', 'dropdown');

-- CreateTable
CREATE TABLE "attributes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AttributeCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "data_type" "AttributeDataType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attributes_name_key" ON "attributes"("name");
