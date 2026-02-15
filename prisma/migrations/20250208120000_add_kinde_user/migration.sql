-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kinde_id" TEXT;
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_kinde_id_key" ON "users"("kinde_id");
