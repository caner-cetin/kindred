import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  tasksAtom,
  metadataAtom,
  statsAtom,
  loadingAtom,
  createDialogOpenAtom,
  editDialogOpenAtom,
  filtersAtom,
  createFormAtom,
  editFormAtom,
  setEditFormFromTaskAtom,
} from "@/store/taskStore";
import { createTaskAtom, updateTaskAtom, deleteTaskAtom, updateTaskStatusAtom, initializeDataAtom, loadTasksAtom } from "@/store/taskActions";
import type { Task } from "@/types/tasks";

export function useTaskManagement() {
  const tasks = useAtomValue(tasksAtom);
  const metadata = useAtomValue(metadataAtom);
  const stats = useAtomValue(statsAtom);
  const loading = useAtomValue(loadingAtom);

  const [createDialogOpen, setCreateDialogOpen] = useAtom(createDialogOpenAtom);
  const [editDialogOpen, setEditDialogOpen] = useAtom(editDialogOpenAtom);
  const [filters, setFilters] = useAtom(filtersAtom);
  const [createForm, setCreateForm] = useAtom(createFormAtom);
  const [editForm, setEditForm] = useAtom(editFormAtom);

  const initializeData = useSetAtom(initializeDataAtom);
  const loadTasks = useSetAtom(loadTasksAtom);
  const createTask = useSetAtom(createTaskAtom);
  const updateTask = useSetAtom(updateTaskAtom);
  const deleteTask = useSetAtom(deleteTaskAtom);
  const updateTaskStatus = useSetAtom(updateTaskStatusAtom);
  const setEditFormFromTask = useSetAtom(setEditFormFromTaskAtom);

  const openEditDialog = (task: Task) => {
    setEditFormFromTask(task);
    setEditDialogOpen(true);
  };

  const handleCreateTask = () => {
    createTask();
  };

  const handleUpdateTask = () => {
    updateTask();
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId);
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskStatus({ taskId, newStatus });
  };

  return {
    tasks,
    metadata,
    stats,
    loading,
    createDialogOpen,
    editDialogOpen,
    filters,
    createForm,
    editForm,

    setCreateDialogOpen,
    setEditDialogOpen,
    setFilters,
    setCreateForm,
    setEditForm,

    initializeData,
    loadTasks,
    openEditDialog,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleStatusChange,
  };
}
