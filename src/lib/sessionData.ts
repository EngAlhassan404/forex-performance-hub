
import { SessionTime, TradingSession } from './types';

// Define session times in GMT
export const sessionTimes: SessionTime[] = [
  {
    name: 'TOKYO',
    displayName: 'Tokyo',
    startTimeGMT: '00:00',
    endTimeGMT: '09:00',
    description: 'Asian session - typically lower volatility'
  },
  {
    name: 'SYDNEY',
    displayName: 'Sydney',
    startTimeGMT: '22:00',
    endTimeGMT: '07:00',
    description: 'Australian session - opens the trading week'
  },
  {
    name: 'LONDON',
    displayName: 'London',
    startTimeGMT: '08:00',
    endTimeGMT: '17:00',
    description: 'European session - high liquidity and volatility'
  },
  {
    name: 'NEW_YORK',
    displayName: 'New York',
    startTimeGMT: '13:00',
    endTimeGMT: '22:00',
    description: 'US session - important economic releases'
  },
  {
    name: 'TOKYO_LONDON',
    displayName: 'Tokyo-London Overlap',
    startTimeGMT: '08:00',
    endTimeGMT: '09:00',
    description: 'Overlap between Tokyo and London sessions'
  },
  {
    name: 'LONDON_NEW_YORK',
    displayName: 'London-New York Overlap',
    startTimeGMT: '13:00',
    endTimeGMT: '17:00',
    description: 'Highest liquidity period with most trading opportunities'
  },
  {
    name: 'SYDNEY_TOKYO',
    displayName: 'Sydney-Tokyo Overlap',
    startTimeGMT: '00:00',
    endTimeGMT: '07:00',
    description: 'Asian-Pacific overlap period'
  },
  {
    name: 'NEW_YORK_SYDNEY',
    displayName: 'New York-Sydney Overlap',
    startTimeGMT: '22:00',
    endTimeGMT: '22:00',
    description: 'Late US session overlapping with Sydney open'
  }
];

// Helper function to determine which trading session is active at a given time
export const determineActiveSession = (date: Date): TradingSession[] => {
  // Convert to GMT time
  const gmtDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const hours = gmtDate.getUTCHours();
  const minutes = gmtDate.getUTCMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;
  
  const activeSessions: TradingSession[] = [];
  
  sessionTimes.forEach(session => {
    const [startHour, startMinute] = session.startTimeGMT.split(':').map(Number);
    const [endHour, endMinute] = session.endTimeGMT.split(':').map(Number);
    
    const sessionStartMinutes = startHour * 60 + startMinute;
    const sessionEndMinutes = endHour * 60 + endMinute;
    
    // Handle sessions that span across midnight
    if (sessionStartMinutes > sessionEndMinutes) {
      if (currentTimeInMinutes >= sessionStartMinutes || currentTimeInMinutes <= sessionEndMinutes) {
        activeSessions.push(session.name);
      }
    } else {
      if (currentTimeInMinutes >= sessionStartMinutes && currentTimeInMinutes <= sessionEndMinutes) {
        activeSessions.push(session.name);
      }
    }
  });
  
  // If no session is active, return the closest upcoming session
  if (activeSessions.length === 0) {
    return ['NEUTRAL' as TradingSession]; // Default when no session is active
  }
  
  // Check for overlapping sessions
  if (activeSessions.includes('LONDON') && activeSessions.includes('NEW_YORK')) {
    activeSessions.push('LONDON_NEW_YORK');
  }
  if (activeSessions.includes('TOKYO') && activeSessions.includes('LONDON')) {
    activeSessions.push('TOKYO_LONDON');
  }
  if (activeSessions.includes('SYDNEY') && activeSessions.includes('TOKYO')) {
    activeSessions.push('SYDNEY_TOKYO');
  }
  if (activeSessions.includes('NEW_YORK') && activeSessions.includes('SYDNEY')) {
    activeSessions.push('NEW_YORK_SYDNEY');
  }
  
  return activeSessions;
};

// Get a human-readable description of the current trading session
export const getSessionDescription = (session: TradingSession): string => {
  const sessionInfo = sessionTimes.find(s => s.name === session);
  return sessionInfo ? `${sessionInfo.displayName} (${sessionInfo.startTimeGMT}-${sessionInfo.endTimeGMT} GMT)` : 'Unknown Session';
};

// Get all available sessions for selection
export const getAvailableSessions = (): {value: TradingSession, label: string}[] => {
  return sessionTimes.map(session => ({
    value: session.name,
    label: `${session.displayName} (${session.startTimeGMT}-${session.endTimeGMT} GMT)`
  }));
};
