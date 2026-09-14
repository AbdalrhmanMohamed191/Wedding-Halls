import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaCalendarAlt,
  FaBuilding,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../api/axios";
import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [readingId, setReadingId] =
    useState(null);

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      pages: 1,
    });

  const [filter, setFilter] =
    useState("all");

  /*
  |--------------------------------------------------------------------------
  | Notification Icon
  |--------------------------------------------------------------------------
  */

  const getNotificationIcon = useCallback(
    (type) => {
      switch (type) {
        case "booking_created":
          return <FaCalendarAlt />;

        case "booking_confirmed":
          return <FaCheck />;

        case "booking_rejected":
          return <FaTimes />;

        case "booking_cancelled":
          return <FaExclamationTriangle />;

        case "booking_completed":
          return <FaCheckDouble />;

        case "hall_approved":
          return <FaBuilding />;

        case "hall_rejected":
          return <FaTimes />;

        case "hall_suspended":
          return <FaExclamationTriangle />;

        case "general":
        default:
          return <FaInfoCircle />;
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Notification Color
  |--------------------------------------------------------------------------
  */

  const getNotificationClass =
    useCallback((type) => {
      switch (type) {
        case "booking_created":
          return "notification-icon-booking";

        case "booking_confirmed":
          return "notification-icon-success";

        case "booking_rejected":
        case "booking_cancelled":
        case "hall_rejected":
        case "hall_suspended":
          return "notification-icon-danger";

        case "booking_completed":
        case "hall_approved":
          return "notification-icon-success";

        case "general":
        default:
          return "notification-icon-info";
      }
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Relative Time
  |--------------------------------------------------------------------------
  */

  const formatRelativeTime = useCallback(
    (dateValue) => {
      if (!dateValue) {
        return "";
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      const now = new Date();

      const difference =
        now.getTime() - date.getTime();

      const seconds = Math.floor(
        difference / 1000
      );

      const minutes = Math.floor(
        seconds / 60
      );

      const hours = Math.floor(
        minutes / 60
      );

      const days = Math.floor(
        hours / 24
      );

      if (seconds < 60) {
        return "Just now";
      }

      if (minutes < 60) {
        return `${minutes} ${
          minutes === 1
            ? "minute"
            : "minutes"
        } ago`;
      }

      if (hours < 24) {
        return `${hours} ${
          hours === 1
            ? "hour"
            : "hours"
        } ago`;
      }

      if (days < 7) {
        return `${days} ${
          days === 1
            ? "day"
            : "days"
        } ago`;
      }

      return date.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Format Event Date
  |--------------------------------------------------------------------------
  */

  const formatEventDate = useCallback(
    (dateValue) => {
      if (!dateValue) {
        return null;
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Fetch Notifications
  |--------------------------------------------------------------------------
  */

  const fetchNotifications =
    useCallback(
      async (requestedPage = 1) => {
        try {
          setLoading(true);

          const response =
            await api.get(
              "/notifications",
              {
                params: {
                  page: requestedPage,
                  limit: 20,
                },
              }
            );

          const data =
            response?.data?.data;

          setNotifications(
            data?.notifications || []
          );

          setPagination(
            data?.pagination || {
              page: requestedPage,
              limit: 20,
              total: 0,
              pages: 1,
            }
          );

          setUnreadCount(
            data?.unreadCount || 0
          );

          setPage(
            data?.pagination?.page ||
              requestedPage
          );
        } catch (error) {
          console.error(
            "Fetch Notifications Error:",
            error
          );

          toast.error(
            error?.response?.data
              ?.message ||
              "Failed to load notifications"
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Initial Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Filter
  |--------------------------------------------------------------------------
  */

  const filteredNotifications =
    useMemo(() => {
      if (filter === "unread") {
        return notifications.filter(
          (notification) =>
            !notification.isRead
        );
      }

      if (filter === "read") {
        return notifications.filter(
          (notification) =>
            notification.isRead
        );
      }

      return notifications;
    }, [notifications, filter]);

  /*
  |--------------------------------------------------------------------------
  | Notify Navbar
  |--------------------------------------------------------------------------
  */

  const notifyNavbar =
    useCallback(() => {
      window.dispatchEvent(
        new Event(
          "notifications:updated"
        )
      );
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Mark One Notification As Read
  |--------------------------------------------------------------------------
  */

  const handleMarkAsRead =
    async (notification) => {
      if (
        !notification ||
        notification.isRead
      ) {
        return;
      }

      try {
        setReadingId(
          notification._id
        );

        await api.patch(
          `/notifications/${notification._id}/read`
        );

        setNotifications((prev) =>
          prev.map((item) =>
            item._id ===
            notification._id
              ? {
                  ...item,
                  isRead: true,
                  readAt:
                    new Date().toISOString(),
                }
              : item
          )
        );

        setUnreadCount((prev) =>
          Math.max(prev - 1, 0)
        );

        /*
         * Tell Navbar to refresh
         * unread count.
         */
        notifyNavbar();
      } catch (error) {
        console.error(
          "Mark Notification Read Error:",
          error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Failed to mark notification as read"
        );
      } finally {
        setReadingId(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Mark All Notifications As Read
  |--------------------------------------------------------------------------
  */

  const handleMarkAllAsRead =
    async () => {
      if (unreadCount === 0) {
        return;
      }

      try {
        setActionLoading(true);

        await api.patch(
          "/notifications/read-all"
        );

        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
            readAt:
              notification.readAt ||
              new Date().toISOString(),
          }))
        );

        /*
         * Update local page count.
         */
        setUnreadCount(0);

        /*
         * IMPORTANT:
         * Tell Navbar that notifications
         * have changed.
         */
        notifyNavbar();

        toast.success(
          "All notifications marked as read"
        );
      } catch (error) {
        console.error(
          "Mark All Notifications Error:",
          error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Failed to update notifications"
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Delete Notification
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async (notificationId) => {
      if (!notificationId) {
        return;
      }

      try {
        setDeletingId(
          notificationId
        );

        const notification =
          notifications.find(
            (item) =>
              item._id ===
              notificationId
          );

        await api.delete(
          `/notifications/${notificationId}`
        );

        setNotifications((prev) =>
          prev.filter(
            (item) =>
              item._id !==
              notificationId
          )
        );

        /*
         * If deleted notification
         * was unread, update count.
         */
        if (
          notification &&
          !notification.isRead
        ) {
          setUnreadCount((prev) =>
            Math.max(prev - 1, 0)
          );
        }

        setPagination((prev) => ({
          ...prev,
          total: Math.max(
            (prev.total || 0) - 1,
            0
          ),
        }));

        /*
         * Update Navbar.
         */
        notifyNavbar();

        toast.success(
          "Notification deleted"
        );
      } catch (error) {
        console.error(
          "Delete Notification Error:",
          error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Failed to delete notification"
        );
      } finally {
        setDeletingId(null);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Open Notification
  |--------------------------------------------------------------------------
  */

  const handleNotificationClick =
    async (notification) => {
      if (!notification) {
        return;
      }

      /*
       * Mark unread notification
       * as read.
       */
      if (!notification.isRead) {
        await handleMarkAsRead(
          notification
        );
      }

      /*
       * Booking
       */
      if (
        notification.booking?._id
      ) {
        navigate(
          `/bookings/${notification.booking._id}`
        );

        return;
      }

      /*
       * Hall
       */
      if (
        notification.hall?._id &&
        (
          notification.type ===
            "hall_approved" ||
          notification.type ===
            "hall_rejected" ||
          notification.type ===
            "hall_suspended"
        )
      ) {
        navigate(
          `/halls/${notification.hall._id}`
        );

        return;
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const handlePreviousPage =
    () => {
      if (page <= 1) {
        return;
      }

      const nextPage = page - 1;

      setFilter("all");

      fetchNotifications(
        nextPage
      );
    };

  const handleNextPage = () => {
    if (
      page >=
      (pagination.pages || 1)
    ) {
      return;
    }

    const nextPage = page + 1;

    setFilter("all");

    fetchNotifications(
      nextPage
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    if (
      filter === "unread" &&
      notifications.length > 0
    ) {
      return (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <FaCheckDouble />
          </div>

          <h3>
            You're all caught up
          </h3>

          <p>
            You don't have any unread
            notifications.
          </p>

          <button
            type="button"
            className="notifications-empty-btn"
            onClick={() =>
              setFilter("all")
            }
          >
            View All Notifications
          </button>
        </div>
      );
    }

    if (
      filter === "read" &&
      notifications.length > 0
    ) {
      return (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <FaBell />
          </div>

          <h3>
            No read notifications
          </h3>

          <p>
            Your read notifications will
            appear here.
          </p>

          <button
            type="button"
            className="notifications-empty-btn"
            onClick={() =>
              setFilter("all")
            }
          >
            View All Notifications
          </button>
        </div>
      );
    }

    return (
      <div className="notifications-empty">
        <div className="notifications-empty-icon">
          <FaBell />
        </div>

        <h3>
          No notifications yet
        </h3>

        <p>
          We'll let you know when there is
          something important to see.
        </p>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="notifications-header">
          <div className="notifications-heading">
            <div className="notifications-heading-icon">
              <FaBell />
            </div>

            <div>
              <div className="notifications-title-row">
                <h1>
                  Notifications
                </h1>

                {unreadCount > 0 && (
                  <span className="notifications-count">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </div>

              <p>
                Stay updated with your
                bookings and account
                activity.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mark-all-btn"
            onClick={
              handleMarkAllAsRead
            }
            disabled={
              unreadCount === 0 ||
              actionLoading
            }
          >
            {actionLoading ? (
              <FaSpinner className="spin" />
            ) : (
              <FaCheckDouble />
            )}

            {actionLoading
              ? "Updating..."
              : "Mark all as read"}
          </button>
        </div>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="notifications-toolbar">
          <div className="notifications-filters">
            <button
              type="button"
              className={
                filter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All

              <span>
                {pagination.total ||
                  0}
              </span>
            </button>

            <button
              type="button"
              className={
                filter === "unread"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("unread")
              }
            >
              Unread

              <span>
                {unreadCount}
              </span>
            </button>

            <button
              type="button"
              className={
                filter === "read"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("read")
              }
            >
              Read
            </button>
          </div>

          {pagination.total > 0 && (
            <div className="notifications-pagination-info">
              Page {page} of{" "}
              {pagination.pages || 1}
            </div>
          )}
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="notifications-list-wrapper">
          {loading ? (
            <div className="notifications-loading">
              <FaSpinner className="spin" />

              <span>
                Loading notifications...
              </span>
            </div>
          ) : filteredNotifications.length ===
            0 ? (
            renderEmptyState()
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map(
                (notification) => {
                  const isUnread =
                    !notification.isRead;

                  const isDeleting =
                    deletingId ===
                    notification._id;

                  const isReading =
                    readingId ===
                    notification._id;

                  const eventDate =
                    formatEventDate(
                      notification
                        .booking
                        ?.eventDate
                    );

                  return (
                    <div
                      key={
                        notification._id
                      }
                      className={`notification-item ${
                        isUnread
                          ? "unread"
                          : "read"
                      }`}
                    >
                      {/* Unread Dot */}

                      {isUnread && (
                        <span className="notification-unread-dot" />
                      )}

                      {/* Icon */}

                      <button
                        type="button"
                        className={`notification-icon ${getNotificationClass(
                          notification.type
                        )}`}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        aria-label="Open notification"
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </button>

                      {/* Content */}

                      <div
                        className="notification-content"
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        role={
                          notification
                            .booking?._id ||
                          notification
                            .hall?._id
                            ? "button"
                            : undefined
                        }
                        tabIndex={
                          notification
                            .booking?._id ||
                          notification
                            .hall?._id
                            ? 0
                            : undefined
                        }
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          ) {
                            handleNotificationClick(
                              notification
                            );
                          }
                        }}
                      >
                        <div className="notification-top">
                          <h3>
                            {
                              notification.title
                            }
                          </h3>

                          <span className="notification-time">
                            {formatRelativeTime(
                              notification.createdAt
                            )}
                          </span>
                        </div>

                        <p className="notification-message">
                          {
                            notification.message
                          }
                        </p>

                        {/* Hall */}

                        {notification.hall && (
                          <div className="notification-meta">
                            <FaBuilding />

                            <span>
                              {
                                notification
                                  .hall
                                  .name
                              }

                              {notification
                                .hall
                                .city && (
                                <>
                                  {" "}
                                  ·{" "}
                                  {
                                    notification
                                      .hall
                                      .city
                                  }
                                </>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Booking */}

                        {notification.booking && (
                          <div className="notification-booking-meta">
                            <div>
                              <FaCalendarAlt />

                              <span>
                                {eventDate ||
                                  "Booking date unavailable"}
                              </span>
                            </div>

                            {notification
                              .booking
                              .guests !=
                              null && (
                              <div>
                                <span>
                                  {
                                    notification
                                      .booking
                                      .guests
                                  }{" "}
                                  guests
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* View Details */}

                        {(
                          notification
                            .booking?._id ||
                          notification
                            .hall?._id
                        ) && (
                          <div className="notification-view-link">
                            View details

                            <FaArrowRight />
                          </div>
                        )}
                      </div>

                      {/* Actions */}

                      <div className="notification-actions">
                        {!notification.isRead && (
                          <button
                            type="button"
                            className="notification-action-btn mark-read"
                            onClick={() =>
                              handleMarkAsRead(
                                notification
                              )
                            }
                            disabled={
                              isReading
                            }
                            title="Mark as read"
                            aria-label="Mark as read"
                          >
                            {isReading ? (
                              <FaSpinner className="spin" />
                            ) : (
                              <FaCheck />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          className="notification-action-btn delete"
                          onClick={() =>
                            handleDelete(
                              notification._id
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          {isDeleting ? (
                            <FaSpinner className="spin" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          filteredNotifications.length >
            0 &&
          pagination.pages > 1 && (
            <div className="notifications-pagination">
              <button
                type="button"
                onClick={
                  handlePreviousPage
                }
                disabled={page <= 1}
                className="pagination-btn"
              >
                <FaChevronLeft />

                <span>
                  Previous
                </span>
              </button>

              <div className="pagination-pages">
                {Array.from(
                  {
                    length:
                      pagination.pages,
                  },
                  (_, index) =>
                    index + 1
                )
                  .filter(
                    (pageNumber) => {
                      if (
                        pagination.pages <=
                        5
                      ) {
                        return true;
                      }

                      if (
                        pageNumber ===
                          1 ||
                        pageNumber ===
                          pagination.pages
                      ) {
                        return true;
                      }

                      return (
                        Math.abs(
                          pageNumber -
                            page
                        ) <= 1
                      );
                    }
                  )
                  .map(
                    (
                      pageNumber,
                      index,
                      visiblePages
                    ) => {
                      const previousPage =
                        visiblePages[
                          index - 1
                        ];

                      const showDots =
                        previousPage &&
                        pageNumber -
                          previousPage >
                          1;

                      return (
                        <React.Fragment
                          key={
                            pageNumber
                          }
                        >
                          {showDots && (
                            <span className="pagination-dots">
                              ...
                            </span>
                          )}

                          <button
                            type="button"
                            className={`pagination-number ${
                              pageNumber ===
                              page
                                ? "active"
                                : ""
                            }`}
                            onClick={() => {
                              setFilter(
                                "all"
                              );

                              fetchNotifications(
                                pageNumber
                              );
                            }}
                          >
                            {
                              pageNumber
                            }
                          </button>
                        </React.Fragment>
                      );
                    }
                  )}
              </div>

              <button
                type="button"
                onClick={
                  handleNextPage
                }
                disabled={
                  page >=
                  (pagination.pages ||
                    1)
                }
                className="pagination-btn"
              >
                <span>
                  Next
                </span>

                <FaChevronRight />
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default Notifications;