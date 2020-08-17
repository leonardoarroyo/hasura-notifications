alter table "public"."notificationTrigger"
           add constraint "notificationTrigger_app_id_fkey"
           foreign key ("app_id")
           references "public"."app"
           ("id") on update restrict on delete restrict;