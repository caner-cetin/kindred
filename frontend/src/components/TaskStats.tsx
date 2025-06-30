import { useAtomValue } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle, ListTodo } from 'lucide-react';
import { taskCountsAtom, overdueTasksAtom, priorityTasksAtom } from '@/store/taskStore';

export function TaskStats() {
  const taskCounts = useAtomValue(taskCountsAtom);
  const overdueTasks = useAtomValue(overdueTasksAtom);
  const priorityTasks = useAtomValue(priorityTasksAtom);

  const stats = [
    {
      title: 'Total Tasks',
      value: taskCounts.total,
      icon: ListTodo,
      color: 'text-primary',
    },
    {
      title: 'To Do',
      value: taskCounts['To Do'],
      icon: Clock,
      color: 'text-muted-foreground',
    },
    {
      title: 'In Progress',
      value: taskCounts['In Progress'],
      icon: Clock,
      color: 'text-accent',
    },
    {
      title: 'Completed',
      value: taskCounts.Completed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Overdue',
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      title: 'High Priority',
      value: priorityTasks.length,
      icon: AlertTriangle,
      color: 'text-accent',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
