import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface UseSessionTimeoutProps {
  timeoutHours?: number;
  redirectTo?: string;
  enabled?: boolean;
}

export const useSessionTimeout = ({
  timeoutHours = 24,
  redirectTo = '/auth',
  enabled = true,
}: UseSessionTimeoutProps) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (enabled) {
      const timeoutMs = timeoutHours * 60 * 60 * 1000;
      
      timeoutRef.current = setTimeout(async () => {
        // Sign out user after timeout
        await supabase.auth.signOut();
        navigate(redirectTo);
      }, timeoutMs);
    }
  }, [timeoutHours, redirectTo, navigate, enabled]);

  const handleActivity = useCallback(() => {
    if (enabled) {
      resetTimer();
    }
  }, [enabled, resetTimer]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const events = ['mousemove', 'keydown', 'touchstart', 'click', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer
    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity, resetTimer, enabled]);

  // Check session on page load
  useEffect(() => {
    const checkSession = async () => {
      if (!enabled) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          
          if (now >= expiresAt) {
            await supabase.auth.signOut();
            navigate(redirectTo);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();
  }, [enabled, navigate, redirectTo]);
};
