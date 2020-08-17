alter table "public"."notificationViewed"
           add constraint "notificationViewed_notification_id_fkey"
           foreign key ("notification_id")
           references "public"."notification"
           ("id") on update set null on delete set null;