import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ToastStack } from "./Toast.jsx";
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]),
    sequence = useRef(0);
  const showToast = useCallback((message, type = "success") => {
    const id = ++sequence.current;
    setToasts((previous) => [...previous, { id, message, type }].slice(-3));
    return id;
  }, []);
  const hideToast = useCallback(
    (id) => setToasts((previous) => previous.filter((t) => t.id !== id)),
    [],
  );
  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastStack toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
