import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './CustomToast.css';

export interface ToastConfig {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface CustomToastProps {
  toast: ToastConfig | null;
  onClose: () => void;
}

export const CustomToast: React.FC<CustomToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={24} className="toast-icon success" />;
      case 'error':
        return <AlertCircle size={24} className="toast-icon error" />;
      default:
        return <Info size={24} className="toast-icon info" />;
    }
  };

  return (
    <div className="custom-toast-overlay" onClick={onClose}>
      <div className={`custom-toast-card neu-card ${toast.type}`} onClick={e => e.stopPropagation()}>
        <div className="toast-header-row">
          <div className="toast-title-area">
            {getIcon()}
            <h4>{toast.title}</h4>
          </div>
          <button type="button" className="toast-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <p className="toast-message-text">{toast.message}</p>
        <div className="toast-action-row">
          <button type="button" className="toast-ok-btn neu-btn" onClick={onClose}>
            OK / Close
          </button>
        </div>
      </div>
    </div>
  );
};
