import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Task, TaskMetadata, CreateTaskData } from "@/types/tasks";

export const tasksAtom = atom<Task[]>([]);
export const metadataAtom = atom<TaskMetadata | null>(null);
export const statsAtom = atom<Record<string, number>>({});
export const loadingAtom = atom(true);

export const createDialogOpenAtom = atom(false);
export const editDialogOpenAtom = atom(false);
export const selectedTaskAtom = atom<Task | null>(null);

export const filtersAtom = atomWithStorage("task-filters", {
  status: "",
  priority: "",
  assignee: "",
});

export const createFormAtom = atom<CreateTaskData>({
  title: "",
  description: "",
  priority_id: undefined,
  assignee_id: undefined,
  due_date: "",
});

export const editFormAtom = atom<CreateTaskData>({
  title: "",
  description: "",
  priority_id: undefined,
  assignee_id: undefined,
  due_date: "",
});

export const filteredTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const filters = get(filtersAtom);

  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });
});

export const resetCreateFormAtom = atom(null, (_get, set) => {
  set(createFormAtom, {
    title: "",
    description: "",
    priority_id: undefined,
    assignee_id: undefined,
    due_date: "",
  });
});

export const initializeCreateFormAtom = atom(null, (_get, set, currentUserId?: number) => {
  set(createFormAtom, {
    title: "",
    description: "",
    priority_id: undefined,
    assignee_id: currentUserId,
    due_date: "",
  });
});

export const setEditFormFromTaskAtom = atom(null, (get, set, task: Task) => {
  const metadata = get(metadataAtom);
  set(editFormAtom, {
    title: task.title,
    description: task.description || "",
    priority_id: metadata?.priorities.find((p) => p.name === task.priority)?.id,
    assignee_id: task.assignee_id,
    due_date: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
  });
  set(selectedTaskAtom, task);
});

export const taskCountsAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const counts = {
    total: tasks.length,
    "To Do": 0,
    "In Progress": 0,
    Completed: 0,
  };

  tasks.forEach((task) => {
    if (task.status in counts) {
      counts[task.status as keyof typeof counts]++;
    }
  });

  return counts;
});

export const overdueTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const now = new Date();

  return tasks.filter((task) => task.due_date && new Date(task.due_date) < now && task.status !== "Completed");
});

export const priorityTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  return tasks.filter((task) => task.priority === "High" || task.priority === "Critical");
});
