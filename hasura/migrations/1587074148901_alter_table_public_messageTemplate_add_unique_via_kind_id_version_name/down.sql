alter table "public"."messageTemplate" drop constraint "messageTemplate_via_kind_id_version_name_key";alter table "public"."messageTemplate" add constraint "messageTemplate_via_kind_id_version_key" unique ("via", "kind_id", "version");