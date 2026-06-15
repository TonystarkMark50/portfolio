-- Drop duplicate contact_messages table
DROP TABLE IF EXISTS contact_messages CASCADE;

-- Consolidate all RLS and rate limiting changes in one block
DO $$
DECLARE
  tbl TEXT;
  cms_tables TEXT[] := ARRAY['profile', 'about', 'skills', 'internships', 'education', 'certifications', 'journey', 'contact_info', 'site_settings'];
  policy_tables TEXT[] := ARRAY['admin_users', 'admin_sessions', 'admin_audit_log', 'projects', 'admin_projects', 'blog_posts', 'testimonials'];
  policy_name TEXT;
BEGIN

  -- Loop through tables that need owner-only policies
  FOREACH tbl IN ARRAY policy_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      IF tbl = 'admin_users' THEN
        DROP POLICY IF EXISTS "admin_users_select" ON admin_users;
        DROP POLICY IF EXISTS "admin_users_insert" ON admin_users;
        DROP POLICY IF EXISTS "admin_users_update" ON admin_users;
        CREATE POLICY "admin_users_select" ON admin_users FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
        CREATE POLICY "admin_users_insert" ON admin_users FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
        CREATE POLICY "admin_users_update" ON admin_users FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
      ELSIF tbl = 'admin_sessions' THEN
        DROP POLICY IF EXISTS "admin_sessions_select" ON admin_sessions;
        DROP POLICY IF EXISTS "admin_sessions_insert" ON admin_sessions;
        DROP POLICY IF EXISTS "admin_sessions_delete" ON admin_sessions;
        CREATE POLICY "admin_sessions_select" ON admin_sessions FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
        CREATE POLICY "admin_sessions_insert" ON admin_sessions FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
        CREATE POLICY "admin_sessions_delete" ON admin_sessions FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
      ELSIF tbl = 'admin_audit_log' THEN
        DROP POLICY IF EXISTS "audit_log_select" ON admin_audit_log;
        DROP POLICY IF EXISTS "audit_log_insert" ON admin_audit_log;
        CREATE POLICY "audit_log_select" ON admin_audit_log FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
        CREATE POLICY "audit_log_insert" ON admin_audit_log FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
      ELSIF tbl = 'testimonials' THEN
        DROP POLICY IF EXISTS "manage_testimonials" ON testimonials;
        CREATE POLICY "manage_testimonials" ON testimonials FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com') WITH CHECK (auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
      ELSE
        policy_name := tbl || '_all';
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, tbl);
        EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO authenticated USING (auth.jwt() ->> ''email'' = ''shakthijagadeesh907@gmail.com'') WITH CHECK (auth.jwt() ->> ''email'' = ''shakthijagadeesh907@gmail.com'')', policy_name, tbl);
      END IF;
    END IF;
  END LOOP;

  -- CMS tables (profile, about, skills, etc.)
  FOREACH tbl IN ARRAY cms_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_all', tbl);
      EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO authenticated USING (auth.jwt() ->> ''email'' = ''shakthijagadeesh907@gmail.com'') WITH CHECK (auth.jwt() ->> ''email'' = ''shakthijagadeesh907@gmail.com'')', tbl || '_all', tbl);
    END IF;
  END LOOP;

  -- Storage admin policy
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    DROP POLICY IF EXISTS "logos_admin_all" ON storage.objects;
    CREATE POLICY "logos_admin_all" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'certification-logos' AND auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com') WITH CHECK (bucket_id = 'certification-logos' AND auth.jwt() ->> 'email' = 'shakthijagadeesh907@gmail.com');
  END IF;

  -- Rate limiting for contact_submissions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_submissions') THEN
    ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS sender_ip TEXT;

    CREATE OR REPLACE FUNCTION check_contact_rate_limit()
    RETURNS TRIGGER AS $func$
    BEGIN
      IF EXISTS (SELECT 1 FROM contact_submissions WHERE sender_ip = NEW.sender_ip AND created_at > NOW() - INTERVAL '5 minutes' HAVING COUNT(*) >= 3) THEN
        RAISE EXCEPTION 'Too many submissions. Please wait before sending another message.';
      END IF;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS contact_rate_limit ON contact_submissions;
    CREATE TRIGGER contact_rate_limit BEFORE INSERT ON contact_submissions FOR EACH ROW EXECUTE FUNCTION check_contact_rate_limit();
  END IF;

  -- Rate limiting for analytics tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_views') THEN
    CREATE OR REPLACE FUNCTION check_analytics_rate_limit()
    RETURNS TRIGGER AS $func$
    BEGIN
      IF TG_TABLE_NAME = 'project_views' AND EXISTS (SELECT 1 FROM project_views WHERE user_ip = NEW.user_ip AND viewed_at > NOW() - INTERVAL '1 minute' HAVING COUNT(*) >= 10) THEN
        RAISE EXCEPTION 'Rate limit exceeded';
      ELSIF TG_TABLE_NAME = 'page_views' AND EXISTS (SELECT 1 FROM page_views WHERE user_ip = NEW.user_ip AND viewed_at > NOW() - INTERVAL '1 minute' HAVING COUNT(*) >= 30) THEN
        RAISE EXCEPTION 'Rate limit exceeded';
      ELSIF TG_TABLE_NAME = 'resume_downloads' AND EXISTS (SELECT 1 FROM resume_downloads WHERE user_ip = NEW.user_ip AND downloaded_at > NOW() - INTERVAL '1 hour' HAVING COUNT(*) >= 5) THEN
        RAISE EXCEPTION 'Rate limit exceeded';
      END IF;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS analytics_rate_limit ON project_views;
    CREATE TRIGGER analytics_rate_limit BEFORE INSERT ON project_views FOR EACH ROW EXECUTE FUNCTION check_analytics_rate_limit();

    DROP TRIGGER IF EXISTS analytics_rate_limit ON page_views;
    CREATE TRIGGER analytics_rate_limit BEFORE INSERT ON page_views FOR EACH ROW EXECUTE FUNCTION check_analytics_rate_limit();

    DROP TRIGGER IF EXISTS analytics_rate_limit ON resume_downloads;
    CREATE TRIGGER analytics_rate_limit BEFORE INSERT ON resume_downloads FOR EACH ROW EXECUTE FUNCTION check_analytics_rate_limit();
  END IF;

END;
$$;
