export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedAt: Date | null;
  createdAt: Date; // used as the starting point for recurring tasks
  expiresAt: Date | null; // used to determine if the recurring task stoping point
}

export interface TaskSQL {
  id: string;
  title: string;
  description: string;
  montlyDueDate: Date;
  createdAt: Date; // used as the starting point for recurring tasks
  expiresAt: Date | null; // used to determine if the recurring task stoping point. null = never expires
}

export interface CompletionSQL {
  id: string;
  taskId: string;
  monthIndex: string; // in `YYYY-MM` format
  completedAt: Date | null;
  monthlyNote: string | null;
}
