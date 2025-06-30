export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  status: string;
  priority?: string;
  priority_level?: number;
  creator_username: string;
  assignee_username?: string;
  creator_id: number;
  assignee_id?: number;
}

export interface Priority {
  id: number;
  name: string;
  level: number;
}

export interface Status {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
}

export interface TaskMetadata {
  priorities: Priority[];
  statuses: Status[];
  users: User[];
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority_id?: number;
  assignee_id?: number;
  due_date?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority_id?: number;
  assignee_id?: number;
  due_date?: string;
}

export interface TaskStats {
  [status: string]: number;
}

export interface TaskListResponse {
  tasks: Task[];
  stats: TaskStats;
}
