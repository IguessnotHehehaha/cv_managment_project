-- CreateTable
CREATE TABLE "profile_attribute_values" (
    "profile_id" UUID NOT NULL,
    "attribute_id" UUID NOT NULL,
    "value" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_attribute_values_pkey" PRIMARY KEY ("profile_id","attribute_id")
);

-- AddForeignKey
ALTER TABLE "profile_attribute_values" ADD CONSTRAINT "profile_attribute_values_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_attribute_values" ADD CONSTRAINT "profile_attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
