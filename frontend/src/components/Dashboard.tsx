import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.fullName || user?.username}!</h1>
            <p className="text-muted-foreground">Manage your tasks and projects</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card data-card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                {user?.fullName && <p><strong>Full Name:</strong> {user.fullName}</p>}
                {user?.createdAt && (
                  <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card data-card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Task management coming soon...</p>
            </CardContent>
          </Card>

          <Card data-card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Your project overview</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Project management coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}