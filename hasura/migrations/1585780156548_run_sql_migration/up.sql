ALTER TABLE notification ADD CONSTRAINT
  via_fkey FOREIGN KEY (via) REFERENCES "notificationVia";