import React, { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#182326' }}>
          <h1 style={{ fontSize: 24 }}>Something went wrong</h1>
          <p style={{ color: '#666', marginTop: 8 }}>Please refresh the page. If the problem continues, contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function IntroSplash({ onComplete }: { onComplete: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 1800);
    const completeTimer = window.setTimeout(onComplete, 2400);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`intro-splash${exiting ? ' intro-splash-exiting' : ''}`} aria-hidden="true">
      <img src="/brand/Shaddailogo.png" alt="Tours Shaddai" />
    </div>
  );
}

function Root() {
  const [showSplash, setShowSplash] = useState(true);
  const finishSplash = () => setShowSplash(false);

  return (
    <>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      {showSplash && <IntroSplash onComplete={finishSplash} />}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
