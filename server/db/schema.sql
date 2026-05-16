-- =============================================================================
-- TaskFlow — PostgreSQL schema
-- Run: npm run db:init  (from server/)
-- =============================================================================

-- Reset (safe for development re-runs)
DROP TABLE IF EXISTS task_label_map CASCADE;
DROP TABLE IF EXISTS task_labels CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. users
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- -----------------------------------------------------------------------------
-- 2. projects
-- -----------------------------------------------------------------------------
CREATE TABLE projects (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  description TEXT,
  color       VARCHAR(7)    NOT NULL DEFAULT '#6366F1',
  owner_id    INTEGER       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner_id ON projects (owner_id);

-- -----------------------------------------------------------------------------
-- 3. project_members
-- -----------------------------------------------------------------------------
CREATE TABLE project_members (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER      NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  user_id    INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role       VARCHAR(20)  NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner', 'member', 'viewer')),
  UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members (project_id);
CREATE INDEX idx_project_members_user_id ON project_members (user_id);

-- -----------------------------------------------------------------------------
-- 4. tasks
-- -----------------------------------------------------------------------------
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  status      VARCHAR(20)   NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in_progress', 'done')),
  priority    VARCHAR(10)   NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
  project_id  INTEGER       NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  assigned_to INTEGER       REFERENCES users (id) ON DELETE SET NULL,
  due_date    DATE,
  created_by  INTEGER       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_id   ON tasks (project_id);
CREATE INDEX idx_tasks_assigned_to  ON tasks (assigned_to);
CREATE INDEX idx_tasks_created_by   ON tasks (created_by);
CREATE INDEX idx_tasks_status       ON tasks (status);
CREATE INDEX idx_tasks_priority     ON tasks (priority);
CREATE INDEX idx_tasks_due_date     ON tasks (due_date);

-- -----------------------------------------------------------------------------
-- 5. task_comments
-- -----------------------------------------------------------------------------
CREATE TABLE task_comments (
  id         SERIAL PRIMARY KEY,
  task_id    INTEGER      NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  user_id    INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task_id ON task_comments (task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments (user_id);

-- -----------------------------------------------------------------------------
-- 6. task_labels
-- -----------------------------------------------------------------------------
CREATE TABLE task_labels (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  color      VARCHAR(7)   NOT NULL DEFAULT '#94A3B8',
  project_id INTEGER      NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  UNIQUE (project_id, name)
);

CREATE INDEX idx_task_labels_project_id ON task_labels (project_id);

-- -----------------------------------------------------------------------------
-- 7. task_label_map
-- -----------------------------------------------------------------------------
CREATE TABLE task_label_map (
  id       SERIAL PRIMARY KEY,
  task_id  INTEGER NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  label_id INTEGER NOT NULL REFERENCES task_labels (id) ON DELETE CASCADE,
  UNIQUE (task_id, label_id)
);

CREATE INDEX idx_task_label_map_task_id  ON task_label_map (task_id);
CREATE INDEX idx_task_label_map_label_id ON task_label_map (label_id);

-- =============================================================================
-- Seed data
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Demo users for local seeding only (NOT production secrets).
-- Set VITE_GUEST_PASSWORD in client/.env to match the plaintext used here.
-- alex@taskflow.dev is the portfolio guest demo account.
INSERT INTO users (name, email, password_hash, avatar_url) VALUES
  (
    'Alex Morgan',
    'alex@taskflow.dev',
    crypt('password123', gen_salt('bf', 10)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  ),
  (
    'Jordan Lee',
    'jordan@taskflow.dev',
    crypt('password123', gen_salt('bf', 10)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'
  );

-- -----------------------------------------------------------------------------
-- Sample projects
-- -----------------------------------------------------------------------------
INSERT INTO projects (name, description, color, owner_id) VALUES
  (
    'Work Tasks',
    'Professional tasks, sprints, and deliverables for the team.',
    '#3B82F6',
    1
  ),
  (
    'Personal Goals',
    'Health, learning, and life improvement goals.',
    '#10B981',
    1
  ),
  (
    'Shopping List',
    'Groceries, household items, and errands to run.',
    '#F59E0B',
    1
  );

-- -----------------------------------------------------------------------------
-- Project members
-- -----------------------------------------------------------------------------
INSERT INTO project_members (project_id, user_id, role) VALUES
  (1, 1, 'owner'),
  (1, 2, 'member'),
  (2, 1, 'owner'),
  (2, 2, 'viewer'),
  (3, 1, 'owner'),
  (3, 2, 'member');

-- -----------------------------------------------------------------------------
-- Task labels (per project)
-- -----------------------------------------------------------------------------
INSERT INTO task_labels (name, color, project_id) VALUES
  ('Design',    '#8B5CF6', 1),
  ('Bug',       '#EF4444', 1),
  ('Docs',      '#06B6D4', 1),
  ('Health',    '#10B981', 2),
  ('Finance',   '#F59E0B', 2),
  ('Errands',   '#F97316', 3),
  ('Urgent',    '#DC2626', 3);

-- -----------------------------------------------------------------------------
-- Guest demo tasks (alex@taskflow.dev — user id 1)
-- Statuses: todo (pending), in_progress, done (completed)
-- -----------------------------------------------------------------------------
INSERT INTO tasks (
  title, description, status, priority, project_id,
  assigned_to, due_date, created_by
) VALUES
  (
    'Ship portfolio case study',
    'Publish the TaskFlow walkthrough with screenshots, architecture notes, and a live demo link for recruiters.',
    'done',
    'high',
    1,
    1,
    CURRENT_DATE - INTERVAL '2 days',
    1
  ),
  (
    'Design dashboard empty states',
    'Illustrations, copy, and primary CTAs for zero-task and zero-project views across light and dark themes.',
    'done',
    'medium',
    1,
    1,
    CURRENT_DATE - INTERVAL '1 day',
    1
  ),
  (
    'Implement guest login flow',
    'One-click guest access on the login page wired to the demo account and seeded workspace data.',
    'in_progress',
    'high',
    1,
    1,
    CURRENT_DATE + INTERVAL '1 day',
    1
  ),
  (
    'Polish kanban drag-and-drop',
    'Smooth column transitions, mobile tabs, and optimistic updates when moving cards between Todo and Done.',
    'in_progress',
    'medium',
    1,
    1,
    CURRENT_DATE + INTERVAL '4 days',
    1
  ),
  (
    'Write API integration tests',
    'Cover auth, tasks, and projects routes with happy-path and validation cases in CI.',
    'todo',
    'medium',
    1,
    1,
    CURRENT_DATE + INTERVAL '7 days',
    1
  ),
  (
    'Plan Q2 learning goals',
    'Block weekly time for TypeScript patterns, system design reading, and one open-source contribution.',
    'todo',
    'low',
    2,
    1,
    CURRENT_DATE + INTERVAL '14 days',
    1
  ),
  (
    'Order standing desk accessories',
    'Monitor arm, cable tray, and desk mat — compare reviews and check delivery before the move.',
    'todo',
    'low',
    3,
    1,
    CURRENT_DATE + INTERVAL '3 days',
    1
  );

-- -----------------------------------------------------------------------------
-- Task ↔ label mappings
-- -----------------------------------------------------------------------------
INSERT INTO task_label_map (task_id, label_id) VALUES
  (1, 1),  -- Portfolio case study → Design
  (2, 1),  -- Empty states → Design
  (3, 3),  -- Guest login → Docs
  (4, 2),  -- Kanban polish → Bug
  (5, 3),  -- API tests → Docs
  (6, 4),  -- Learning goals → Health
  (7, 6);  -- Desk accessories → Errands

-- -----------------------------------------------------------------------------
-- Sample comments
-- -----------------------------------------------------------------------------
INSERT INTO task_comments (task_id, user_id, content) VALUES
  (
    1,
    1,
    'Case study draft is live on Notion — ready for final proofread.'
  ),
  (
    3,
    2,
    'Guest button should sit directly under Sign In so portfolio visitors spot it immediately.'
  ),
  (
    3,
    1,
    'Agreed — wiring it to alex@taskflow.dev with seeded tasks for the demo.'
  ),
  (
    4,
    1,
    'Mobile column tabs feel much snappier after the last pass.'
  );
