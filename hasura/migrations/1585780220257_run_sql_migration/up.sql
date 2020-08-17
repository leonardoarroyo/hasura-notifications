ALTER TABLE "messageTemplate" ADD CONSTRAINT
  via_fkey FOREIGN KEY (via) REFERENCES "notificationVia";