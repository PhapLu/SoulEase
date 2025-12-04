import React, { useState, useMemo } from "react";
import NotificationPopup from "../../../components/Notifications/NotificationsPopup.jsx";
import "./Notifications.css";
import WorkspaceTopBar from "../../../components/Workspace/WorkspaceTopBar";

// ===== MOCK =====
const systemNotifications = [
  {
    id: "sys-1",
    type: "success",
    category: "Clients",
    title: "New client added",
    message:
      "You have successfully created a new client in Folder 1. You can now start sharing documents and messages with this client.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "sys-2",
    type: "warning",
    category: "Billing",
    title: "Plan about to expire",
    message:
      "Your SoulEase Plus plan will expire in 3 days. Renew now to keep encrypted storage and priority support.",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 minutes ago
  },
  {
    id: "sys-3",
    type: "error",
    category: "Billing",
    title: "Payment failed",
    message:
      "We could not process your last payment. Please update your billing information to avoid interruption.",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
];

// ===== MOCK =====
const mockMessages = [
  {
    id: "1",
    senderId: "p1",
    senderName: "Anna Nguyen",
    content:
      "Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?, Hi doctor, I feel a bit anxious today. Can we reschedule our session?",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes
    isRead: false,
  },
  {
    id: "2",
    senderId: "p2",
    senderName: "Brian Tran",
    content: "Thank you for today’s session, it really helped me.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    isRead: true,
  },
  {
    id: "3",
    senderId: "p3",
    senderName: "Chloe Le",
    content: "I am having trouble sleeping again, can you suggest something?",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours
    isRead: false,
  },
  {
    id: "4",
    senderId: "p4",
    senderName: "David Pham",
    content:
      "I just shared a new document in my folder. Please take a look when you can.",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours
    isRead: false,
  },
];

// ===== Filter messages that have not been read for 3 hours =====
function getUnreadMessagesLast3Hours(messages = []) {
  const now = Date.now();
  const threeHoursMs = 3 * 60 * 60 * 1000;

  return messages.filter((m) => {
    const created = new Date(m.createdAt).getTime();
    const within3h = now - created <= threeHoursMs;
    return !m.isRead && within3h;
  });
}

export default function Notifications() {
  // API
  const [messages] = useState(mockMessages);
  const [system] = useState(systemNotifications);

  // Message notifications (info)
  const unreadLast3h = useMemo(
    () => getUnreadMessagesLast3Hours(messages),
    [messages]
  );

  const messageNotifications = useMemo(
    () =>
      unreadLast3h.map((m) => ({
        id: `msg-${m.id}`,
        type: "info",
        category: "Patient message",
        title: `New message from ${m.senderName}`,
        message: m.content,
        createdAt: m.createdAt,
        from: m.senderName,
      })),
    [unreadLast3h]
  );

  // Merge all notifications & sort by time (newest first)
  const allNotifications = useMemo(() => {
    const sys = system.map((n) => ({
      ...n,
      from: undefined,
    }));

    return [...messageNotifications, ...sys].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [messageNotifications, system]);

  const [selected, setSelected] = useState(null);

  return (
    <div className="notif-page">
      <WorkspaceTopBar />
      <section className="notif-card">
        <div className="notif-page-header">
          <h2>Notifications</h2>
          <p className="notif-page-subtitle">
            System updates & unread patient messages in the last 3 hours.
          </p>
        </div>

        <div className="notif-list">
          {allNotifications.map((n) => (
            <button
              key={n.id}
              type="button"
              className="notif-item"
              onClick={() => setSelected(n)}
            >
              <div
                className={`notif-dot notif-dot-${
                  n.type === "success"
                    ? "success"
                    : n.type === "error"
                    ? "error"
                    : n.type === "warning"
                    ? "warning"
                    : "info"
                }`}
              />

              <div className="notif-item-main">
                <div className="notif-item-title-row">
                  <span className="notif-item-title">{n.title}</span>
                  {n.category && (
                    <span className="notif-item-category-chip">
                      {n.category}
                    </span>
                  )}
                </div>

                <div className="notif-item-message">
                  {n.message.length > 90
                    ? `${n.message.slice(0, 90)}…`
                    : n.message}
                </div>
              </div>

              <span className="notif-item-view">View</span>
            </button>
          ))}

          {allNotifications.length === 0 && (
            <div className="notif-empty">No notifications at the moment 🎉</div>
          )}
        </div>

        {/* Detailed Alert Popup */}
        <NotificationPopup
          open={!!selected}
          title={selected?.title}
          message={selected?.message}
          type={selected?.type || "info"}
          category={selected?.category}
          from={selected?.from}
          createdAt={selected?.createdAt}
          onClose={() => setSelected(null)}
          autoCloseMs={6000}
        />
      </section>
    </div>
  );
}
