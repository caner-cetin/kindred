import { atom } from "jotai";
import { api } from "@/lib/api";
import {
  tasksAtom,
  metadataAtom,
  statsAtom,
  loadingAtom,
  filtersAtom,
  createFormAtom,
  editFormAtom,
  selectedTaskAtom,
  createDialogOpenAtom,
  editDialogOpenAtom,
  resetCreateFormAtom,
} from "./taskStore";
import type { TaskListResponse, TaskMetadata, CreateTaskData, UpdateTaskData } from "@/types/tasks";

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

export const loadTasksAtom = atom(null, async (get, set) => {
  try {
    const filters = get(filtersAtom);
    const query: Record<string, string> = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignee) query.assignee = filters.assignee;

    const response = await api.tasks.get({
      query,
      headers: getAuthHeaders(),
    });

    if (response.data) {
      const data = response.data as TaskListResponse;
      set(tasksAtom, data.tasks);
      set(statsAtom, data.stats);
    }
  } catch (error) {
    console.error("Failed to load tasks:", error);
  } finally {
    set(loadingAtom, false);
  }
});

export const loadMetadataAtom = atom(null, async (_get, set) => {
  try {
    const response = await api.tasks.metadata.get({
      headers: getAuthHeaders(),
    });

    if (response.data) {
      set(metadataAtom, response.data as TaskMetadata);
    }
  } catch (error) {
    console.error("Failed to load metadata:", error);
  }
});

export const createTaskAtom = atom(null, async (get, set) => {
  try {
    const createForm = get(createFormAtom);
    const taskData: CreateTaskData = {
      ...createForm,
      due_date: createForm.due_date || undefined,
    };

    const response = await api.tasks.post(taskData, {
      headers: getAuthHeaders(),
    });

    if (response.data) {
      set(createDialogOpenAtom, false);
      set(resetCreateFormAtom);
      set(loadTasksAtom);
    }
  } catch (error) {
    console.error("Failed to create task:", error);
  }
});

export const updateTaskAtom = atom(null, async (get, set) => {
  try {
    const selectedTask = get(selectedTaskAtom);
    const editForm = get(editFormAtom);

    if (!selectedTask) return;

    const taskData: UpdateTaskData = {
      ...editForm,
      due_date: editForm.due_date || undefined,
    };

    const response = await api.tasks({ id: selectedTask.id.toString() }).put(taskData, {
      headers: getAuthHeaders(),
    });

    if (response.data) {
      set(editDialogOpenAtom, false);
      set(selectedTaskAtom, null);
      set(loadTasksAtom);
    }
  } catch (error) {
    console.error("Failed to update task:", error);
  }
});

export const deleteTaskAtom = atom(null, async (_get, set, taskId: number) => {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    await api.tasks({ id: taskId.toString() }).delete({
      headers: getAuthHeaders(),
    });
    set(loadTasksAtom);
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
});

export const updateTaskStatusAtom = atom(null, async (_get, set, { taskId, newStatus }: { taskId: number; newStatus: string }) => {
  try {
    await api.tasks({ id: taskId.toString() }).status.patch(
      {
        status: newStatus as "To Do" | "In Progress" | "Completed",
      },
      {
        headers: getAuthHeaders(),
      }
    );
    set(loadTasksAtom);
  } catch (error) {
    console.error("Failed to update task status:", error);
  }
});

export const initializeDataAtom = atom(null, async (_get, set) => {
  set(loadTasksAtom);
  set(loadMetadataAtom);
});
