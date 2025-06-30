import { useEffect } from 'react';
import { Plus, Calendar, User, AlertCircle, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { TaskStats } from '@/components/TaskStats';

const priorityColors = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800',
};

export function TaskManagement({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const {
    tasks,
    metadata,
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
  } = useTaskManagement();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    loadTasks();
  }, [filters, loadTasks]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDateString: string) => {
    return new Date(dueDateString) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading tasks...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">Task Management</h1>
              <p className="text-muted-foreground">Manage your tasks and track progress</p>
            </div>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your project.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="create-title">Title</Label>
                  <Input
                    id="create-title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Task title"
                  />
                </div>

                <div>
                  <Label htmlFor="create-description">Description</Label>
                  <Input
                    id="create-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Task description (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="create-priority">Priority</Label>
                  <Select
                    value={createForm.priority_id?.toString() || ''}
                    onValueChange={(value) => setCreateForm({ ...createForm, priority_id: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {metadata?.priorities.map((priority) => (
                        <SelectItem key={priority.id} value={priority.id.toString()}>
                          {priority.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="create-due-date">Due Date</Label>
                  <Input
                    id="create-due-date"
                    type="date"
                    value={createForm.due_date}
                    onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={!createForm.title.trim()}>
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <TaskStats />
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={filters.status || 'all-statuses'} onValueChange={(value) => setFilters({ ...filters, status: value === 'all-statuses' ? '' : value })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              {metadata?.statuses.map((status) => (
                <SelectItem key={status.id} value={status.name}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.priority || 'all-priorities'} onValueChange={(value) => setFilters({ ...filters, priority: value === 'all-priorities' ? '' : value })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-priorities">All Priorities</SelectItem>
              {metadata?.priorities.map((priority) => (
                <SelectItem key={priority.id} value={priority.name}>
                  {priority.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.assignee || 'all-tasks'} onValueChange={(value) => setFilters({ ...filters, assignee: value === 'all-tasks' ? '' : value })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-tasks">All Tasks</SelectItem>
              <SelectItem value="me">Assigned to Me</SelectItem>
              <SelectItem value="created">Created by Me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          {(filters.status || filters.priority || filters.assignee) && (
            <Button
              variant="outline"
              onClick={() => setFilters({ status: '', priority: '', assignee: '' })}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No tasks found. Create your first task to get started!</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        {task.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[task.priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}>
                            {task.priority}
                          </span>
                        )}
                        {task.due_date && isOverdue(task.due_date) && task.status !== 'Completed' && (
                          <span className="flex items-center text-red-600 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-muted-foreground mb-3">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Created by {task.creator_username}
                        </div>
                        {task.assignee_username && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Assigned to {task.assignee_username}
                          </div>
                        )}
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due {formatDate(task.due_date)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={task.status}
                        onValueChange={(value) => handleStatusChange(task.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {metadata?.statuses.map((status) => (
                            <SelectItem key={status.id} value={status.name}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {(task.creator_id === user?.id || task.assignee_id === user?.id) && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {task.creator_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update task information.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Task description (optional)"
                />
              </div>

              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={editForm.priority_id?.toString() || 'no-priority'}
                  onValueChange={(value) => setEditForm({ ...editForm, priority_id: value === 'no-priority' ? undefined : parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-priority">No Priority</SelectItem>
                    {metadata?.priorities.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id.toString()}>
                        {priority.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-due-date">Due Date</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTask} disabled={!editForm.title.trim()}>
                Update Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
