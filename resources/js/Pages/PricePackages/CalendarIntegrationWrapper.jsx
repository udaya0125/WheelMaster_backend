import React, { useEffect, useState } from 'react';
import CalendarIntegration from './CalendarIntegration';
import CalendarIntegrationMobile from './CalendarIntegrationMobile';

const CalendarIntegrationWrapper = ({ price }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768); // 768px is typical mobile breakpoint
      };

      // Initial check
      checkMobile();

      // Add resize listener
      window.addEventListener('resize', checkMobile);

      // Cleanup
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Render the appropriate component based on screen size
  return isMobile ? (
    <CalendarIntegrationMobile price={price} />
  ) : (
    <CalendarIntegration price={price} />
  );
};

export default CalendarIntegrationWrapper;