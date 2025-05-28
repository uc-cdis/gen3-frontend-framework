// This file would be in your frontend package
import React, { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import {
  notificationService,
  NotificationType,
  NotificationOptions,
} from '@gen3/core';
import {
  MdCheck as CheckIcon,
  MdOutlineClose as CloseIcon,
  MdInfoOutline as IconInfoCircle,
  MdDownload as DownloadIcon,
} from 'react-icons/md';
import { BiLoaderAlt as LoaderIcon } from 'react-icons/bi';

interface NotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Component that sets up the connection between the core notification service
 * and the Mantine UI notifications
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    // Define the notification handler that uses Mantine
    const notificationHandler = (
      id: string,
      title: string,
      message: string,
      type: NotificationType,
      options?: NotificationOptions,
    ) => {
      const iconMap = {
        success: <CheckIcon size={18} />,
        error: <CloseIcon size={18} />,
        info: <IconInfoCircle size={18} />,
        loading: <LoaderIcon size={18} className="animate-spin" />,
        download: <DownloadIcon size={18} />,
      };

      const colorMap = {
        success: 'green',
        error: 'red',
        info: 'blue',
        loading: 'gray',
        download: 'teal',
      };

      notifications.show({
        id,
        title,
        message,
        icon: iconMap[type],
        color: colorMap[type],
        autoClose: options?.autoClose || 4000,
        withCloseButton: options?.withCloseButton !== false,
        onClose: options?.onClose,
        onClick: options?.onClick,
      });
    };

    // Register the handler with the service
    notificationService.registerHandler(notificationHandler);

    return () => {
      notificationService.unregisterHandler();
    };
  }, []);

  // The provider doesn't render anything itself
  return <>{children}</>;
};

export default NotificationProvider;
