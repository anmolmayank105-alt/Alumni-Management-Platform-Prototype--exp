import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { GraduationCap, LogOut, Settings, User, MessageCircle } from 'lucide-react';

interface HeaderProps {
  user: any;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Header({ user, currentPage, onNavigate, onLogout }: HeaderProps) {
  const navItems = user.role === 'admin' 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: null },
        { id: 'search', label: 'Search', icon: null },
        { id: 'admin', label: 'Admin Panel', icon: null },
        { id: 'chat', label: 'Chat', icon: MessageCircle }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: null },
        { id: 'search', label: 'Search', icon: null },
        { id: 'profile', label: 'Profile', icon: null },
        { id: 'events', label: 'Events', icon: null },
        { id: 'fundraisers', label: 'Fundraisers', icon: null },
        { id: 'chat', label: 'Chat', icon: MessageCircle }
      ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Alumni Network</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                onClick={() => onNavigate(item.id)}
                className="rounded-lg"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" align="end">
              <div className="px-3 py-2 border-b">
                <p className="font-medium">{user.name}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4 flex space-x-1 overflow-x-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate(item.id)}
              className="rounded-lg whitespace-nowrap"
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}