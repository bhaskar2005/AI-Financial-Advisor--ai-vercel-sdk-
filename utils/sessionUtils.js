// utils/sessionUtils.js - Optimized session utilities

// Memoized time formatting to prevent recalculation
export const formatDisplayTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  if (diffInSeconds < 86400 * 7) {
    return date.toLocaleDateString([], {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Optimized session time status checker
export const checkSessionTimeStatus = (session) => {
  if (!session?.is_scheduled || !session?.scheduled_start_time) {
    return session?.status || "unknown";
  }

  const now = new Date();
  const scheduledTime = new Date(session.scheduled_start_time);
  const scheduledEndTime = new Date(session.scheduled_end_time);

  // If session time has arrived and it's accepted/upcoming, change to active
  if (
    (session.status === "accepted" || session.status === "upcoming") &&
    now >= scheduledTime &&
    now < scheduledEndTime
  ) {
    return "active";
  }

  // If session time has passed completely, mark as completed
  if (
    (session.status === "accepted" ||
      session.status === "upcoming" ||
      session.status === "active") &&
    now >= scheduledEndTime
  ) {
    return "completed";
  }

  return session.status;
};

// Memoized status styling helper
export const getStatusStyling = (status) => {
  const styles = {
    completed: "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
    expired: "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
    rejected: "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
    cancelled: "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
    cancelled_by_expert:
      "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
    cancelled_by_user:
      "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
    accepted:
      "bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-300",
    active:
      "bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-300",
    upcoming:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/70 dark:text-yellow-300",
    reschedule_proposed:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/70 dark:text-purple-300",
    default: "bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-300",
  };

  return styles[status] || styles.default;
};

// Memoized status text helper
export const getStatusText = (session) => {
  // For scheduled sessions that are accepted but haven't started yet, show "Upcoming"
  if (
    session.status === "accepted" &&
    session.is_scheduled &&
    session.scheduled_start_time
  ) {
    const now = new Date();
    const scheduledTime = new Date(session.scheduled_start_time);
    if (scheduledTime > now) {
      return "Upcoming";
    }
  }

  // Other specific status displays
  if (session.status === "pending" && session.is_scheduled) {
    return "Pending Review";
  }
  if (session.status === "reschedule_proposed") {
    return "Reschedule Proposed";
  }

  // Default status display
  return (
    session.status.charAt(0).toUpperCase() +
    session.status.slice(1).replace("_", " ")
  );
};
