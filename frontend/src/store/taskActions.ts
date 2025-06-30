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
import type { TaskListResponse, TaskMetadata, CreateTaskData, UpdateTaskData, Task } from "@/types/tasks";
import { webSocketService } from "@/services/websocket";
import type { TaskEvent } from "@/services/websocket";

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

// Load only stats without affecting the current task list
export const loadStatsOnlyAtom = atom(null, async (get, set) => {
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
      // Only update stats, not the tasks themselves
      set(statsAtom, data.stats);
    }
  } catch (error) {
    console.error("Failed to load stats:", error);
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
      // Don't reload - WebSocket will handle the update
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
      // Don't reload - WebSocket will handle the update
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
    // Don't reload - WebSocket will handle the update
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
    // Don't reload - WebSocket will handle the update
  } catch (error) {
    console.error("Failed to update task status:", error);
    // On error, reload to get the correct state
    set(loadTasksAtom);
  }
});

export const initializeDataAtom = atom(null, async (_get, set) => {
  set(loadTasksAtom);
  set(loadMetadataAtom);
});

const convertBackendTaskToFrontend = (backendTask: {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  priority?: string;
  creator_id: number;
  assignee_id?: number;
  creator_username: string;
  assignee_username?: string;
  created_at: string;
  updated_at: string;
}): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    due_date: backendTask.due_date,
    status: backendTask.status,
    priority: backendTask.priority,
    creator_id: backendTask.creator_id,
    assignee_id: backendTask.assignee_id,
    creator_username: backendTask.creator_username,
    assignee_username: backendTask.assignee_username,
    created_at: backendTask.created_at,
    updated_at: backendTask.updated_at,
  };
};

const handleTaskCreated = (get: Function, set: Function) => (event: TaskEvent) => {
  if (!event.task) return;
  
  const currentTasks = get(tasksAtom);
  const newTask = convertBackendTaskToFrontend(event.task);
  set(tasksAtom, [...currentTasks, newTask]);
  
  // Only refresh stats, not the full task list
  set(loadStatsOnlyAtom);
};

const handleTaskUpdated = (get: Function, set: Function) => (event: TaskEvent) => {
  if (!event.task) return;
  
  const currentTasks = get(tasksAtom);
  const updatedTask = convertBackendTaskToFrontend(event.task);
  
  const updatedTasks = currentTasks.map((task: Task) => 
    task.id === event.taskId ? updatedTask : task
  );
  
  set(tasksAtom, updatedTasks);
  
  // Only refresh stats, not the full task list
  set(loadStatsOnlyAtom);
};

const handleTaskStatusChanged = (get: Function, set: Function) => (event: TaskEvent) => {
  if (!event.task) return;
  
  const currentTasks = get(tasksAtom);
  const updatedTask = convertBackendTaskToFrontend(event.task);
  
  const updatedTasks = currentTasks.map((task: Task) => 
    task.id === event.taskId ? updatedTask : task
  );
  
  set(tasksAtom, updatedTasks);
  
  // Only refresh stats, not the full task list
  set(loadStatsOnlyAtom);
};

const handleTaskDeleted = (get: Function, set: Function) => (event: TaskEvent) => {
  const currentTasks = get(tasksAtom);
  const filteredTasks = currentTasks.filter((task: Task) => task.id !== event.taskId);
  set(tasksAtom, filteredTasks);
  
  // Only refresh stats, not the full task list
  set(loadStatsOnlyAtom);
};

// Store handler references to enable cleanup
let currentHandlers: {
  taskCreated?: (event: TaskEvent) => void;
  taskUpdated?: (event: TaskEvent) => void;
  taskStatusChanged?: (event: TaskEvent) => void;
  taskDeleted?: (event: TaskEvent) => void;
} = {};

// Atom to setup WebSocket listeners
export const setupWebSocketListenersAtom = atom(null, (get, set) => {
  // Remove existing listeners first
  if (currentHandlers.taskCreated) {
    webSocketService.removeEventListener('TASK_CREATED', currentHandlers.taskCreated);
  }
  if (currentHandlers.taskUpdated) {
    webSocketService.removeEventListener('TASK_UPDATED', currentHandlers.taskUpdated);
  }
  if (currentHandlers.taskStatusChanged) {
    webSocketService.removeEventListener('TASK_STATUS_CHANGED', currentHandlers.taskStatusChanged);
  }
  if (currentHandlers.taskDeleted) {
    webSocketService.removeEventListener('TASK_DELETED', currentHandlers.taskDeleted);
  }
  
  // Create new handlers
  currentHandlers.taskCreated = handleTaskCreated(get, set);
  currentHandlers.taskUpdated = handleTaskUpdated(get, set);
  currentHandlers.taskStatusChanged = handleTaskStatusChanged(get, set);
  currentHandlers.taskDeleted = handleTaskDeleted(get, set);
  
  // Add event listeners
  webSocketService.addEventListener('TASK_CREATED', currentHandlers.taskCreated);
  webSocketService.addEventListener('TASK_UPDATED', currentHandlers.taskUpdated);
  webSocketService.addEventListener('TASK_STATUS_CHANGED', currentHandlers.taskStatusChanged);
  webSocketService.addEventListener('TASK_DELETED', currentHandlers.taskDeleted);
});
