import Database from 'better-sqlite3'; // Changed import
import bcrypt from 'bcryptjs';
import { User, Role } from '../types'; // Assuming these types are defined elsewhere

const dbPath = 'aw_build.db';
const db = new Database(dbPath); // Use better-sqlite3 directly

// No need for promisify as better-sqlite3 is synchronous
// const dbRun = promisify(db.run.bind(db));
// const dbGet = promisify(db.get.bind(db));
// const dbAll = promisify(db.all.bind(db));

const initializeDatabase = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT -- JSON string of permissions
    );

    CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_roles_updated_at
    AFTER UPDATE ON roles
    FOR EACH ROW
    BEGIN
      UPDATE roles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `;

  try {
    // Execute schema for better-sqlite3
    db.exec(schema);

    // Insert default roles if they don't exist
    db.prepare(`INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES
      (1, 'Admin', 'Full system access', '["user_management", "role_management", "system_settings"]'),
      (2, 'User', 'Standard user access', '["basic_access"]'),
      (3, 'Manager', 'Manager level access', '["basic_access", "team_management"]')`).run();

    // Insert default admin user if they don't exist
    const hashedPassword = bcrypt.hashSync('Appdev2025!', 10);
    db.prepare(`INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role_id) VALUES
      (1, 'freddie@3cpublish.com', ?, 'Freddie', 'Admin', 1)`).run(hashedPassword);

    console.log('Database initialized successfully');
  } catch (error: any) {
    console.error('Database initialization error:', error.message);
    // Consider exiting or a more robust error handling for critical errors
    // process.exit(1);
  }
};

const userOperations = {
  getAll: async (): Promise<User[]> => {
    const query = `
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;
    return db.prepare(query).all() as User[];
  },

  getById: async (id: number): Promise<User | undefined> => {
    const query = `
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    return db.prepare(query).get(id) as User | undefined;
  },

  getByEmail: async (email: string): Promise<User | undefined> => {
    const query = `
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `;
    return db.prepare(query).get(email) as User | undefined;
  },

  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'role_name'>): Promise<{ id: number }> => {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(
      user.email,
      user.password_hash,
      user.first_name,
      user.last_name,
      user.role_id
    );
    return { id: result.lastInsertRowid as number };
  },

  update: async (id: number, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at' | 'role_name'>>): Promise<boolean> => {
    let updateFields: string[] = [];
    let params: any[] = [];

    if (userData.email !== undefined) {
      updateFields.push('email = ?');
      params.push(userData.email);
    }
    if (userData.password_hash !== undefined) {
      updateFields.push('password_hash = ?');
      params.push(userData.password_hash);
    }
    if (userData.first_name !== undefined) {
      updateFields.push('first_name = ?');
      params.push(userData.first_name);
    }
    if (userData.last_name !== undefined) {
      updateFields.push('last_name = ?');
      params.push(userData.last_name);
    }
    if (userData.role_id !== undefined) {
      updateFields.push('role_id = ?');
      params.push(userData.role_id);
    }

    if (updateFields.length === 0) {
      return false; // Nothing to update
    }

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    params.push(id);

    const result = db.prepare(query).run(...params);
    return result.changes > 0;
  },

  delete: async (id: number): Promise<boolean> => {
    const query = `DELETE FROM users WHERE id = ?`;
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }
};

const roleOperations = {
  getAll: async (): Promise<Role[]> => {
    const query = `SELECT * FROM roles ORDER BY id ASC`;
    return db.prepare(query).all() as Role[];
  },

  getById: async (id: number): Promise<Role | undefined> => {
    const query = `SELECT * FROM roles WHERE id = ?`;
    return db.prepare(query).get(id) as Role | undefined;
  },

  create: async (role: Omit<Role, 'id'>): Promise<{ id: number }> => {
    const query = `INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)`;
    const result = db.prepare(query).run(role.name, role.description, role.permissions);
    return { id: result.lastInsertRowid as number };
  },

  update: async (id: number, roleData: Partial<Omit<Role, 'id'>>): Promise<boolean> => {
    let updateFields: string[] = [];
    let params: any[] = [];

    if (roleData.name !== undefined) {
      updateFields.push('name = ?');
      params.push(roleData.name);
    }
    if (roleData.description !== undefined) {
      updateFields.push('description = ?');
      params.push(roleData.description);
    }
    if (roleData.permissions !== undefined) {
      updateFields.push('permissions = ?');
      params.push(roleData.permissions);
    }

    if (updateFields.length === 0) {
      return false; // Nothing to update
    }

    const query = `
      UPDATE roles
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    params.push(id);

    const result = db.prepare(query).run(...params);
    return result.changes > 0;
  },

  delete: async (id: number): Promise<boolean> => {
    // Before deleting a role, you might want to consider how to handle users
    // who currently have this role_id. Options:
    // 1. Set their role_id to NULL.
    // 2. Set their role_id to a default 'User' role.
    // 3. Prevent deletion if any users are assigned to it.
    // The current FOREIGN KEY constraint is likely ON DELETE NO ACTION or RESTRICT.
    // If you need CASCADE or SET NULL, you'd define it in the schema.

    const deleteRoleQuery = `DELETE FROM roles WHERE id = ?`;
    const result = db.prepare(deleteRoleQuery).run(id);
    return result.changes > 0;
  }
};

export { initializeDatabase, userOperations, roleOperations };