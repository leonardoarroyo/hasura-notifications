alter table "public"."notificationTrigger"
           add constraint "notificationTrigger_kind_id_fkey"
           foreign key ("kind_id")
           references "public"."notificationKind"
           ("id") on update restrict on delete restrict;