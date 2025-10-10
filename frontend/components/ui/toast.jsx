/**
 * Toast Notification System
 * Provides toast notifications with different types and animations
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const noop = () => {};

const DEFAULT_CONTEXT = {
  toast: {
    success: noop,
    error: noop,
    warning: noop,
    info: noop,
    loading: noop,
    custom: noop,
  },
  removeToast: noop,
  removeAllToasts: noop,
};

const ToastContext = createContext(DEFAULT_CONTEXT);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutRefs = useRef(new Map());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    if (!isClient) {
      return;
    }

    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
  }, [isClient]);

  const removeAllToasts = useCallback(() => {
    if (isClient) {
      timeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    }

    setToasts([]);
  }, [isClient]);

  const addToast = useCallback(
    ({ title, description, type = "info", duration = 5000, action = null }) => {
      if (!isClient) {
        return null;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const nextToast = {
        id,
        title,
        description,
        type,
        duration,
        action,
        createdAt: Date.now(),
      };

      setToasts((prev) => [...prev, nextToast]);

      if (duration > 0) {
        const timeoutId = window.setTimeout(() => {
          removeToast(id);
        }, duration);
        timeoutRefs.current.set(id, timeoutId);
      }

      return id;
    },
    [isClient, removeToast]
  );

  useEffect(() => {
    if (!isClient) {
      return undefined;
    }

    return () => {
      timeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, [isClient]);

  const toastApi = useMemo(
    () => ({
      success: (title, description, options = {}) =>
        addToast({ title, description, type: "success", ...options }),
      error: (title, description, options = {}) =>
        addToast({ title, description, type: "error", ...options }),
      warning: (title, description, options = {}) =>
        addToast({ title, description, type: "warning", ...options }),
      info: (title, description, options = {}) =>
        addToast({ title, description, type: "info", ...options }),
      loading: (title, description, options = {}) =>
        addToast({ title, description, type: "loading", duration: 0, ...options }),
      custom: (title, description, options = {}) =>
        addToast({ title, description, ...options }),
    }),
    [addToast]
  );

  const contextValue = !isClient
    ? DEFAULT_CONTEXT
    : {
        toast: toastApi,
        removeToast,
        removeAllToasts,
      };

  if (!isClient) {
    return (
      <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>
    );
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
      titleColor: "text-green-800",
      descriptionColor: "text-green-700",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      titleColor: "text-red-800",
      descriptionColor: "text-red-700",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-500",
      titleColor: "text-yellow-800",
      descriptionColor: "text-yellow-700",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
      titleColor: "text-blue-800",
      descriptionColor: "text-blue-700",
    },
    loading: {
      icon: () => (
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      ),
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
      titleColor: "text-blue-800",
      descriptionColor: "text-blue-700",
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"}
      `}
    >
      <div
        className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-lg shadow-lg p-4 max-w-sm w-full
        backdrop-blur-sm
      `}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            {typeof Icon === "function" ? <Icon /> : <Icon className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            {toast.title && (
              <div className={`font-medium ${config.titleColor} mb-1`}>
                {toast.title}
              </div>
            )}
            {toast.description && (
              <div className={`text-sm ${config.descriptionColor}`}>
                {toast.description}
              </div>
            )}
            {toast.action && <div className="mt-2">{toast.action}</div>}
          </div>

          <button
            onClick={handleRemove}
            className={`
              flex-shrink-0 p-1 rounded-md transition-colors
              ${config.titleColor} hover:bg-black hover:bg-opacity-10
            `}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar for timed toasts */}
        {toast.duration > 0 && (
          <div className="mt-2 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
            <div
              className="h-full bg-current opacity-30 rounded-full animate-toast-progress"
              style={{
                animationDuration: `${toast.duration}ms`,
                animationTimingFunction: "linear",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for easy toast usage
export function useToastActions() {
  const { toast } = useToast();

  return {
    showSuccess: (message, description) => toast.success(message, description),
    showError: (message, description) => toast.error(message, description),
    showWarning: (message, description) => toast.warning(message, description),
    showInfo: (message, description) => toast.info(message, description),
    showLoading: (message, description) => toast.loading(message, description),
  };
}
