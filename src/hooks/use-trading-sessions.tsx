
import { useState, useEffect } from 'react';
import { TradingSession } from '@/lib/types';
import { determineActiveSession, getSessionDescription, getAvailableSessions } from '@/lib/sessionData';

export function useTradingSessions() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSessions, setActiveSessions] = useState<TradingSession[]>([]);
  const [nextSession, setNextSession] = useState<TradingSession | null>(null);
  const [timeToNextSession, setTimeToNextSession] = useState<string | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // every minute
    
    return () => clearInterval(timer);
  }, []);

  // Determine active sessions whenever time changes
  useEffect(() => {
    const active = determineActiveSession(currentTime);
    setActiveSessions(active);
    
    // Determine next session
    // This is a simplified example and would need more logic for real implementation
    const allSessions: TradingSession[] = ['TOKYO', 'LONDON', 'NEW_YORK', 'SYDNEY'] as TradingSession[];
    const mainActiveSessions = active.filter(s => 
      allSessions.includes(s) && s !== 'NEUTRAL'
    );
    
    if (mainActiveSessions.length === 0) {
      // Find next session time (simplified)
      // In a real implementation, we'd calculate exact times
      const next = 'SYDNEY' as TradingSession; // Example: default to Sydney as next
      setNextSession(next);
      setTimeToNextSession('Coming soon');
    } else {
      setNextSession(null);
      setTimeToNextSession(null);
    }
  }, [currentTime]);

  return {
    activeSessions,
    nextSession,
    timeToNextSession,
    currentTime,
    getSessionDescription,
    availableSessions: getAvailableSessions()
  };
}
