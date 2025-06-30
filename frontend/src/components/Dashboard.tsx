import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { TaskManagement } from '@/components/TaskManagement';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, Settings } from 'lucide-react';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="max-w-6xl mx-auto p-3 sm:p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Kindred</h1>
                  <p className="text-muted-foreground text-sm sm:text-base">Task Scheduler</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 sm:gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <strong>Username:</strong> {user?.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <strong>Email:</strong> {user?.email}
                  </DropdownMenuItem>
                  {user?.fullName && (
                    <DropdownMenuItem disabled>
                      <strong>Name:</strong> {user.fullName}
                    </DropdownMenuItem>
                  )}
                  {user?.createdAt && (
                    <DropdownMenuItem disabled>
                      <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - TaskManagement */}
      <TaskManagement />
    </div>
  );
}