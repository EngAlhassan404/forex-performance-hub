
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ImportForm from '@/components/import/ImportForm';

const Import = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-forex-primary/20">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Import Data</h1>
              <p className="text-muted-foreground">Import your trades from external sources</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <ImportForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Import;
