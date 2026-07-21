-- CreateTable
CREATE TABLE "attribute_usage" (
    "profile_id" UUID NOT NULL,
    "attribute_id" UUID NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_usage_pkey" PRIMARY KEY ("profile_id","attribute_id")
);

-- AddForeignKey
ALTER TABLE "attribute_usage" ADD CONSTRAINT "attribute_usage_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_usage" ADD CONSTRAINT "attribute_usage_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
