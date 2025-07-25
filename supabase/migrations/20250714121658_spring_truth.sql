-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role_id INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  FOREIGN KEY (role_id) REFERENCES roles (id)
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions TEXT, -- JSON string of permissions
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES 
(1, 'Admin', 'Full system access', '["user_management", "role_management", "system_settings"]'),
(2, 'User', 'Standard user access', '["basic_access"]'),
(3, 'Manager', 'Manager level access', '["basic_access", "team_management"]');

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role_id) VALUES 
(1, 'admin@agenticweaver.com', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'Admin', 'User', 1);