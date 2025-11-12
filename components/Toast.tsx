
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

interface ToastProps extends ToastMessage {
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

  return (
    <div
      className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg text-white transition-all duration-300 ${bgColor} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      role="alert"
    >
      <Icon className="w-6 h-6 mr-3" />
      <span>{message}</span>
    </div>
  );
};
