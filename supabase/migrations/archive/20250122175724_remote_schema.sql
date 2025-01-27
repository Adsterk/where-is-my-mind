drop policy "Users can manage their own activities" on "public"."activities";

alter table "public"."skill_entries" drop constraint "skill_entries_difficulty_check";

alter table "public"."social_connection_entries" drop constraint "social_connection_entries_impact_rating_check";

alter table "public"."spiritual_practice_entries" drop constraint "spiritual_practice_entries_fulfillment_rating_check";

alter table "public"."mood_entries" drop constraint "mood_entries_mood_score_check";

alter table "public"."mood_entries" drop constraint "mood_entries_user_id_fkey";

alter table "public"."user_preferences" drop constraint "user_preferences_user_id_fkey";

drop function if exists "public"."cleanup_draft_entries"(p_user_id uuid, p_hours_old integer);

create table "public"."problematic_behavior_entries" (
    "id" uuid not null default gen_random_uuid(),
    "mood_entry_id" uuid not null,
    "behavior_id" uuid not null,
    "intensity_level" integer,
    "frequency_level" integer,
    "triggers" text,
    "notes" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."problematic_behavior_entries" enable row level security;

create table "public"."problematic_behaviors" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "is_custom" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."problematic_behaviors" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "avatar_url" text,
    "theme" text not null default 'light'::text,
    "language" text not null default 'en'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "full_name" text,
    "timezone" text not null default 'UTC'::text
);


alter table "public"."profiles" enable row level security;

create table "public"."user_settings" (
    "user_id" uuid not null,
    "notification_email" boolean not null default true,
    "notification_push" boolean not null default true,
    "reminder_time" time without time zone,
    "reminder_days" integer[] default ARRAY[1, 2, 3, 4, 5, 6, 7],
    "data_retention_days" integer default 365,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."user_settings" enable row level security;

alter table "public"."activities" add column "is_custom" boolean default false;

alter table "public"."activities" add column "is_default" boolean default false;

alter table "public"."activities" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."activities" alter column "created_at" set not null;

alter table "public"."activities" alter column "id" set default gen_random_uuid();

alter table "public"."activity_entries" alter column "activity_id" set not null;

alter table "public"."activity_entries" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."activity_entries" alter column "created_at" set not null;

alter table "public"."activity_entries" alter column "duration_minutes" drop not null;

alter table "public"."activity_entries" alter column "id" set default gen_random_uuid();

alter table "public"."activity_entries" alter column "user_id" drop not null;

alter table "public"."medication_entries" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."medication_entries" alter column "created_at" set not null;

alter table "public"."medication_entries" alter column "id" set default gen_random_uuid();

alter table "public"."medication_entries" alter column "medication_id" set not null;

alter table "public"."medication_entries" alter column "user_id" drop not null;

alter table "public"."medications" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."medications" alter column "created_at" set not null;

alter table "public"."medications" alter column "id" set default gen_random_uuid();

alter table "public"."medications" alter column "user_id" set not null;

alter table "public"."mood_entries" drop column "updated_at";

alter table "public"."mood_entries" add column "language" text not null default 'en'::text;

alter table "public"."mood_entries" add column "sleep_hours" numeric(4,1);

alter table "public"."mood_entries" add column "sleep_quality" text;

alter table "public"."mood_entries" add column "timezone" text not null;

alter table "public"."mood_entries" alter column "created_at" set default now();

alter table "public"."mood_entries" alter column "id" set default uuid_generate_v4();

alter table "public"."skill_entries" drop column "difficulty";

alter table "public"."skill_entries" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."skill_entries" alter column "created_at" set not null;

alter table "public"."skill_entries" alter column "id" set default gen_random_uuid();

alter table "public"."skill_entries" alter column "mood_entry_id" set not null;

alter table "public"."skill_entries" alter column "skill_id" set not null;

alter table "public"."skills" add column "is_custom" boolean default false;

alter table "public"."skills" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."skills" alter column "created_at" set not null;

alter table "public"."skills" alter column "id" set default gen_random_uuid();

alter table "public"."social_connection_entries" drop column "impact_rating";

alter table "public"."social_connection_entries" add column "impact_on_wellbeing" integer;

alter table "public"."social_connection_entries" alter column "connection_id" set not null;

alter table "public"."social_connection_entries" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."social_connection_entries" alter column "created_at" set not null;

alter table "public"."social_connection_entries" alter column "id" set default gen_random_uuid();

alter table "public"."social_connection_entries" alter column "mood_entry_id" set not null;

alter table "public"."social_connections" drop column "name";

alter table "public"."social_connections" add column "is_custom" boolean default false;

alter table "public"."social_connections" add column "type" text not null;

alter table "public"."social_connections" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."social_connections" alter column "created_at" set not null;

alter table "public"."social_connections" alter column "id" set default gen_random_uuid();

alter table "public"."spiritual_practice_entries" drop column "fulfillment_rating";

alter table "public"."spiritual_practice_entries" add column "impact_rating" integer;

alter table "public"."spiritual_practice_entries" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."spiritual_practice_entries" alter column "created_at" set not null;

alter table "public"."spiritual_practice_entries" alter column "duration_minutes" drop not null;

alter table "public"."spiritual_practice_entries" alter column "id" set default gen_random_uuid();

alter table "public"."spiritual_practice_entries" alter column "mood_entry_id" set not null;

alter table "public"."spiritual_practice_entries" alter column "practice_id" set not null;

alter table "public"."spiritual_practices" drop column "name";

alter table "public"."spiritual_practices" add column "is_custom" boolean default false;

alter table "public"."spiritual_practices" add column "type" text not null;

alter table "public"."spiritual_practices" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."spiritual_practices" alter column "created_at" set not null;

alter table "public"."spiritual_practices" alter column "id" set default gen_random_uuid();

alter table "public"."user_preferences" drop column "theme";

alter table "public"."user_preferences" alter column "form_sections" set default '[{"id": "mood", "title": "Mood and Notes", "component": "MoodAndNotes"}, {"id": "sleep", "title": "Sleep", "component": "Sleep"}, {"id": "medications", "title": "Medications", "component": "Medications"}, {"id": "activities", "title": "Activities", "component": "Activities"}, {"id": "social", "title": "Social Connections", "component": "SocialConnections"}, {"id": "behaviors", "title": "Problematic Behaviors", "component": "Behaviors"}, {"id": "skills", "title": "Skills", "component": "Skills"}, {"id": "spiritual", "title": "Spiritual Practices", "component": "Spiritual"}]'::jsonb;

CREATE UNIQUE INDEX problematic_behavior_entries_pkey ON public.problematic_behavior_entries USING btree (id);

CREATE UNIQUE INDEX problematic_behaviors_pkey ON public.problematic_behaviors USING btree (id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (user_id);

alter table "public"."problematic_behavior_entries" add constraint "problematic_behavior_entries_pkey" PRIMARY KEY using index "problematic_behavior_entries_pkey";

alter table "public"."problematic_behaviors" add constraint "problematic_behaviors_pkey" PRIMARY KEY using index "problematic_behaviors_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."activity_entries" add constraint "activity_entries_duration_minutes_check" CHECK ((duration_minutes > 0)) not valid;

alter table "public"."activity_entries" validate constraint "activity_entries_duration_minutes_check";

alter table "public"."mood_entries" add constraint "sleep_hours_range" CHECK (((sleep_hours >= (0)::numeric) AND (sleep_hours <= (24)::numeric))) not valid;

alter table "public"."mood_entries" validate constraint "sleep_hours_range";

alter table "public"."mood_entries" add constraint "sleep_quality_values" CHECK (((sleep_quality = ANY (ARRAY['poor'::text, 'fair'::text, 'good'::text, 'excellent'::text])) OR (sleep_quality IS NULL))) not valid;

alter table "public"."mood_entries" validate constraint "sleep_quality_values";

alter table "public"."problematic_behavior_entries" add constraint "problematic_behavior_entries_behavior_id_fkey" FOREIGN KEY (behavior_id) REFERENCES problematic_behaviors(id) ON DELETE CASCADE not valid;

alter table "public"."problematic_behavior_entries" validate constraint "problematic_behavior_entries_behavior_id_fkey";

alter table "public"."problematic_behavior_entries" add constraint "problematic_behavior_entries_frequency_level_check" CHECK (((frequency_level >= 1) AND (frequency_level <= 5))) not valid;

alter table "public"."problematic_behavior_entries" validate constraint "problematic_behavior_entries_frequency_level_check";

alter table "public"."problematic_behavior_entries" add constraint "problematic_behavior_entries_intensity_level_check" CHECK (((intensity_level >= 1) AND (intensity_level <= 5))) not valid;

alter table "public"."problematic_behavior_entries" validate constraint "problematic_behavior_entries_intensity_level_check";

alter table "public"."problematic_behavior_entries" add constraint "problematic_behavior_entries_mood_entry_id_fkey" FOREIGN KEY (mood_entry_id) REFERENCES mood_entries(id) ON DELETE CASCADE not valid;

alter table "public"."problematic_behavior_entries" validate constraint "problematic_behavior_entries_mood_entry_id_fkey";

alter table "public"."problematic_behaviors" add constraint "problematic_behaviors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."problematic_behaviors" validate constraint "problematic_behaviors_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."social_connection_entries" add constraint "social_connection_entries_impact_on_wellbeing_check" CHECK (((impact_on_wellbeing >= 1) AND (impact_on_wellbeing <= 5))) not valid;

alter table "public"."social_connection_entries" validate constraint "social_connection_entries_impact_on_wellbeing_check";

alter table "public"."spiritual_practice_entries" add constraint "spiritual_practice_entries_duration_minutes_check" CHECK ((duration_minutes > 0)) not valid;

alter table "public"."spiritual_practice_entries" validate constraint "spiritual_practice_entries_duration_minutes_check";

alter table "public"."spiritual_practice_entries" add constraint "spiritual_practice_entries_impact_rating_check" CHECK (((impact_rating >= 1) AND (impact_rating <= 5))) not valid;

alter table "public"."spiritual_practice_entries" validate constraint "spiritual_practice_entries_impact_rating_check";

alter table "public"."user_settings" add constraint "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_user_id_fkey";

alter table "public"."mood_entries" add constraint "mood_entries_mood_score_check" CHECK (((mood_score >= 1) AND (mood_score <= 10))) not valid;

alter table "public"."mood_entries" validate constraint "mood_entries_mood_score_check";

alter table "public"."mood_entries" add constraint "mood_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."mood_entries" validate constraint "mood_entries_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cleanup_draft_entries(user_id uuid, hours_old integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete drafts from each table within a transaction
  DELETE FROM medication_entries 
  WHERE user_id = $1 
    AND is_draft = true 
    AND created_at < NOW() - ($2 || ' hours')::INTERVAL;

  DELETE FROM activity_entries 
  WHERE user_id = $1 
    AND is_draft = true 
    AND created_at < NOW() - ($2 || ' hours')::INTERVAL;

  DELETE FROM behavior_entries 
  WHERE user_id = $1 
    AND is_draft = true 
    AND created_at < NOW() - ($2 || ' hours')::INTERVAL;

  DELETE FROM skill_entries 
  WHERE user_id = $1 
    AND is_draft = true 
    AND created_at < NOW() - ($2 || ' hours')::INTERVAL;

  DELETE FROM social_connection_entries 
  WHERE user_id = $1 
    AND is_draft = true 
    AND created_at < NOW() - ($2 || ' hours')::INTERVAL;

  DELETE FROM spiritual_practice_entries 
  WHERE user_id = $1 
    AND is_draft = true 
    AND created_at < NOW() - ($2 || ' hours')::INTERVAL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."problematic_behavior_entries" to "anon";

grant insert on table "public"."problematic_behavior_entries" to "anon";

grant references on table "public"."problematic_behavior_entries" to "anon";

grant select on table "public"."problematic_behavior_entries" to "anon";

grant trigger on table "public"."problematic_behavior_entries" to "anon";

grant truncate on table "public"."problematic_behavior_entries" to "anon";

grant update on table "public"."problematic_behavior_entries" to "anon";

grant delete on table "public"."problematic_behavior_entries" to "authenticated";

grant insert on table "public"."problematic_behavior_entries" to "authenticated";

grant references on table "public"."problematic_behavior_entries" to "authenticated";

grant select on table "public"."problematic_behavior_entries" to "authenticated";

grant trigger on table "public"."problematic_behavior_entries" to "authenticated";

grant truncate on table "public"."problematic_behavior_entries" to "authenticated";

grant update on table "public"."problematic_behavior_entries" to "authenticated";

grant delete on table "public"."problematic_behavior_entries" to "service_role";

grant insert on table "public"."problematic_behavior_entries" to "service_role";

grant references on table "public"."problematic_behavior_entries" to "service_role";

grant select on table "public"."problematic_behavior_entries" to "service_role";

grant trigger on table "public"."problematic_behavior_entries" to "service_role";

grant truncate on table "public"."problematic_behavior_entries" to "service_role";

grant update on table "public"."problematic_behavior_entries" to "service_role";

grant delete on table "public"."problematic_behaviors" to "anon";

grant insert on table "public"."problematic_behaviors" to "anon";

grant references on table "public"."problematic_behaviors" to "anon";

grant select on table "public"."problematic_behaviors" to "anon";

grant trigger on table "public"."problematic_behaviors" to "anon";

grant truncate on table "public"."problematic_behaviors" to "anon";

grant update on table "public"."problematic_behaviors" to "anon";

grant delete on table "public"."problematic_behaviors" to "authenticated";

grant insert on table "public"."problematic_behaviors" to "authenticated";

grant references on table "public"."problematic_behaviors" to "authenticated";

grant select on table "public"."problematic_behaviors" to "authenticated";

grant trigger on table "public"."problematic_behaviors" to "authenticated";

grant truncate on table "public"."problematic_behaviors" to "authenticated";

grant update on table "public"."problematic_behaviors" to "authenticated";

grant delete on table "public"."problematic_behaviors" to "service_role";

grant insert on table "public"."problematic_behaviors" to "service_role";

grant references on table "public"."problematic_behaviors" to "service_role";

grant select on table "public"."problematic_behaviors" to "service_role";

grant trigger on table "public"."problematic_behaviors" to "service_role";

grant truncate on table "public"."problematic_behaviors" to "service_role";

grant update on table "public"."problematic_behaviors" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."user_settings" to "anon";

grant insert on table "public"."user_settings" to "anon";

grant references on table "public"."user_settings" to "anon";

grant select on table "public"."user_settings" to "anon";

grant trigger on table "public"."user_settings" to "anon";

grant truncate on table "public"."user_settings" to "anon";

grant update on table "public"."user_settings" to "anon";

grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant references on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant trigger on table "public"."user_settings" to "authenticated";

grant truncate on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";

grant delete on table "public"."user_settings" to "service_role";

grant insert on table "public"."user_settings" to "service_role";

grant references on table "public"."user_settings" to "service_role";

grant select on table "public"."user_settings" to "service_role";

grant trigger on table "public"."user_settings" to "service_role";

grant truncate on table "public"."user_settings" to "service_role";

grant update on table "public"."user_settings" to "service_role";

create policy "Users can manage their own activity entries"
on "public"."activity_entries"
as permissive
for all
to public
using ((auth.uid() = ( SELECT mood_entries.user_id
   FROM mood_entries
  WHERE (mood_entries.id = activity_entries.mood_entry_id))));


create policy "Users can manage their own medication entries"
on "public"."medication_entries"
as permissive
for all
to public
using ((auth.uid() = ( SELECT mood_entries.user_id
   FROM mood_entries
  WHERE (mood_entries.id = medication_entries.mood_entry_id))));


create policy "Users can delete own mood entries"
on "public"."mood_entries"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own mood entries"
on "public"."mood_entries"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own mood entries"
on "public"."mood_entries"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own mood entries"
on "public"."mood_entries"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own behavior entries"
on "public"."problematic_behavior_entries"
as permissive
for all
to public
using ((auth.uid() = ( SELECT mood_entries.user_id
   FROM mood_entries
  WHERE (mood_entries.id = problematic_behavior_entries.mood_entry_id))));


create policy "Users can manage their own behaviors"
on "public"."problematic_behaviors"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can update their own theme"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Users can manage their own skill entries"
on "public"."skill_entries"
as permissive
for all
to public
using ((auth.uid() = ( SELECT mood_entries.user_id
   FROM mood_entries
  WHERE (mood_entries.id = skill_entries.mood_entry_id))));


create policy "Users can manage their own connection entries"
on "public"."social_connection_entries"
as permissive
for all
to public
using ((auth.uid() = ( SELECT mood_entries.user_id
   FROM mood_entries
  WHERE (mood_entries.id = social_connection_entries.mood_entry_id))));


create policy "Users can manage their own connections"
on "public"."social_connections"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own practice entries"
on "public"."spiritual_practice_entries"
as permissive
for all
to public
using ((auth.uid() = ( SELECT mood_entries.user_id
   FROM mood_entries
  WHERE (mood_entries.id = spiritual_practice_entries.mood_entry_id))));


create policy "Users can manage their own practices"
on "public"."spiritual_practices"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can update own settings"
on "public"."user_settings"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own settings"
on "public"."user_settings"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own activities"
on "public"."activities"
as permissive
for all
to public
using (
CASE
    WHEN is_default THEN true
    WHEN (user_id IS NOT NULL) THEN (auth.uid() = user_id)
    ELSE false
END);


CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


