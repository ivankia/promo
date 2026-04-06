-- CreateTable
CREATE TABLE "promocodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "activations_limit" INTEGER NOT NULL DEFAULT 0,
    "activations_count" INTEGER NOT NULL DEFAULT 0,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promocodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "promocode_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promocodes_created_at_idx" ON "promocodes"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "promocodes_code_key" ON "promocodes"("code");

-- CreateIndex
CREATE INDEX "activations_promocode_id_idx" ON "activations"("promocode_id");

-- CreateIndex
CREATE INDEX "activations_promocode_id_email_idx" ON "activations"("promocode_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "activations_email_promocode_id_key" ON "activations"("email", "promocode_id");

-- AddForeignKey
ALTER TABLE "activations" ADD CONSTRAINT "activations_promocode_id_fkey" FOREIGN KEY ("promocode_id") REFERENCES "promocodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
