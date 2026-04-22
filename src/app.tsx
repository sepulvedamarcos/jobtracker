import React, { useState } from 'react';
import { render } from 'ink';
import { Splash } from './presentation/tui/Splash.js';
import { MainLayout } from './presentation/tui/MainLayout.js';

const Root = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Splash onFinish={() => setLoading(false)} />;
  }

  return <MainLayout />;
};

render(<Root />);
