import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/UI/ErrorBoundary';
import NetworkStatus from './components/UI/NetworkStatus';
import { ToastContainer, useToast } from './components/UI/Toast';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <NetworkStatus />
            <Layout />
            <AppToastContainer />
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

// Toast容器组件
const AppToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  
  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
};

export default App;