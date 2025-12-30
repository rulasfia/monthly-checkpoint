import { randomUUID } from "node:crypto";

export const initDatabase = () => {
  return `
  -- Enable foreign keys (important in SQLite)
  PRAGMA foreign_keys = ON;

  -- =====================
  -- Tasks table
  -- =====================
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    monthlyDueDate INTEGER NOT NULL CHECK (monthlyDueDate BETWEEN 1 AND 31),
    createdAt TEXT NOT NULL,
    expiresAt TEXT NULL
  );

  -- =====================
  -- Completions table
  -- =====================
  CREATE TABLE IF NOT EXISTS completions (
    id TEXT PRIMARY KEY,
    taskId TEXT NOT NULL,
    monthIndex TEXT NOT NULL, -- YYYY-MM
    completedAt TEXT NULL,
    monthlyNote TEXT NULL,

    FOREIGN KEY (taskId)
      REFERENCES tasks(id)
      ON DELETE CASCADE,

    -- One completion per task per month
    UNIQUE (taskId, monthIndex)
  );

  -- Task date filtering
  CREATE INDEX IF NOT EXISTS idx_tasks_createdAt
    ON tasks(createdAt);

  CREATE INDEX IF NOT EXISTS idx_tasks_expiresAt
    ON tasks(expiresAt);

  -- Completion lookups
  CREATE INDEX IF NOT EXISTS idx_completions_taskId
    ON completions(taskId);

  CREATE INDEX IF NOT EXISTS idx_completions_monthIndex
    ON completions(monthIndex);

  -- Combined index for joins
  CREATE INDEX IF NOT EXISTS idx_completions_task_month
    ON completions(taskId, monthIndex);
  `;
};

export const monthlyTasksQuery = (month: string) => {
  return `
  SELECT
    t.*,
    c.completedAt,
    c.monthlyNote,
    c.monthIndex
  FROM tasks t
  LEFT JOIN completions c
    ON c.taskId = t.id
    AND c.monthIndex = '${month}'
  WHERE
    t.createdAt < date('${month}' || '-01', '+1 month')
    AND (
      t.expiresAt IS NULL
      OR t.expiresAt >= date('${month}' || '-01')
      );
  `;
};

export interface TasksQueryType {
  id: string;
  title: string;
  description: string;
  monthlyDueDate: number;
  createdAt: string;
  expiresAt: any;
  completedAt: any;
  monthlyNote: any;
  monthIndex: any;
}

export interface NewTaskProps {
  id?: string;
  title: string;
  description: string;
  monthlyDueDate: number;
  createdAt: string;
  expiresAt?: any;
}

export const insertNewTaskQuery = (props: NewTaskProps) => {
  const id = props.id || randomUUID();
  return `
  INSERT INTO tasks (
    id,
    title,
    description,
    monthlyDueDate,
    createdAt,
    expiresAt
  ) VALUES (
    '${id}',
    '${props.title}',
    '${props.description}',
    '${props.monthlyDueDate}',
    '${props.createdAt}',
    ${props.expiresAt ? `'${props.expiresAt}'` : "NULL"}
  );
  `;
};

export const updateTaskCompletionQuery = (props: {
  id?: string;
  taskId: string;
  monthIndex: string;
  completedAt: string | null;
  monthlyNote?: string;
}) => {
  const id = props.id || randomUUID();
  return `
  INSERT INTO completions (
    id,
    taskId,
    monthIndex,
    completedAt,
    monthlyNote
  ) VALUES (
    '${id}',
    '${props.taskId}',
    '${props.monthIndex}',
    ${props.completedAt ? `'${props.completedAt}'` : "NULL"},
    '${props.monthlyNote ?? ""}'
  )
  ON CONFLICT(taskId, monthIndex) DO UPDATE SET
    completedAt = excluded.completedAt,
    monthlyNote = COALESCE(excluded.monthlyNote, completions.monthlyNote);
  `;
};
