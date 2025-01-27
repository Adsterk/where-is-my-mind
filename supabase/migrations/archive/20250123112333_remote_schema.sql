drop policy "Users can create their own entries" on "public"."mood_entries";

drop policy "Users can manage their own problematic_behaviors" on "public"."problematic_behaviors";

drop policy "Users can manage their own activities" on "public"."activities";

drop policy "Users can manage their own activity_entries" on "public"."activity_entries";

drop policy "Users can manage their own behavior_entries" on "public"."behavior_entries";

drop policy "Users can manage their own medication_entries" on "public"."medication_entries";

drop policy "Users can manage their own medications" on "public"."medications";

drop policy "Users can manage their own skill_entries" on "public"."skill_entries";

drop policy "Users can manage their own skills" on "public"."skills";

drop policy "Users can manage their own social_connection_entries" on "public"."social_connection_entries";

drop policy "Users can manage their own social_connections" on "public"."social_connections";

drop policy "Users can manage their own spiritual_practice_entries" on "public"."spiritual_practice_entries";

drop policy "Users can manage their own spiritual_practices" on "public"."spiritual_practices";

alter table "public"."mood_entries" drop constraint "mood_entries_sleep_hours_check";

alter table "public"."mood_entries" drop constraint "mood_entries_sleep_quality_check";

alter table "public"."skill_entries" drop constraint "skill_entries_difficulty_check";

alter table "public"."social_connection_entries" drop constraint "social_connection_entries_impact_rating_check";

alter table "public"."spiritual_practice_entries" drop constraint "spiritual_practice_entries_fulfillment_rating_check";

alter table "public"."user_preferences" drop constraint "unique_user_preferences";

alter table "public"."activity_entries" drop constraint "activity_entries_user_id_fkey";

alter table "public"."behavior_entries" drop constraint "behavior_entries_behavior_id_fkey";

alter table "public"."behavior_entries" drop constraint "behavior_entries_user_id_fkey";

alter table "public"."medication_entries" drop constraint "medication_entries_user_id_fkey";

alter table "public"."mood_entries" drop constraint "mood_entries_mood_score_check";

alter table "public"."mood_entries" drop constraint "mood_entries_user_id_fkey";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."skill_entries" drop constraint "skill_entries_user_id_fkey";

alter table "public"."social_connection_entries" drop constraint "social_connection_entries_user_id_fkey";

alter table "public"."spiritual_practice_entries" drop constraint "spiritual_practice_entries_user_id_fkey";

alter table "public"."user_preferences" drop constraint "user_preferences_user_id_fkey";

drop function if exists "public"."get_rls_policies"();

drop function if exists "public"."get_table_info"(table_name text);

drop view if exists "public"."rls_policies";

drop function if exists "public"."test_rls_policies"();

drop index if exists "public"."idx_activity_entries_mood_entry_id";

drop index if exists "public"."idx_behavior_entries_mood_entry_id";

drop index if exists "public"."idx_form_section_preferences_user_id";

drop index if exists "public"."idx_medication_entries_mood_entry_id";

drop index if exists "public"."idx_mood_entries_user_id_created_at";

drop index if exists "public"."idx_skill_entries_mood_entry_id";

drop index if exists "public"."idx_social_connection_entries_mood_entry_id";

drop index if exists "public"."idx_spiritual_practice_entries_mood_entry_id";

drop index if exists "public"."unique_user_preferences";

create table "public"."behaviors" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "name" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."behaviors" enable row level security;

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

alter table "public"."activities" add column "is_default" boolean default false;

alter table "public"."activities" alter column "is_custom" set default false;

alter table "public"."activities" alter column "user_id" drop not null;

alter table "public"."activity_entries" alter column "activity_id" set not null;

alter table "public"."activity_entries" alter column "duration_minutes" drop not null;

alter table "public"."activity_entries" alter column "is_draft" set default true;

alter table "public"."activity_entries" alter column "user_id" drop not null;

alter table "public"."behavior_entries" drop column "is_draft";

alter table "public"."behavior_entries" drop column "triggers";

alter table "public"."behavior_entries" alter column "created_at" set default now();

alter table "public"."behavior_entries" alter column "created_at" drop not null;

alter table "public"."behavior_entries" alter column "id" set default uuid_generate_v4();

alter table "public"."behavior_entries" alter column "user_id" drop not null;

alter table "public"."form_section_preferences" alter column "user_id" drop not null;

alter table "public"."medication_entries" alter column "is_draft" set default true;

alter table "public"."medication_entries" alter column "medication_id" set not null;

alter table "public"."medication_entries" alter column "user_id" drop not null;

alter table "public"."medications" drop column "is_custom";

alter table "public"."mood_entries" drop column "updated_at";

alter table "public"."mood_entries" add column "language" text not null default 'en'::text;

alter table "public"."mood_entries" add column "timezone" text not null;

alter table "public"."mood_entries" alter column "created_at" set default now();

alter table "public"."mood_entries" alter column "id" set default uuid_generate_v4();

alter table "public"."mood_entries" alter column "sleep_hours" set data type numeric(4,1) using "sleep_hours"::numeric(4,1);

alter table "public"."mood_entries" alter column "sleep_quality" set data type text using "sleep_quality"::text;

alter table "public"."problematic_behaviors" alter column "is_custom" set default false;

alter table "public"."problematic_behaviors" alter column "user_id" drop not null;

alter table "public"."profiles" add column "theme" text not null default 'light'::text;

alter table "public"."skill_entries" drop column "difficulty";

alter table "public"."skill_entries" drop column "is_draft";

alter table "public"."skill_entries" alter column "mood_entry_id" set not null;

alter table "public"."skill_entries" alter column "skill_id" set not null;

alter table "public"."skill_entries" alter column "user_id" drop not null;

alter table "public"."skills" alter column "is_custom" set default false;

alter table "public"."skills" alter column "user_id" drop not null;

alter table "public"."social_connection_entries" drop column "impact_rating";

alter table "public"."social_connection_entries" drop column "is_draft";

alter table "public"."social_connection_entries" add column "impact_on_wellbeing" integer;

alter table "public"."social_connection_entries" alter column "connection_id" set not null;

alter table "public"."social_connection_entries" alter column "mood_entry_id" set not null;

alter table "public"."social_connection_entries" alter column "user_id" drop not null;

alter table "public"."social_connections" drop column "name";

alter table "public"."social_connections" add column "type" text not null;

alter table "public"."social_connections" alter column "is_custom" set default false;

alter table "public"."social_connections" alter column "user_id" drop not null;

alter table "public"."spiritual_practice_entries" drop column "fulfillment_rating";

alter table "public"."spiritual_practice_entries" drop column "is_draft";

alter table "public"."spiritual_practice_entries" add column "impact_rating" integer;

alter table "public"."spiritual_practice_entries" alter column "duration_minutes" drop not null;

alter table "public"."spiritual_practice_entries" alter column "mood_entry_id" set not null;

alter table "public"."spiritual_practice_entries" alter column "practice_id" set not null;

alter table "public"."spiritual_practice_entries" alter column "user_id" drop not null;

alter table "public"."spiritual_practices" drop column "name";

alter table "public"."spiritual_practices" alter column "is_custom" set default false;

alter table "public"."spiritual_practices" alter column "user_id" drop not null;

alter table "public"."user_preferences" drop column "theme";

alter table "public"."user_preferences" alter column "notification_enabled" drop not null;

alter table "public"."user_preferences" alter column "reminder_days" set default ARRAY[1, 2, 3, 4, 5, 6, 7];

alter table "public"."user_preferences" alter column "reminder_days" set data type integer[] using "reminder_days"::integer[];

alter table "public"."user_preferences" alter column "section_order" set default ARRAY['mood'::text, 'sleep'::text, 'medications'::text, 'activities'::text, 'social'::text, 'behaviors'::text, 'skills'::text, 'spiritual'::text];

alter table "public"."user_preferences" alter column "use_bipolar_scale" drop not null;

CREATE INDEX activity_entries_mood_entry_id_idx ON public.activity_entries USING btree (mood_entry_id);

CREATE INDEX behavior_entries_mood_entry_id_idx ON public.behavior_entries USING btree (mood_entry_id);

CREATE UNIQUE INDEX behaviors_pkey ON public.behaviors USING btree (id);

CREATE INDEX medication_entries_mood_entry_id_idx ON public.medication_entries USING btree (mood_entry_id);

CREATE INDEX mood_entries_user_id_created_at_idx ON public.mood_entries USING btree (user_id, created_at DESC);

CREATE UNIQUE INDEX problematic_behavior_entries_pkey ON public.problematic_behavior_entries USING btree (id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE INDEX skill_entries_mood_entry_id_idx ON public.skill_entries USING btree (mood_entry_id);

CREATE INDEX social_connection_entries_mood_entry_id_idx ON public.social_connection_entries USING btree (mood_entry_id);

CREATE INDEX spiritual_practice_entries_mood_entry_id_idx ON public.spiritual_practice_entries USING btree (mood_entry_id);

CREATE UNIQUE INDEX user_preferences_user_id_key ON public.user_preferences USING btree (user_id);

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (user_id);

alter table "public"."behaviors" add constraint "behaviors_pkey" PRIMARY KEY using index "behaviors_pkey";

alter table "public"."problematic_behavior_entries" add constraint "problematic_behavior_entries_pkey" PRIMARY KEY using index "problematic_behavior_entries_pkey";

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."activity_entries" add constraint "activity_entries_duration_minutes_check" CHECK ((duration_minutes > 0)) not valid;

alter table "public"."activity_entries" validate constraint "activity_entries_duration_minutes_check";

alter table "public"."behaviors" add constraint "behaviors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."behaviors" validate constraint "behaviors_user_id_fkey";

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

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."social_connection_entries" add constraint "social_connection_entries_impact_on_wellbeing_check" CHECK (((impact_on_wellbeing >= 1) AND (impact_on_wellbeing <= 5))) not valid;

alter table "public"."social_connection_entries" validate constraint "social_connection_entries_impact_on_wellbeing_check";

alter table "public"."spiritual_practice_entries" add constraint "spiritual_practice_entries_duration_minutes_check" CHECK ((duration_minutes > 0)) not valid;

alter table "public"."spiritual_practice_entries" validate constraint "spiritual_practice_entries_duration_minutes_check";

alter table "public"."spiritual_practice_entries" add constraint "spiritual_practice_entries_impact_rating_check" CHECK (((impact_rating >= 1) AND (impact_rating <= 5))) not valid;

alter table "public"."spiritual_practice_entries" validate constraint "spiritual_practice_entries_impact_rating_check";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_key" UNIQUE using index "user_preferences_user_id_key";

alter table "public"."user_preferences" add constraint "valid_reminder_time" CHECK (((reminder_time IS NULL) OR ((EXTRACT(hour FROM reminder_time) >= (0)::numeric) AND (EXTRACT(hour FROM reminder_time) < (24)::numeric)))) not valid;

alter table "public"."user_preferences" validate constraint "valid_reminder_time";

alter table "public"."user_settings" add constraint "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_user_id_fkey";

alter table "public"."activity_entries" add constraint "activity_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."activity_entries" validate constraint "activity_entries_user_id_fkey";

alter table "public"."behavior_entries" add constraint "behavior_entries_behavior_id_fkey" FOREIGN KEY (behavior_id) REFERENCES behaviors(id) ON DELETE CASCADE not valid;

alter table "public"."behavior_entries" validate constraint "behavior_entries_behavior_id_fkey";

alter table "public"."behavior_entries" add constraint "behavior_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."behavior_entries" validate constraint "behavior_entries_user_id_fkey";

alter table "public"."medication_entries" add constraint "medication_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."medication_entries" validate constraint "medication_entries_user_id_fkey";

alter table "public"."mood_entries" add constraint "mood_entries_mood_score_check" CHECK (((mood_score >= 1) AND (mood_score <= 10))) not valid;

alter table "public"."mood_entries" validate constraint "mood_entries_mood_score_check";

alter table "public"."mood_entries" add constraint "mood_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."mood_entries" validate constraint "mood_entries_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."skill_entries" add constraint "skill_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."skill_entries" validate constraint "skill_entries_user_id_fkey";

alter table "public"."social_connection_entries" add constraint "social_connection_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."social_connection_entries" validate constraint "social_connection_entries_user_id_fkey";

alter table "public"."spiritual_practice_entries" add constraint "spiritual_practice_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."spiritual_practice_entries" validate constraint "spiritual_practice_entries_user_id_fkey";

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_preferences (
    user_id,
    theme,
    use_bipolar_scale,
    notification_enabled,
    reminder_time,
    sign_in_count
  )
  VALUES (
    NEW.id,
    'system',
    false,
    false,
    '09:00'::TIME,
    0
  );
  RETURN NEW;
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

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_validate_reminder_days()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT public.validate_reminder_days(NEW.reminder_days) THEN
    RAISE EXCEPTION 'reminder_days must be between 1 and 7';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_reminder_days(days integer[])
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM unnest(days) AS day 
    WHERE day < 1 OR day > 7
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_draft_entries()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Delete draft entries older than 24 hours
  DELETE FROM medication_entries 
  WHERE is_draft = true 
  AND created_at < NOW() - INTERVAL '24 hours';

  DELETE FROM activity_entries 
  WHERE is_draft = true 
  AND created_at < NOW() - INTERVAL '24 hours';

  -- Similar statements for other entry tables...
END;
$function$
;

CREATE OR REPLACE FUNCTION public.track_mood_entry_edits()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.last_edited_at = NOW();
    NEW.edit_history = array_append(
      COALESCE(OLD.edit_history, ARRAY[]::jsonb[]),
      jsonb_build_object(
        'timestamp', NOW(),
        'previous_value', to_jsonb(OLD.*) - 'edit_history',
        'new_value', to_jsonb(NEW.*) - 'edit_history'
      )
    );
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."behaviors" to "anon";

grant insert on table "public"."behaviors" to "anon";

grant references on table "public"."behaviors" to "anon";

grant select on table "public"."behaviors" to "anon";

grant trigger on table "public"."behaviors" to "anon";

grant truncate on table "public"."behaviors" to "anon";

grant update on table "public"."behaviors" to "anon";

grant delete on table "public"."behaviors" to "authenticated";

grant insert on table "public"."behaviors" to "authenticated";

grant references on table "public"."behaviors" to "authenticated";

grant select on table "public"."behaviors" to "authenticated";

grant trigger on table "public"."behaviors" to "authenticated";

grant truncate on table "public"."behaviors" to "authenticated";

grant update on table "public"."behaviors" to "authenticated";

grant delete on table "public"."behaviors" to "service_role";

grant insert on table "public"."behaviors" to "service_role";

grant references on table "public"."behaviors" to "service_role";

grant select on table "public"."behaviors" to "service_role";

grant trigger on table "public"."behaviors" to "service_role";

grant truncate on table "public"."behaviors" to "service_role";

grant update on table "public"."behaviors" to "service_role";

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


create policy "Users can manage their own behaviors"
on "public"."behaviors"
as permissive
for all
to public
using ((auth.uid() = user_id));


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


create policy "Users can delete their own entries"
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


create policy "Users can insert their own entries"
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


create policy "Users can update their own theme"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


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


create policy "Users can insert their own preferences"
on "public"."user_preferences"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own preferences"
on "public"."user_preferences"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own preferences"
on "public"."user_preferences"
as permissive
for select
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


create policy "Users can manage their own activity_entries"
on "public"."activity_entries"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM mood_entries me
  WHERE ((me.id = activity_entries.mood_entry_id) AND (me.user_id = auth.uid()))))));


create policy "Users can manage their own behavior_entries"
on "public"."behavior_entries"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM mood_entries me
  WHERE ((me.id = behavior_entries.mood_entry_id) AND (me.user_id = auth.uid()))))));


create policy "Users can manage their own medication_entries"
on "public"."medication_entries"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM mood_entries me
  WHERE ((me.id = medication_entries.mood_entry_id) AND (me.user_id = auth.uid()))))));


create policy "Users can manage their own medications"
on "public"."medications"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own skill_entries"
on "public"."skill_entries"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM mood_entries me
  WHERE ((me.id = skill_entries.mood_entry_id) AND (me.user_id = auth.uid()))))));


create policy "Users can manage their own skills"
on "public"."skills"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own social_connection_entries"
on "public"."social_connection_entries"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM mood_entries me
  WHERE ((me.id = social_connection_entries.mood_entry_id) AND (me.user_id = auth.uid()))))));


create policy "Users can manage their own social_connections"
on "public"."social_connections"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own spiritual_practice_entries"
on "public"."spiritual_practice_entries"
as permissive
for all
to authenticated
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM mood_entries me
  WHERE ((me.id = spiritual_practice_entries.mood_entry_id) AND (me.user_id = auth.uid()))))));


create policy "Users can manage their own spiritual_practices"
on "public"."spiritual_practices"
as permissive
for all
to public
using ((auth.uid() = user_id));


CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.mood_entries FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER validate_reminder_days BEFORE INSERT OR UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION trigger_validate_reminder_days();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


