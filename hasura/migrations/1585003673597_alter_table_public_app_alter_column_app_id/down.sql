ALTER TABLE "public"."app" ALTER COLUMN "app_id" TYPE character varying;alter table "public"."app" rename column "access_key" to "app_id";