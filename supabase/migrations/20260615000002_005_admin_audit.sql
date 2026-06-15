-- ============================================================
-- ADMIN AUDIT LOG
-- Tracks all admin actions for security review
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
CREATE POLICY "audit_log_select" ON admin_audit_log FOR SELECT
  TO authenticated USING (true);

-- Service/context can insert via the app
CREATE POLICY "audit_log_insert" ON admin_audit_log FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_email ON admin_audit_log(email);
