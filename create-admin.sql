INSERT INTO admin_users (email, password_hash, role)
VALUES ('admin@example.com', 'placeholder_hash', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

INSERT INTO admin_users (email, password_hash, role)
VALUES ('editor@example.com', 'placeholder_hash', 'editor')
ON CONFLICT (email) DO UPDATE SET role = 'editor';