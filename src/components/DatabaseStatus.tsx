// MongoDB Connection Status Component
// This component shows the current MongoDB connection status

import { useState, useEffect } from 'react';
import { mongodb } from '../lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function DatabaseStatus() {
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnection = async () => {
    setLoading(true);
    try {
      const info = mongodb.getConnectionInfo();
      setConnectionInfo(info);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to get connection info:', error);
      setConnectionInfo({
        connected: false,
        error: error,
        status: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Check connection status every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !connectionInfo) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Checking connection...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={connectionInfo?.connected ? "default" : "destructive"} className="flex items-center gap-1">
            {connectionInfo?.connected ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
        
        {connectionInfo?.database && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Database:</span>
            <span className="text-sm text-gray-600">{connectionInfo.database}</span>
          </div>
        )}
        
        {connectionInfo?.mode && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Mode:</span>
            <span className="text-sm text-gray-600">{connectionInfo.mode}</span>
          </div>
        )}
        
        {connectionInfo?.connectionString && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection:</span>
            <span className="text-xs text-gray-500 font-mono break-all">{connectionInfo.connectionString}</span>
          </div>
        )}
        
        {connectionInfo?.collections && (
          <div>
            <span className="text-sm font-medium">Collections:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {connectionInfo.collections.map((collection: string) => (
                <Badge key={collection} variant="outline" className="text-xs">
                  {collection}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last checked:</span>
          <span>{lastChecked.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
