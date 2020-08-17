CREATE TABLE "public"."messageTemplate"("id" bigserial NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "via" varchar NOT NULL, "version" bigint NOT NULL, "locale" varchar NOT NULL, "data" jsonb NOT NULL, "value" text NOT NULL, "app_id" bigint NOT NULL, "kind_id" bigint NOT NULL, PRIMARY KEY ("id") );
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
CREATE TRIGGER "set_public_messageTemplate_updated_at"
BEFORE UPDATE ON "public"."messageTemplate"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_messageTemplate_updated_at" ON "public"."messageTemplate" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';