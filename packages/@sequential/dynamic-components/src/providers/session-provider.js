import React, { createContext, useState, useCallback, useEffect } from 'react';

export const SessionContext = createContext();

export class SessionManager {
  constructor() {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
    this.userId = null;
    this.metadata = {};
    this.events = [];
  }

  setUserId(userId) {
    this.userId = userId;
  }

  setMetadata(key, value) {
    this.metadata[key] = value;
  }

  trackEvent(eventName, data = {}) {
    this.events.push({
      name: eventName,
      timestamp: Date.now(),
      data
    });
  }

  getSession() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
      metadata: this.metadata,
      eventCount: this.events.length
    };
  }
}

export function SessionProvider({ children, onSessionChange }) {
  const [session, setSession] = useState(() => new SessionManager());
  const [isTracking, setIsTracking] = useState(true);

  const trackEvent = useCallback((eventName, data) => {
    session.trackEvent(eventName, data);
    if (onSessionChange) {
      onSessionChange(session.getSession());
    }
  }, [session]);

  const setUserId = useCallback((userId) => {
    session.setUserId(userId);
    if (onSessionChange) {
      onSessionChange(session.getSession());
    }
  }, [session]);

  useEffect(() => {
    trackEvent('session_started', {
      timestamp: new Date().toISOString()
    });
  }, []);

  const value = {
    session,
    sessionId: session.sessionId,
    trackEvent,
    setUserId,
    isTracking,
    setIsTracking,
    getSession: () => session.getSession()
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}

export function useTrack() {
  const { trackEvent } = useSession();
  return trackEvent;
}
