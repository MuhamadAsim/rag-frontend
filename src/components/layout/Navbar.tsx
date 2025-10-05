import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  MessageSquare,
  Sparkles,
  User,
  Sun,
  Moon,
  Monitor,
  Crown,
  Coins,
  Shield,
  FileText,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Crown className="h-3 w-3 text-accent" />;
      case 'standard':
        return <Sparkles className="h-3 w-3 text-primary" />;
      default:
        return <Coins className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'text-accent';
      case 'standard':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  // 🔹 Client fetches admin files with React Query
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['client-files'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/admin/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data || [];
    },
    enabled: !!user && user.role !== 'admin', // only run for clients
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
  });

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 transition-smooth hover:scale-105"
        >
          <div className="relative">
            <MessageSquare className="h-8 w-8 text-primary" />
            <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
          </div>
          <span className="text-xl font-bold">ChatAI</span>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>

                    {user.plan && (
                      <div className="flex items-center space-x-1">
                        {getPlanIcon(user.plan)}
                        <p className={`text-xs leading-none capitalize ${getPlanColor(user.plan)}`}>
                          {user.plan} Plan
                        </p>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Admin only menu */}
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Client Files Menu */}
          {/* Client Files Menu */}
          {user && user.role !== 'admin' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>Available Files</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filesLoading ? (
                  <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                ) : files.length > 0 ? (
                  files.map((file: any) => (
                    <DropdownMenuItem key={file._id} asChild>
                      {/* ✅ Call backend download route instead of direct Cloudinary link */}
                      <a
                        href={`http://localhost:5000/api/admin/${file._id}/download`}
                        download
                      >
                        {file.filename}
                      </a>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No files available</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
