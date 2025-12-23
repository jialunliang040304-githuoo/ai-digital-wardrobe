import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden shadow-xl`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {(title || showCloseButton) && (
          <header className="flex items-center justify-between p-4 border-b">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full min-h-touch min-w-touch focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="关闭对话框"
                type="button"
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </header>
        )}
        
        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]" role="main">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;