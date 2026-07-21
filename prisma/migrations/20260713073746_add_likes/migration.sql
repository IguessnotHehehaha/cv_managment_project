-- CreateTable
CREATE TABLE "likes" (
    "cv_id" UUID NOT NULL,
    "recruiter_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("cv_id","recruiter_id")
);

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_cv_id_fkey" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
