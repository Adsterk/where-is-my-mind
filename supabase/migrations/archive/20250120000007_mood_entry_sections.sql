-- Create tables for each section's items
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS behaviors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spiritual_practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tables for entries
CREATE TABLE IF NOT EXISTS medication_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  time_taken TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  side_effects TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  engagement_level INTEGER CHECK (engagement_level BETWEEN 1 AND 5),
  impact_rating INTEGER CHECK (impact_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS behavior_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  behavior_id UUID REFERENCES behaviors(id) ON DELETE CASCADE,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  effectiveness INTEGER CHECK (effectiveness BETWEEN 1 AND 5),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_connection_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES social_connections(id) ON DELETE CASCADE,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  impact_rating INTEGER CHECK (impact_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spiritual_practice_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES spiritual_practices(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  fulfillment_rating INTEGER CHECK (fulfillment_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE IF EXISTS medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS spiritual_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS medication_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS behavior_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS skill_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_connection_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS spiritual_practice_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for main tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'medications' 
        AND policyname = 'Users can manage their own medications'
    ) THEN
        CREATE POLICY "Users can manage their own medications" 
        ON medications FOR ALL 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Users can manage their own activities'
    ) THEN
        CREATE POLICY "Users can manage their own activities" 
        ON activities FOR ALL 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'behaviors' 
        AND policyname = 'Users can manage their own behaviors'
    ) THEN
        CREATE POLICY "Users can manage their own behaviors" 
        ON behaviors FOR ALL 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'skills' 
        AND policyname = 'Users can manage their own skills'
    ) THEN
        CREATE POLICY "Users can manage their own skills" 
        ON skills FOR ALL 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_connections' 
        AND policyname = 'Users can manage their own social_connections'
    ) THEN
        CREATE POLICY "Users can manage their own social_connections" 
        ON social_connections FOR ALL 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spiritual_practices' 
        AND policyname = 'Users can manage their own spiritual_practices'
    ) THEN
        CREATE POLICY "Users can manage their own spiritual_practices" 
        ON spiritual_practices FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create policies for entry tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'medication_entries' 
        AND policyname = 'Users can manage their own medication_entries'
    ) THEN
        CREATE POLICY "Users can manage their own medication_entries" 
        ON medication_entries FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM mood_entries 
                WHERE id = medication_entries.mood_entry_id 
                AND user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_entries' 
        AND policyname = 'Users can manage their own activity_entries'
    ) THEN
        CREATE POLICY "Users can manage their own activity_entries" 
        ON activity_entries FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM mood_entries 
                WHERE id = activity_entries.mood_entry_id 
                AND user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'behavior_entries' 
        AND policyname = 'Users can manage their own behavior_entries'
    ) THEN
        CREATE POLICY "Users can manage their own behavior_entries" 
        ON behavior_entries FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM mood_entries 
                WHERE id = behavior_entries.mood_entry_id 
                AND user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'skill_entries' 
        AND policyname = 'Users can manage their own skill_entries'
    ) THEN
        CREATE POLICY "Users can manage their own skill_entries" 
        ON skill_entries FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM mood_entries 
                WHERE id = skill_entries.mood_entry_id 
                AND user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_connection_entries' 
        AND policyname = 'Users can manage their own social_connection_entries'
    ) THEN
        CREATE POLICY "Users can manage their own social_connection_entries" 
        ON social_connection_entries FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM mood_entries 
                WHERE id = social_connection_entries.mood_entry_id 
                AND user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spiritual_practice_entries' 
        AND policyname = 'Users can manage their own spiritual_practice_entries'
    ) THEN
        CREATE POLICY "Users can manage their own spiritual_practice_entries" 
        ON spiritual_practice_entries FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM mood_entries 
                WHERE id = spiritual_practice_entries.mood_entry_id 
                AND user_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS medication_entries_mood_entry_id_idx 
  ON medication_entries(mood_entry_id);
CREATE INDEX IF NOT EXISTS activity_entries_mood_entry_id_idx 
  ON activity_entries(mood_entry_id);
CREATE INDEX IF NOT EXISTS behavior_entries_mood_entry_id_idx 
  ON behavior_entries(mood_entry_id);
CREATE INDEX IF NOT EXISTS skill_entries_mood_entry_id_idx 
  ON skill_entries(mood_entry_id);
CREATE INDEX IF NOT EXISTS social_connection_entries_mood_entry_id_idx 
  ON social_connection_entries(mood_entry_id);
CREATE INDEX IF NOT EXISTS spiritual_practice_entries_mood_entry_id_idx 
  ON spiritual_practice_entries(mood_entry_id); 