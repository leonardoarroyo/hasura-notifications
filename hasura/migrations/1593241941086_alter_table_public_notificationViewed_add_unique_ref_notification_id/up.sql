alter table "public"."notificationViewed" add constraint "notificationViewed_ref_notification_id_key" unique ("ref", "notification_id");