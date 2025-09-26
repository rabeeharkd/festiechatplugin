import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, AlertCircle } from 'lucide-react';
import dbManager from '../utils/database';

const ConnectionStatus = () => {
  const [status, setStatus] = useState({
    isConnected: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await dbManager.testConnection();
        setStatus({
          isConnected: result.success,
          isLoading: false,
          error: result.success ? null : result.error
        });
      } catch (error) {
        setStatus({
          isConnected: false,
          isLoading: false,
          error: error.message
        });
      }
    };

    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (status.isLoading) return 'bg-yellow-100 text-yellow-800 border-yellow-400';
    if (status.isConnected) return 'bg-green-100 text-green-800 border-green-400';
    return 'bg-red-100 text-red-800 border-red-400';
  };

  const getStatusIcon = () => {
    if (status.isLoading) return <Database className="w-3 h-3 animate-spin" />;
    if (status.isConnected) return <Wifi className="w-3 h-3" />;
    return <WifiOff className="w-3 h-3" />;
  };

  const getStatusText = () => {
    if (status.isLoading) return 'Connecting...';
    if (status.isConnected) return 'Database Connected';
    return 'Connection Failed';
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {status.error && (
        <div className="ml-1 group relative">
          <AlertCircle className="w-3 h-3" />
          <div className="absolute right-0 top-6 bg-black text-white p-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {status.error}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;