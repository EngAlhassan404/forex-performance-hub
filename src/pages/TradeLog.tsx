
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import TradeTable from '@/components/trades/TradeTable';
import TradeForm from '@/components/trades/TradeForm';
import { dummyTrades } from '@/lib/dummyData';

const TradeLog = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('trades');

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
              <h1 className="text-2xl font-bold">Trade Log</h1>
              <p className="text-muted-foreground">View and manage your trading journal</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="trades">All Trades</TabsTrigger>
              <TabsTrigger value="add">Add New Trade</TabsTrigger>
            </TabsList>
            <TabsContent value="trades">
              <TradeTable data={dummyTrades} />
            </TabsContent>
            <TabsContent value="add">
              <TradeForm />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default TradeLog;
