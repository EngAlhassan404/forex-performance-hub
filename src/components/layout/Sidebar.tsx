
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Table, 
  BarChart, 
  Upload, 
  Settings, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const isMobile = useIsMobile();
  
  const navItems = [
    { 
      title: 'Dashboard', 
      path: '/', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      title: 'Trade Log', 
      path: '/trade-log', 
      icon: <Table className="h-5 w-5" /> 
    },
    { 
      title: 'Analytics', 
      path: '/analytics', 
      icon: <BarChart className="h-5 w-5" /> 
    },
    { 
      title: 'Import Data', 
      path: '/import', 
      icon: <Upload className="h-5 w-5" /> 
    },
    { 
      title: 'Settings', 
      path: '/settings', 
      icon: <Settings className="h-5 w-5" /> 
    }
  ];

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-forex-primary text-white transform transition-transform duration-300 ease-in-out",
        isMobile && !isOpen && "-translate-x-full",
        !isMobile && !isOpen && "w-20"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-forex-secondary">
        <h2 className={cn(
          "font-bold transition-opacity",
          !isOpen && !isMobile && "opacity-0"
        )}>
          Trading Journal
        </h2>
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white hover:bg-forex-secondary"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex flex-col p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center p-2 rounded-md transition-colors",
              isActive ? "bg-forex-accent text-white" : "text-white/80 hover:bg-forex-secondary hover:text-white",
              !isOpen && !isMobile && "justify-center"
            )}
          >
            {item.icon}
            <span className={cn(
              "ml-3 transition-opacity duration-200",
              (!isOpen && !isMobile) && "opacity-0 w-0 overflow-hidden"
            )}>
              {item.title}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className={cn(
          "bg-forex-secondary rounded-md p-3 text-sm",
          !isOpen && !isMobile && "hidden"
        )}>
          <p className="font-medium mb-2">Trading Stats</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>Win Rate:</div>
            <div className="text-right text-forex-accent font-medium">62.5%</div>
            <div>Profit:</div>
            <div className="text-right text-forex-profit font-medium">$430</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
