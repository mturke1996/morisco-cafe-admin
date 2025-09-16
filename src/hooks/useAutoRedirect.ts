import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseAutoRedirectOptions {
  timeoutMinutes?: number;
  redirectTo?: string;
  enabled?: boolean;
}

export const useAutoRedirect = ({
  timeoutMinutes = 30,
  redirectTo = '/',
  enabled = true
}: UseAutoRedirectOptions = {}) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        const timeoutMs = timeoutMinutes * 60 * 1000;

        if (timeSinceLastActivity >= timeoutMs) {
          navigate(redirectTo);
        } else {
          resetTimeout();
        }
      }, 1000); // Check every second
    }
  };

  const updateActivity = () => {
    lastActivityRef.current = Date.now();
    resetTimeout();
  };

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Start the timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, timeoutMinutes, redirectTo]);

  return { updateActivity };
};
