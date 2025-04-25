
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const isMobile = useIsMobile();

  return (
    <nav className="flex items-center justify-between w-full h-16 px-4 border-b bg-white dark:bg-forex-primary">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="mr-2"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <NavLink to="/" className="flex items-center">
          <h1 className="text-xl font-bold text-forex-accent">
            Forex<span className="text-forex-primary">Hub</span>
          </h1>
        </NavLink>
      </div>

      {!isMobile && (
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 bg-secondary/10"
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          Add Trade
        </Button>
        <Button size="sm">Import</Button>
      </div>
    </nav>
  );
};

export default Navbar;
