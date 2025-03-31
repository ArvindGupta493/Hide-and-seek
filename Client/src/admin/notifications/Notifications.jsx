import { useState, useEffect } from "react";
import axios from "axios";
import style from "./notification.module.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.succeeded) {
        setNotifications(res.data.ResponseData || []);
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className={style.notificationContainer}>
      <h2 className={style.heading}>Notifications</h2>
      <button onClick={fetchNotifications} className={style.refreshButton}>
        Refresh Notifications
      </button>
      <div className={style.notificationsList}>
        {notifications.length === 0 ? (
          <p className={style.noNotifications}>No notifications available.</p>
        ) : (
          notifications.map((note, index) => (
            <div
              key={index}
              className={style.notificationItem}
              onClick={() => toggleExpand(index)}
            >
              <p className={style.notificationHeader}>
                {/* <span className={style.userId}>User ID:</span> {note.userId || "N/A"} -{" "} */}
                <span className={style.username}>UserName:</span> {note.username || "N/A"} -{" "}
                <span className={style.shortMessage}>
                  {note.message.length > 30
                    ? note.message.substring(0, 30) + "..."
                    : note.message}
                </span>
              </p>
              {expandedIndex === index && (
                <div className={style.expandedMessage}>
                  <p><strong>User ID:</strong> {note.userId || "N/A"}</p>
                  <p><strong>Username:</strong> {note.username}</p>
                  <p><strong>Email:</strong> {note.email}</p>
                  <p><strong>image:</strong> {note.image || "N/A"}</p>
                  <p><strong>Message:</strong> {note.message}</p>
                  <p><strong>Type:</strong> {note.type || "General"}</p>
                  <p><strong>Status:</strong> {note.status || "Unread"}</p>
                  <p><strong>Created At:</strong> {new Date(note.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
