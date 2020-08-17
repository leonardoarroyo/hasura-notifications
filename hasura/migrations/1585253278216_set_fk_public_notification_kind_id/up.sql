alter table "public"."notification"
           add constraint "notification_kind_id_fkey"
           foreign key ("kind_id")
           references "public"."notificationKind"
           ("id") on update restrict on delete set null;