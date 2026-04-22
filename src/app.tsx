import React, { useState } from 'react';
import { render } from 'ink';
import { Splash } from './components/Splash.js';
import { MainLayout } from './components/MainLayout.js';

const Root = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Splash onFinish={() => setLoading(false)} />;
  }

  return <MainLayout />;
};

render(<Root />);
