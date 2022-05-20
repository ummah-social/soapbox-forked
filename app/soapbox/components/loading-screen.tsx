import React from 'react';

import LandingGradient from 'soapbox/components/landing-gradient';
import { Spinner } from 'soapbox/components/ui';

/** Fullscreen loading indicator. */
const LoadingScreen: React.FC = () => {
  return (
    <div className='fixed h-screen w-screen bg-white dark:bg-slate-900'>
      <LandingGradient />

      <div className='fixed h-screen w-screen flex items-center justify-center z-10'>
        <Spinner size={40} withText={false} />
      </div>
    </div>
  );
};

export default LoadingScreen;
