import { useEffect } from "react";

export default function BootstrapAlert({
  alert,
  onClose,
  dismissAfter = 5000,
}) {
  useEffect(() => {
    if (!alert) return undefined;

    const timer = window.setTimeout(onClose, dismissAfter);
    return () => window.clearTimeout(timer);
  }, [alert, dismissAfter, onClose]);

  if (!alert) return null;

  return (
    <div
      className={`alert alert-${alert.type || "info"} alert-dismissible fade show position-fixed start-50 translate-middle-x shadow-lg`}
      role="alert"
      style={{ top: "86px", zIndex: 1060, maxWidth: "560px", width: "calc(100% - 32px)" }}
    >
      {alert.message}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={onClose}
      ></button>
    </div>
  );
}
