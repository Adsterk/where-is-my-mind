

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');

    INSERT INTO public.user_settings (user_id)
    VALUES (new.id);

    RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "is_custom" boolean DEFAULT false,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mood_entry_id" "uuid" NOT NULL,
    "activity_id" "uuid" NOT NULL,
    "duration_minutes" integer,
    "engagement_level" integer,
    "impact_rating" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "activity_entries_duration_minutes_check" CHECK (("duration_minutes" > 0)),
    CONSTRAINT "activity_entries_engagement_level_check" CHECK ((("engagement_level" >= 1) AND ("engagement_level" <= 5))),
    CONSTRAINT "activity_entries_impact_rating_check" CHECK ((("impact_rating" >= 1) AND ("impact_rating" <= 5)))
);


ALTER TABLE "public"."activity_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medication_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mood_entry_id" "uuid" NOT NULL,
    "medication_id" "uuid" NOT NULL,
    "time_taken" timestamp with time zone NOT NULL,
    "notes" "text",
    "side_effects" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."medication_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "dosage" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."medications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mood_entries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "mood_score" integer NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "timezone" "text" NOT NULL,
    "language" "text" DEFAULT 'en'::"text" NOT NULL,
    "sleep_hours" numeric(4,1),
    "sleep_quality" "text",
    "is_bipolar_scale" boolean DEFAULT false,
    CONSTRAINT "mood_entries_mood_score_check" CHECK ((("mood_score" >= 1) AND ("mood_score" <= 10))),
    CONSTRAINT "sleep_hours_range" CHECK ((("sleep_hours" >= (0)::numeric) AND ("sleep_hours" <= (24)::numeric))),
    CONSTRAINT "sleep_quality_values" CHECK ((("sleep_quality" = ANY (ARRAY['poor'::"text", 'fair'::"text", 'good'::"text", 'excellent'::"text"])) OR ("sleep_quality" IS NULL)))
);


ALTER TABLE "public"."mood_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."problematic_behavior_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mood_entry_id" "uuid" NOT NULL,
    "behavior_id" "uuid" NOT NULL,
    "intensity_level" integer,
    "frequency_level" integer,
    "triggers" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "problematic_behavior_entries_frequency_level_check" CHECK ((("frequency_level" >= 1) AND ("frequency_level" <= 5))),
    CONSTRAINT "problematic_behavior_entries_intensity_level_check" CHECK ((("intensity_level" >= 1) AND ("intensity_level" <= 5)))
);


ALTER TABLE "public"."problematic_behavior_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."problematic_behaviors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "is_custom" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."problematic_behaviors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "timezone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "language" "text" DEFAULT 'en'::"text" NOT NULL,
    "theme" "text" DEFAULT 'light'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skill_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mood_entry_id" "uuid" NOT NULL,
    "skill_id" "uuid" NOT NULL,
    "effectiveness" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "skill_entries_effectiveness_check" CHECK ((("effectiveness" >= 1) AND ("effectiveness" <= 5)))
);


ALTER TABLE "public"."skill_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "is_custom" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_connection_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mood_entry_id" "uuid" NOT NULL,
    "connection_id" "uuid" NOT NULL,
    "quality_rating" integer,
    "impact_on_wellbeing" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "social_connection_entries_impact_on_wellbeing_check" CHECK ((("impact_on_wellbeing" >= 1) AND ("impact_on_wellbeing" <= 5))),
    CONSTRAINT "social_connection_entries_quality_rating_check" CHECK ((("quality_rating" >= 1) AND ("quality_rating" <= 5)))
);


ALTER TABLE "public"."social_connection_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "is_custom" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."social_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spiritual_practice_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mood_entry_id" "uuid" NOT NULL,
    "practice_id" "uuid" NOT NULL,
    "duration_minutes" integer,
    "impact_rating" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "spiritual_practice_entries_duration_minutes_check" CHECK (("duration_minutes" > 0)),
    CONSTRAINT "spiritual_practice_entries_impact_rating_check" CHECK ((("impact_rating" >= 1) AND ("impact_rating" <= 5)))
);


ALTER TABLE "public"."spiritual_practice_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spiritual_practices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "is_custom" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."spiritual_practices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "user_id" "uuid" NOT NULL,
    "notification_email" boolean DEFAULT true NOT NULL,
    "notification_push" boolean DEFAULT true NOT NULL,
    "reminder_time" time without time zone,
    "reminder_days" integer[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6, 7],
    "data_retention_days" integer DEFAULT 365,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_entries"
    ADD CONSTRAINT "activity_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medication_entries"
    ADD CONSTRAINT "medication_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medications"
    ADD CONSTRAINT "medications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mood_entries"
    ADD CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."problematic_behavior_entries"
    ADD CONSTRAINT "problematic_behavior_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."problematic_behaviors"
    ADD CONSTRAINT "problematic_behaviors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."skill_entries"
    ADD CONSTRAINT "skill_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_connection_entries"
    ADD CONSTRAINT "social_connection_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_connections"
    ADD CONSTRAINT "social_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spiritual_practice_entries"
    ADD CONSTRAINT "spiritual_practice_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."spiritual_practices"
    ADD CONSTRAINT "spiritual_practices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id");



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_entries"
    ADD CONSTRAINT "activity_entries_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_entries"
    ADD CONSTRAINT "activity_entries_mood_entry_id_fkey" FOREIGN KEY ("mood_entry_id") REFERENCES "public"."mood_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medication_entries"
    ADD CONSTRAINT "medication_entries_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medication_entries"
    ADD CONSTRAINT "medication_entries_mood_entry_id_fkey" FOREIGN KEY ("mood_entry_id") REFERENCES "public"."mood_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medications"
    ADD CONSTRAINT "medications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mood_entries"
    ADD CONSTRAINT "mood_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."problematic_behavior_entries"
    ADD CONSTRAINT "problematic_behavior_entries_behavior_id_fkey" FOREIGN KEY ("behavior_id") REFERENCES "public"."problematic_behaviors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."problematic_behavior_entries"
    ADD CONSTRAINT "problematic_behavior_entries_mood_entry_id_fkey" FOREIGN KEY ("mood_entry_id") REFERENCES "public"."mood_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."problematic_behaviors"
    ADD CONSTRAINT "problematic_behaviors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."skill_entries"
    ADD CONSTRAINT "skill_entries_mood_entry_id_fkey" FOREIGN KEY ("mood_entry_id") REFERENCES "public"."mood_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."skill_entries"
    ADD CONSTRAINT "skill_entries_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_connection_entries"
    ADD CONSTRAINT "social_connection_entries_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."social_connections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_connection_entries"
    ADD CONSTRAINT "social_connection_entries_mood_entry_id_fkey" FOREIGN KEY ("mood_entry_id") REFERENCES "public"."mood_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_connections"
    ADD CONSTRAINT "social_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spiritual_practice_entries"
    ADD CONSTRAINT "spiritual_practice_entries_mood_entry_id_fkey" FOREIGN KEY ("mood_entry_id") REFERENCES "public"."mood_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spiritual_practice_entries"
    ADD CONSTRAINT "spiritual_practice_entries_practice_id_fkey" FOREIGN KEY ("practice_id") REFERENCES "public"."spiritual_practices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spiritual_practices"
    ADD CONSTRAINT "spiritual_practices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete own mood entries" ON "public"."mood_entries" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own mood entries" ON "public"."mood_entries" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own activities" ON "public"."activities" USING (
CASE
    WHEN "is_default" THEN true
    WHEN ("user_id" IS NOT NULL) THEN ("auth"."uid"() = "user_id")
    ELSE false
END);



CREATE POLICY "Users can manage their own activity entries" ON "public"."activity_entries" USING (("auth"."uid"() = ( SELECT "mood_entries"."user_id"
   FROM "public"."mood_entries"
  WHERE ("mood_entries"."id" = "activity_entries"."mood_entry_id"))));



CREATE POLICY "Users can manage their own behavior entries" ON "public"."problematic_behavior_entries" USING (("auth"."uid"() = ( SELECT "mood_entries"."user_id"
   FROM "public"."mood_entries"
  WHERE ("mood_entries"."id" = "problematic_behavior_entries"."mood_entry_id"))));



CREATE POLICY "Users can manage their own behaviors" ON "public"."problematic_behaviors" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own connection entries" ON "public"."social_connection_entries" USING (("auth"."uid"() = ( SELECT "mood_entries"."user_id"
   FROM "public"."mood_entries"
  WHERE ("mood_entries"."id" = "social_connection_entries"."mood_entry_id"))));



CREATE POLICY "Users can manage their own connections" ON "public"."social_connections" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own medication entries" ON "public"."medication_entries" USING (("auth"."uid"() = ( SELECT "mood_entries"."user_id"
   FROM "public"."mood_entries"
  WHERE ("mood_entries"."id" = "medication_entries"."mood_entry_id"))));



CREATE POLICY "Users can manage their own medications" ON "public"."medications" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own practice entries" ON "public"."spiritual_practice_entries" USING (("auth"."uid"() = ( SELECT "mood_entries"."user_id"
   FROM "public"."mood_entries"
  WHERE ("mood_entries"."id" = "spiritual_practice_entries"."mood_entry_id"))));



CREATE POLICY "Users can manage their own practices" ON "public"."spiritual_practices" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own skill entries" ON "public"."skill_entries" USING (("auth"."uid"() = ( SELECT "mood_entries"."user_id"
   FROM "public"."mood_entries"
  WHERE ("mood_entries"."id" = "skill_entries"."mood_entry_id"))));



CREATE POLICY "Users can manage their own skills" ON "public"."skills" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own mood entries" ON "public"."mood_entries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own settings" ON "public"."user_settings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own theme" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own mood entries" ON "public"."mood_entries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own settings" ON "public"."user_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medication_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mood_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."problematic_behavior_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."problematic_behaviors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skill_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_connection_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spiritual_practice_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spiritual_practices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."activity_entries" TO "anon";
GRANT ALL ON TABLE "public"."activity_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_entries" TO "service_role";



GRANT ALL ON TABLE "public"."medication_entries" TO "anon";
GRANT ALL ON TABLE "public"."medication_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."medication_entries" TO "service_role";



GRANT ALL ON TABLE "public"."medications" TO "anon";
GRANT ALL ON TABLE "public"."medications" TO "authenticated";
GRANT ALL ON TABLE "public"."medications" TO "service_role";



GRANT ALL ON TABLE "public"."mood_entries" TO "anon";
GRANT ALL ON TABLE "public"."mood_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."mood_entries" TO "service_role";



GRANT ALL ON TABLE "public"."problematic_behavior_entries" TO "anon";
GRANT ALL ON TABLE "public"."problematic_behavior_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."problematic_behavior_entries" TO "service_role";



GRANT ALL ON TABLE "public"."problematic_behaviors" TO "anon";
GRANT ALL ON TABLE "public"."problematic_behaviors" TO "authenticated";
GRANT ALL ON TABLE "public"."problematic_behaviors" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."skill_entries" TO "anon";
GRANT ALL ON TABLE "public"."skill_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."skill_entries" TO "service_role";



GRANT ALL ON TABLE "public"."skills" TO "anon";
GRANT ALL ON TABLE "public"."skills" TO "authenticated";
GRANT ALL ON TABLE "public"."skills" TO "service_role";



GRANT ALL ON TABLE "public"."social_connection_entries" TO "anon";
GRANT ALL ON TABLE "public"."social_connection_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."social_connection_entries" TO "service_role";



GRANT ALL ON TABLE "public"."social_connections" TO "anon";
GRANT ALL ON TABLE "public"."social_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."social_connections" TO "service_role";



GRANT ALL ON TABLE "public"."spiritual_practice_entries" TO "anon";
GRANT ALL ON TABLE "public"."spiritual_practice_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."spiritual_practice_entries" TO "service_role";



GRANT ALL ON TABLE "public"."spiritual_practices" TO "anon";
GRANT ALL ON TABLE "public"."spiritual_practices" TO "authenticated";
GRANT ALL ON TABLE "public"."spiritual_practices" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
