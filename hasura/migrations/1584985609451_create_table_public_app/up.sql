CREATE TABLE "public"."app"("id" bigserial NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "app_id" varchar NOT NULL, "secret" varchar NOT NULL, PRIMARY KEY ("id") , UNIQUE ("app_id"));
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_app_updated_at"
BEFORE UPDATE ON "public"."app"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_app_updated_at" ON "public"."app" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';