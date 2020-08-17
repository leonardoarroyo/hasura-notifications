alter table "public"."notification"
           add constraint "notification_message_template_id_fkey"
           foreign key ("message_template_id")
           references "public"."messageTemplate"
           ("id") on update restrict on delete set null;