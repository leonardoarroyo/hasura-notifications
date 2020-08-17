alter table "public"."messageTemplate"
           add constraint "messageTemplate_kind_id_fkey"
           foreign key ("kind_id")
           references "public"."notificationKind"
           ("id") on update restrict on delete set null;