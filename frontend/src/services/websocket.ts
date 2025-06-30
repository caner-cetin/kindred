export type TaskEventType = 
  | 'TASK_CREATED'
  | 'TASK_UPDATED' 
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DELETED';

export interface TaskEvent {
  type: TaskEventType;
  taskId: number;
  task?: any;
  userId: number;
  timestamp: string;
}

export interface WebSocketMessage {
  type: TaskEventType | 'auth';
  data?: TaskEvent;
  status?: string;
  userId?: number;
}

export type TaskEventHandler = (event: TaskEvent) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<TaskEventType, TaskEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // Start with 1 second
  private isConnected = false;
  private authToken: string | null = null;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize event handler maps
    this.eventHandlers.set('TASK_CREATED', []);
    this.eventHandlers.set('TASK_UPDATED', []);
    this.eventHandlers.set('TASK_STATUS_CHANGED', []);
    this.eventHandlers.set('TASK_DELETED', []);
  }

  connect(token: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.authToken = token;
    const wsUrl = `ws://localhost:3000/ws`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Authenticate
        this.ws?.send(JSON.stringify({
          type: 'auth',
          token: this.authToken
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'auth') {
            if (message.status !== 'authenticated') {
              this.disconnect();
            }
            return;
          }

          // Handle task events
          if (message.data && this.eventHandlers.has(message.type as TaskEventType)) {
            const handlers = this.eventHandlers.get(message.type as TaskEventType) || [];
            handlers.forEach(handler => handler(message.data!));
          }
        } catch (error) {
          // Error parsing WebSocket message
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };

    } catch (error) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }

    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
    
    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.authToken) {
        this.connect(this.authToken);
      }
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.authToken = null;
  }

  addEventListener(eventType: TaskEventType, handler: TaskEventHandler) {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  removeEventListener(eventType: TaskEventType, handler: TaskEventHandler) {
    const handlers = this.eventHandlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(eventType, handlers);
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();