CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE TABLE public.app (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    access_key character varying NOT NULL,
    secret character varying NOT NULL,
    name character varying
);
CREATE SEQUENCE public.app_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.app_id_seq OWNED BY public.app.id;
CREATE TABLE public."awsCredential" (
    id bigint NOT NULL,
    app_id bigint NOT NULL,
    access_key character varying NOT NULL,
    secret_key character varying NOT NULL,
    region character varying NOT NULL
);
CREATE SEQUENCE public."awsCredentials_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."awsCredentials_id_seq" OWNED BY public."awsCredential".id;
CREATE TABLE public."messageTemplate" (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    via character varying NOT NULL,
    version bigint NOT NULL,
    locale character varying NOT NULL,
    data jsonb NOT NULL,
    value text NOT NULL,
    app_id bigint NOT NULL,
    kind_id bigint NOT NULL,
    recipient_type character varying NOT NULL
);
CREATE SEQUENCE public."messageTemplate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."messageTemplate_id_seq" OWNED BY public."messageTemplate".id;
CREATE TABLE public.notification (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    via character varying NOT NULL,
    recipient character varying NOT NULL,
    data jsonb,
    meta jsonb,
    message_template_id bigint NOT NULL,
    app_id bigint NOT NULL,
    kind_id bigint NOT NULL,
    scheduled_to timestamp with time zone NOT NULL
);
CREATE TABLE public."notificationKind" (
    id bigint NOT NULL,
    app_id bigint NOT NULL,
    value character varying NOT NULL
);
CREATE SEQUENCE public."notificationKind_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."notificationKind_id_seq" OWNED BY public."notificationKind".id;
CREATE TABLE public."notificationLog" (
    id bigint NOT NULL,
    notification_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying NOT NULL,
    data jsonb
);
CREATE SEQUENCE public."notificationLog_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."notificationLog_id_seq" OWNED BY public."notificationLog".id;
CREATE TABLE public."notificationTrigger" (
    id bigint NOT NULL,
    app_id bigint NOT NULL,
    kind_id bigint,
    message_template_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    recipient_type character varying
);
CREATE SEQUENCE public."notificationTrigger_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."notificationTrigger_id_seq" OWNED BY public."notificationTrigger".id;
CREATE TABLE public."notificationVia" (
    via text NOT NULL
);
CREATE TABLE public."notificationViewed" (
    id bigint NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    ref character varying NOT NULL,
    notification_id integer NOT NULL
);
CREATE SEQUENCE public."notificationViewed_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public."notificationViewed_id_seq" OWNED BY public."notificationViewed".id;
CREATE SEQUENCE public.notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;
ALTER TABLE ONLY public.app ALTER COLUMN id SET DEFAULT nextval('public.app_id_seq'::regclass);
ALTER TABLE ONLY public."awsCredential" ALTER COLUMN id SET DEFAULT nextval('public."awsCredentials_id_seq"'::regclass);
ALTER TABLE ONLY public."messageTemplate" ALTER COLUMN id SET DEFAULT nextval('public."messageTemplate_id_seq"'::regclass);
ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);
ALTER TABLE ONLY public."notificationKind" ALTER COLUMN id SET DEFAULT nextval('public."notificationKind_id_seq"'::regclass);
ALTER TABLE ONLY public."notificationLog" ALTER COLUMN id SET DEFAULT nextval('public."notificationLog_id_seq"'::regclass);
ALTER TABLE ONLY public."notificationTrigger" ALTER COLUMN id SET DEFAULT nextval('public."notificationTrigger_id_seq"'::regclass);
ALTER TABLE ONLY public."notificationViewed" ALTER COLUMN id SET DEFAULT nextval('public."notificationViewed_id_seq"'::regclass);
ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_app_id_key UNIQUE (access_key);
ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public."awsCredential"
    ADD CONSTRAINT "awsCredential_app_id_key" UNIQUE (app_id);
ALTER TABLE ONLY public."awsCredential"
    ADD CONSTRAINT "awsCredentials_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."messageTemplate"
    ADD CONSTRAINT "messageTemplate_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."messageTemplate"
    ADD CONSTRAINT "messageTemplate_via_kind_id_version_recipient_type_key" UNIQUE (via, kind_id, version, recipient_type);
ALTER TABLE ONLY public."notificationKind"
    ADD CONSTRAINT "notificationKind_app_id_value_key" UNIQUE (app_id, value);
ALTER TABLE ONLY public."notificationKind"
    ADD CONSTRAINT "notificationKind_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."notificationLog"
    ADD CONSTRAINT "notificationLog_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."notificationTrigger"
    ADD CONSTRAINT "notificationTrigger_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."notificationVia"
    ADD CONSTRAINT "notificationVia_via_key" UNIQUE (via);
ALTER TABLE ONLY public."notificationViewed"
    ADD CONSTRAINT "notificationViewed_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."notificationViewed"
    ADD CONSTRAINT "notificationViewed_ref_notification_id_key" UNIQUE (ref, notification_id);
ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public."notificationVia"
    ADD CONSTRAINT notification_via_pkey PRIMARY KEY (via);
CREATE TRIGGER set_public_app_updated_at BEFORE UPDATE ON public.app FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_public_app_updated_at ON public.app IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_public_messageTemplate_updated_at" BEFORE UPDATE ON public."messageTemplate" FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_public_messageTemplate_updated_at" ON public."messageTemplate" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
ALTER TABLE ONLY public."messageTemplate"
    ADD CONSTRAINT "messageTemplate_app_id_fkey" FOREIGN KEY (app_id) REFERENCES public.app(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY public."messageTemplate"
    ADD CONSTRAINT "messageTemplate_kind_id_fkey" FOREIGN KEY (kind_id) REFERENCES public."notificationKind"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY public."notificationLog"
    ADD CONSTRAINT "notificationLog_notification_id_fkey" FOREIGN KEY (notification_id) REFERENCES public.notification(id) ON UPDATE SET NULL ON DELETE SET NULL;
ALTER TABLE ONLY public."notificationTrigger"
    ADD CONSTRAINT "notificationTrigger_app_id_fkey" FOREIGN KEY (app_id) REFERENCES public.app(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."notificationTrigger"
    ADD CONSTRAINT "notificationTrigger_kind_id_fkey" FOREIGN KEY (kind_id) REFERENCES public."notificationKind"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."notificationTrigger"
    ADD CONSTRAINT "notificationTrigger_message_template_id_fkey" FOREIGN KEY (message_template_id) REFERENCES public."messageTemplate"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY public."notificationViewed"
    ADD CONSTRAINT "notificationViewed_notification_id_fkey" FOREIGN KEY (notification_id) REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_kind_id_fkey FOREIGN KEY (kind_id) REFERENCES public."notificationKind"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_message_template_id_fkey FOREIGN KEY (message_template_id) REFERENCES public."messageTemplate"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY public.notification
    ADD CONSTRAINT via_fkey FOREIGN KEY (via) REFERENCES public."notificationVia"(via);
ALTER TABLE ONLY public."messageTemplate"
    ADD CONSTRAINT via_fkey FOREIGN KEY (via) REFERENCES public."notificationVia"(via);

INSERT INTO public."notificationVia" (via) VALUES ('app'), ('email');
