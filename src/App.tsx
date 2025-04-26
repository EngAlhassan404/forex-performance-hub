
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import TradeLog from '@/pages/TradeLog';
import Analytics from '@/pages/Analytics';
import Import from '@/pages/Import';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import EditTrade from '@/pages/EditTrade';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/trade-log" element={<TradeLog />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/import" element={<Import />} />
        <Route path="/edit-trade/:id" element={<EditTrade />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
