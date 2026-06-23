type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

type ToastSubscriber = (toasts: ToastMessage[]) => void;

let subscribers: ToastSubscriber[] = [];
let toasts: ToastMessage[] = [];

const notify = () => {
  subscribers.forEach((sub) => sub([...toasts]));
};

export const toast = {
  subscribe: (sub: ToastSubscriber) => {
    subscribers.push(sub);
    sub([...toasts]);
    return () => {
      subscribers = subscribers.filter((s) => s !== sub);
    };
  },
  show: (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { id, message, type }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, 3000);
  },
  success: (message: string) => toast.show(message, 'success'),
  error: (message: string) => toast.show(message, 'error'),
  info: (message: string) => toast.show(message, 'info'),
};
