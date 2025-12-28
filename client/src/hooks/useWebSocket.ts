import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface UseWebSocketOptions {
  url?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enabled?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NODE_ENV === 'production' 
      ? 'wss://yourdomain.com/ws' 
      : 'ws://localhost:3001/ws',
    onConnect,
    onDisconnect,
    onError,
    onMessage,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    enabled = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const connect = () => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'order_update':
              // Invalidate and refetch order queries
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              queryClient.invalidateQueries({ queryKey: ['marketplace', 'offers'] });
              break;
            
            case 'offer_submitted':
              // Invalidate offers queries
              queryClient.invalidateQueries({ queryKey: ['marketplace', 'offers'] });
              break;
            
            case 'offer_accepted':
              // Invalidate relevant queries
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              queryClient.invalidateQueries({ queryKey: ['marketplace', 'offers'] });
              break;
            
            case 'driver_status':
              // Update driver status in relevant queries
              queryClient.setQueriesData({ queryKey: ['driverNetwork'] }, (old: any) => {
                if (!old) return old;
                return {
                  ...old,
                  data: old.data?.map((driver: any) => 
                    driver.id === message.data.driverId 
                      ? { ...driver, status: message.data.status }
                      : driver
                  )
                };
              });
              break;
            
            case 'notification':
              // Show toast notification
              if (typeof window !== 'undefined' && window.showToast) {
                window.showToast(message.data);
              }
              break;
            
            default:
              console.log('📡 WebSocket message:', message);
          }
          
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        onError?.(error);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onDisconnect?.();
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...message,
        timestamp: Date.now(),
      };
      wsRef.current.send(JSON.stringify(fullMessage));
      return true;
    }
    return false;
  };

  // Connect on mount if enabled
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts,
  };
}

// Hook for specific marketplace real-time features
export function useMarketplaceWebSocket(orderId?: number) {
  const websocket = useWebSocket({
    enabled: !!orderId,
  });

  const subscribeToOrder = () => {
    if (orderId && websocket.isConnected) {
      websocket.sendMessage({
        type: 'subscribe_order',
        data: { orderId },
      });
    }
  };

  const unsubscribeFromOrder = () => {
    if (orderId && websocket.isConnected) {
      websocket.sendMessage({
        type: 'unsubscribe_order',
        data: { orderId },
      });
    }
  };

  // Auto-subscribe when connected and orderId is available
  useEffect(() => {
    if (websocket.isConnected && orderId) {
      subscribeToOrder();
    }

    return () => {
      unsubscribeFromOrder();
    };
  }, [websocket.isConnected, orderId]);

  return {
    ...websocket,
    subscribeToOrder,
    unsubscribeFromOrder,
  };
}

// Hook for driver-specific real-time updates
export function useDriverWebSocket(driverId?: number) {
  const websocket = useWebSocket({
    enabled: !!driverId,
  });

  const subscribeToDriver = () => {
    if (driverId && websocket.isConnected) {
      websocket.sendMessage({
        type: 'subscribe_driver',
        data: { driverId },
      });
    }
  };

  const unsubscribeFromDriver = () => {
    if (driverId && websocket.isConnected) {
      websocket.sendMessage({
        type: 'unsubscribe_driver',
        data: { driverId },
      });
    }
  };

  const updateDriverLocation = (lat: number, lng: number) => {
    if (websocket.isConnected) {
      websocket.sendMessage({
        type: 'driver_location',
        data: { driverId, lat, lng },
      });
    }
  };

  const updateDriverStatus = (status: 'available' | 'busy' | 'offline') => {
    if (websocket.isConnected) {
      websocket.sendMessage({
        type: 'driver_status',
        data: { driverId, status },
      });
    }
  };

  // Auto-subscribe when connected and driverId is available
  useEffect(() => {
    if (websocket.isConnected && driverId) {
      subscribeToDriver();
    }

    return () => {
      unsubscribeFromDriver();
    };
  }, [websocket.isConnected, driverId]);

  return {
    ...websocket,
    subscribeToDriver,
    unsubscribeFromDriver,
    updateDriverLocation,
    updateDriverStatus,
  };
}

// Global toast notification function
declare global {
  interface Window {
    showToast?: (data: {
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
      duration?: number;
    }) => void;
  }
}
