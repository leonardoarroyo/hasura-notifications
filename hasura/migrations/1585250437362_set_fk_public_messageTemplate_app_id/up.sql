alter table "public"."messageTemplate"
           add constraint "messageTemplate_app_id_fkey"
           foreign key ("app_id")
           references "public"."app"
           ("id") on update restrict on delete set null;