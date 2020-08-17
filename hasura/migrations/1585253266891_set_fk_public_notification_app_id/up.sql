alter table "public"."notification"
           add constraint "notification_app_id_fkey"
           foreign key ("app_id")
           references "public"."app"
           ("id") on update restrict on delete set null;