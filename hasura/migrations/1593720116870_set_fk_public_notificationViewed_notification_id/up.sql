alter table "public"."notificationViewed" drop constraint "notificationViewed_notification_id_fkey",
             add constraint "notificationViewed_notification_id_fkey"
             foreign key ("notification_id")
             references "public"."notification"
             ("id") on update restrict on delete restrict;