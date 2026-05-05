import React from 'react';
import { useNotification } from '../context/NotificationContext';
import './TopNotification.css';

function TopNotification() {
  const { notification } = useNotification();

  if (!notification) return null;

  return (
    <div className={`top-notification ${notification.type}`}>
      {notification.message}
    </div>
  );
}

export default TopNotification;
