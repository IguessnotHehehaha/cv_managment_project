-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_fkey";

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "email" TEXT,
ADD COLUMN "is_blocked" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

