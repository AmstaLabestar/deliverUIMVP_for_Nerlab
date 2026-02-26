export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition = "top" | "bottom";

export interface ToastPayload {
  title: string;
  message?: string;
  type?: ToastType;
  position?: ToastPosition;
  durationMs?: number;
}

type ToastHandler = (payload: ToastPayload) => void;

let toastHandler: ToastHandler | null = null;

export const registerToastHandler = (handler: ToastHandler): (() => void) => {
  toastHandler = handler;

  return () => {
    if (toastHandler === handler) {
      toastHandler = null;
    }
  };
};

const show = (payload: ToastPayload): void => {
  toastHandler?.(payload);
};

export const toastService = {
  show,
  success: (title: string, message?: string, position: ToastPosition = "top"): void => {
    show({ title, message, type: "success", position });
  },
  error: (title: string, message?: string, position: ToastPosition = "top"): void => {
    show({ title, message, type: "error", position });
  },
  warning: (title: string, message?: string, position: ToastPosition = "top"): void => {
    show({ title, message, type: "warning", position });
  },
  info: (title: string, message?: string, position: ToastPosition = "top"): void => {
    show({ title, message, type: "info", position });
  },
};
