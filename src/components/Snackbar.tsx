import { useEffect, useState } from 'react';
import { X, Undo2 } from 'lucide-react';

export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

interface Props {
  message: string;
  duration?: number;
  action?: SnackbarAction;
  onClose: () => void;
}

export default function Snackbar({ message, duration = 4000, action, onClose }: Props) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const handleAction = () => {
    if (action) {
      action.onClick();
    }
    handleClose();
  };

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0 animate-slide-up'
      }`}
    >
      <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-700 dark:bg-gray-600">
          <div
            className="h-full bg-blue-500 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 flex items-center gap-3">
          <p className="flex-1 text-white text-sm font-medium">{message}</p>
          
          {action && (
            <button
              onClick={handleAction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
            >
              <Undo2 size={14} />
              {action.label}
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
