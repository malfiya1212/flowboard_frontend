import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: ModalProps) {
  
  // Close modal on pressing the 'Escape' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Max width configuration classes
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn font-sans">
      
      {/* Modal Dialog Box */}
      <div 
        className={`bg-white rounded-xl w-full ${maxWidthClass} overflow-hidden flex flex-col`}
        style={{ 
          boxShadow: 'none', 
          border: '1px solid oklch(90% 0.02 320)' // Slate Silk Precision Border
        }}
      >
        
        {/* Header Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-[oklch(96.7%_0.02_320)]">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight font-sans">{title}</h3>
            {subtitle && (
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Body / Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh] text-sm text-gray-700">
          {children}
        </div>

      </div>
    </div>
  );
}