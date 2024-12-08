// components/Notification.tsx
// components/Notification.tsx
import React from "react";
import styles from "./components.module.css";

type NotificationProps = {
  show: boolean;
  message: string;
};

const Notification: React.FC<NotificationProps> = ({ show, message }) => {
  return (
    <div className={`${styles.notification} ${show ? styles.show : ""}`}>
      {message}
    </div>
  );
};

export default Notification;
