/*
  # Create Projects Table for Vinyl Social Asset Generator

  1. New Tables
    - `projects`
      - `id` (uuid, primary key) - Unique project identifier
      - `user_id` (text) - User identifier (browser fingerprint or future auth)
      - `name` (text) - Project name
      - `audio_url` (text, nullable) - URL to stored audio file
      - `label_url` (text, nullable) - URL to stored label image
      - `settings` (jsonb) - All project settings (rpm, direction, ratio, etc.)
      - `created_at` (timestamptz) - Project creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `projects` table
    - Add policy for users to read their own projects
    - Add policy for users to create projects
    - Add policy for users to update their own projects
    - Add policy for users to delete their own projects
  
  3. Indexes
    - Add index on user_id for faster queries
    - Add index on created_at for sorting

  4. Notes
    - Settings stored as JSONB for flexibility
    - Uses browser fingerprint for user_id initially (can be migrated to auth later)
    - Supports storing media URLs for project persistence
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Project',
  audio_url text,
  label_url text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies for project access
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR user_id = current_setting('app.user_id', true));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
