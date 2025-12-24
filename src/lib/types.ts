export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedAt: Date | null;
}
