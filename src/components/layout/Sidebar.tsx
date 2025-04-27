
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart2, 
  FileDown, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if the current route matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Remove auth from localStorage
    localStorage.removeItem('forex_tracker_auth');
    
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of ForexTracker.',
    });
    
    // Redirect to login page
    navigate('/');
  };
  
  return (
    <div 
      className={cn(
        "h-screen fixed left-0 top-16 pb-4 transition-all duration-300 z-20",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={toggleSidebar}
        />
      )}
      
      <div className="relative flex flex-col h-full overflow-y-auto border-r bg-card shadow-sm z-20">
        <div className="px-3 py-3 bg-muted/50 flex items-center">
          <div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
          {isOpen && (
            <div className="ml-3 text-sm font-medium">
              ForexTracker
            </div>
          )}
        </div>
        
        <div className="flex flex-col flex-1 py-4">
          <Link 
            to="/dashboard" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 mx-3 rounded-md mb-1 transition-all",
              isActive("/dashboard") 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-secondary text-muted-foreground"
            )}
          >
            <LayoutDashboard size={isOpen ? 16 : 20} />
            {isOpen && <span>Dashboard</span>}
          </Link>
          
          <Link 
            to="/trade-log" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 mx-3 rounded-md mb-1 transition-all",
              isActive("/trade-log") 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-secondary text-muted-foreground"
            )}
          >
            <BookOpen size={isOpen ? 16 : 20} />
            {isOpen && <span>Trade Log</span>}
          </Link>
          
          <Link 
            to="/analytics" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 mx-3 rounded-md mb-1 transition-all",
              isActive("/analytics") 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-secondary text-muted-foreground"
            )}
          >
            <BarChart2 size={isOpen ? 16 : 20} />
            {isOpen && <span>Analytics</span>}
          </Link>
          
          <Link 
            to="/import" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 mx-3 rounded-md mb-1 transition-all",
              isActive("/import") 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-secondary text-muted-foreground"
            )}
          >
            <FileDown size={isOpen ? 16 : 20} />
            {isOpen && <span>Import</span>}
          </Link>
        </div>

        <div className="px-3 mt-auto">
          <Link 
            to="/settings" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md mb-2 transition-all",
              isActive("/settings") 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-secondary text-muted-foreground"
            )}
          >
            <Settings size={isOpen ? 16 : 20} />
            {isOpen && <span>Settings</span>}
          </Link>
          
          <Button 
            variant="ghost" 
            className="w-full flex items-center gap-3 px-3 py-2 justify-start text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut size={isOpen ? 16 : 20} />
            {isOpen && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
