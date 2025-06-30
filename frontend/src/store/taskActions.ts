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

const refreshAccessToken = async () => {
  const refreshTokenValue = localStorage.getItem("refreshToken");

  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  try {
    const { data, error } = await api.refresh.post(undefined, {
      headers: {
        Authorization: `Bearer ${refreshTokenValue}`,
      },
    });

    if (error) {
      throw new Error((error.value as { message?: string })?.message || "Token refresh failed");
    }

    if (data && data.accessToken && data.refreshToken) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    }

    throw new Error("Invalid refresh response");
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw error;
  }
};

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

const makeAuthenticatedRequest = async <T>(requestFn: () => Promise<T>, retryCount = 0): Promise<T> => {
  try {
    return await requestFn();
  } catch (error: unknown) {
    const errorWithStatus = error as { status?: number };
    if (errorWithStatus?.status === 401 && retryCount === 0) {
      await refreshAccessToken();
      return await requestFn();
    }
    throw error;
  }
};

export const loadTasksAtom = atom(null, async (get, set) => {
  try {
    const filters = get(filtersAtom);
    const query: Record<string, string> = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignee) query.assignee = filters.assignee;

    const response = await makeAuthenticatedRequest(() =>
      api.tasks.get({
        query,
        headers: getAuthHeaders(),
      })
    );

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
    const response = await makeAuthenticatedRequest(() =>
      api.tasks.metadata.get({
        headers: getAuthHeaders(),
      })
    );

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

    const response = await makeAuthenticatedRequest(() =>
      api.tasks.post(taskData, {
        headers: getAuthHeaders(),
      })
    );

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

    const response = await makeAuthenticatedRequest(() =>
      api.tasks({ id: selectedTask.id.toString() }).put(taskData, {
        headers: getAuthHeaders(),
      })
    );

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
    await makeAuthenticatedRequest(() =>
      api.tasks({ id: taskId.toString() }).delete({
        headers: getAuthHeaders(),
      })
    );
    set(loadTasksAtom);
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
});

export const updateTaskStatusAtom = atom(null, async (_get, set, { taskId, newStatus }: { taskId: number; newStatus: string }) => {
  try {
    await makeAuthenticatedRequest(() =>
      api.tasks({ id: taskId.toString() }).status.patch(
        {
          status: newStatus as "To Do" | "In Progress" | "Completed",
        },
        {
          headers: getAuthHeaders(),
        }
      )
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
