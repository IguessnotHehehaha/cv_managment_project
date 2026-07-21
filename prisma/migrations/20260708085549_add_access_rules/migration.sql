-- CreateTable
CREATE TABLE "position_access_rules" (
    "id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "attribute_id" UUID NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "position_access_rules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "position_access_rules" ADD CONSTRAINT "position_access_rules_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position_access_rules" ADD CONSTRAINT "position_access_rules_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
