ALTER TABLE "public"."messageTemplate" ADD COLUMN "name" varchar;ALTER TABLE "public"."messageTemplate" ALTER COLUMN "name" DROP NOT NULL;