/**
 * Types for the notification service
 */
export type NotificationType = 'success' | 'error' | 'info' | 'loading';

export interface NotificationOptions {
  autoClose?: number;
  withCloseButton?: boolean;
  onClick?: () => void;
  onClose?: () => void;
}

/**
 * Notification handler function signature
 */
export type NotificationHandler = (
  title: string,
  message: string,
  type: NotificationType,
  options?: NotificationOptions,
) => void;

/**
 * Notification service singleton
 */
class NotificationService {
  private static instance: NotificationService;
  private handler: NotificationHandler | null = null;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Register a notification handler
   */
  public registerHandler(handler: NotificationHandler): void {
    this.handler = handler;
  }

  /**
   * Unregister the notification handler
   */
  public unregisterHandler(): void {
    this.handler = null;
  }

  /**
   * Show a notification using the registered handler
   */
  public showNotification(
    title: string,
    message: string,
    type: NotificationType,
    options?: NotificationOptions,
  ): void {
    if (this.handler) {
      this.handler(title, message, type, options);
    } else {
      // Fallback for when no handler is registered (e.g., log to console)
      console.log(`Notification [${type}]: ${title} - ${message}`);
    }
  }
}

// Export the singleton instance
export const notificationService = NotificationService.getInstance();

// Export convenience methods
export const showNotification = (
  title: string,
  message: string,
  type: NotificationType,
  options?: NotificationOptions,
): void => {
  notificationService.showNotification(title, message, type, options);
};

export default notificationService;
