import { useEffect } from "react";
import "./Notification.css";

export const Notification = ({ message, type = "success", onClose }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    if (type === "success") return "✔";
    if (type === "error") return "✖";
    if (type === "info") return "ℹ";
    return "";
  };

  return (
    <div className={`notification ${type}`}>
      <span>{getIcon()}</span>
      <span>{message}</span>
    </div>
  );
};