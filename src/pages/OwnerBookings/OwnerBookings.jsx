import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCheck,
  FaEye,
  FaFilter,
  FaPhone,
  FaSearch,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../api/axios";
import "./OwnerBookings.css";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_CLASS = {
  pending: "pending",
  confirmed: "confirmed",
  rejected: "rejected",
  cancelled: "cancelled",
  completed: "completed",
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (amount) => {
  return `${Number(amount || 0).toLocaleString("en-EG")} EGP`;
};

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);

  const [loading, setLoading] = useState(true);
  const [hallsLoading, setHallsLoading] = useState(true);

  const [error, setError] = useState("");

  const [hallId, setHallId] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [actionLoading, setActionLoading] = useState(null);

  const fetchHalls = async () => {
    try {
      setHallsLoading(true);

      const response = await api.get("/halls/my");

      setHalls(response.data?.halls || []);
    } catch (err) {
      console.error("Fetch Owner Halls Error:", err);

      toast.error(
        err.response?.data?.message || "Failed to load halls"
      );
    } finally {
      setHallsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 20,
      };

      if (hallId) {
        params.hallId = hallId;
      }

      if (status) {
        params.status = status;
      }

      if (from) {
        params.from = from;
      }

      if (to) {
        params.to = to;
      }

      const response = await api.get("/bookings/owner", {
        params,
      });

      setBookings(response.data?.bookings || []);

      setPagination(
        response.data?.pagination || {
          page,
          limit: 20,
          total: 0,
          pages: 0,
        }
      );
    } catch (err) {
      console.error("Fetch Owner Bookings Error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to load bookings";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [hallId, status, from, to, page]);

  const filteredBookings = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const customerName =
        booking.customer?.name ||
        booking.customerName ||
        "";

      const customerPhone =
        booking.customer?.phone ||
        booking.customerPhone ||
        "";

      const hallName =
        booking.hall?.name || "";

      const packageName =
        booking.package?.name || "";

      return (
        customerName.toLowerCase().includes(value) ||
        customerPhone.toLowerCase().includes(value) ||
        hallName.toLowerCase().includes(value) ||
        packageName.toLowerCase().includes(value)
      );
    });
  }, [bookings, search]);

  const handleStatusUpdate = async (
    bookingId,
    nextStatus
  ) => {
    try {
      let rejectionReason;

      if (nextStatus === "rejected") {
        rejectionReason = window.prompt(
          "Why are you rejecting this booking?"
        );

        if (rejectionReason === null) {
          return;
        }

        rejectionReason = rejectionReason.trim();

        if (!rejectionReason) {
          toast.error("Please enter a rejection reason");
          return;
        }
      }

      setActionLoading(`${bookingId}-${nextStatus}`);

      await api.patch(`/bookings/${bookingId}/status`, {
        status: nextStatus,
        ...(nextStatus === "rejected"
          ? { rejectionReason }
          : {}),
      });

      toast.success(
        `Booking ${nextStatus} successfully`
      );

      await fetchBookings();
    } catch (err) {
      console.error("Update Booking Status Error:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to update booking"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setHallId("");
    setStatus("");
    setFrom("");
    setTo("");
    setSearch("");
    setPage(1);
  };

  const hasFilters =
    hallId ||
    status ||
    from ||
    to ||
    search;

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  return (
    <div className="owner-bookings-page">
      <div className="owner-bookings-container">

        {/* Header */}
        <div className="owner-bookings-header">
          <div>
            <span className="owner-bookings-eyebrow">
              Booking Management
            </span>

            <h1>Bookings</h1>

            <p>
              Manage your hall bookings and customer requests
              from one place.
            </p>
          </div>

          <Link
            to="/owner/dashboard"
            className="owner-bookings-dashboard-btn"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="owner-bookings-stats">

          <div className="owner-booking-stat">
            <div className="owner-booking-stat-icon pending-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="owner-booking-stat">
            <div className="owner-booking-stat-icon confirmed-icon">
              <FaCheck />
            </div>

            <div>
              <span>Confirmed</span>
              <strong>{confirmedCount}</strong>
            </div>
          </div>

          <div className="owner-booking-stat">
            <div className="owner-booking-stat-icon completed-icon">
              <FaCheck />
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedCount}</strong>
            </div>
          </div>

          <div className="owner-booking-stat">
            <div className="owner-booking-stat-icon total-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <span>Total Results</span>
              <strong>{pagination.total}</strong>
            </div>
          </div>

        </div>

        {/* Filters */}
        <div className="owner-bookings-filters">

          <div className="filters-title">
            <FaFilter />
            <span>Filters</span>
          </div>

          <div className="filters-grid">

            <div className="filter-field search-field">
              <label>Search</label>

              <div className="search-input-wrapper">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Customer, phone, hall..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="filter-field">
              <label>Hall</label>

              <select
                value={hallId}
                onChange={(e) => {
                  setHallId(e.target.value);
                  setPage(1);
                }}
                disabled={hallsLoading}
              >
                <option value="">All Halls</option>

                {halls.map((hall) => (
                  <option
                    key={hall._id}
                    value={hall._id}
                  >
                    {hall.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>Status</label>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-field">
              <label>From</label>

              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="filter-field">
              <label>To</label>

              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {hasFilters && (
              <button
                type="button"
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                <FaTimes />
                Clear
              </button>
            )}

          </div>
        </div>

        {/* Content */}
        <div className="owner-bookings-content">

          {loading ? (
            <div className="owner-bookings-loading">
              <div className="booking-spinner"></div>
              <p>Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="owner-bookings-error">
              <h3>Something went wrong</h3>
              <p>{error}</p>

              <button
                type="button"
                onClick={fetchBookings}
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="owner-bookings-empty">
              <div className="empty-icon">
                <FaCalendarAlt />
              </div>

              <h3>No bookings found</h3>

              <p>
                There are no bookings matching your current
                filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="bookings-list">

                {filteredBookings.map((booking) => {
                  const customerName =
                    booking.customer?.name ||
                    booking.customerName ||
                    "Customer";

                  const customerPhone =
                    booking.customer?.phone ||
                    booking.customerPhone ||
                    "";

                  const packageName =
                    booking.package?.name ||
                    "Package";

                  const hallName =
                    booking.hall?.name ||
                    "Hall";

                  const statusClass =
                    STATUS_CLASS[booking.status] ||
                    "pending";

                  return (
                    <div
                      className="owner-booking-card"
                      key={booking._id}
                    >

                      {/* Date */}
                      <div className="booking-date-box">
                        <FaCalendarAlt />

                        <strong>
                          {formatDate(
                            booking.eventDate
                          )}
                        </strong>
                      </div>

                      {/* Main */}
                      <div className="booking-main">

                        <div className="booking-main-top">

                          <div>
                            <div className="booking-hall-name">
                              {hallName}
                            </div>

                            <h3>
                              {packageName}
                            </h3>
                          </div>

                          <span
                            className={`booking-status ${statusClass}`}
                          >
                            {STATUS_LABELS[
                              booking.status
                            ] || booking.status}
                          </span>

                        </div>

                        <div className="booking-details-grid">

                          <div className="booking-detail">
                            <span>Customer</span>
                            <strong>
                              {customerName}
                            </strong>
                          </div>

                          <div className="booking-detail">
                            <span>Guests</span>
                            <strong>
                              <FaUsers />
                              {booking.guests}
                            </strong>
                          </div>

                          <div className="booking-detail">
                            <span>Total</span>
                            <strong>
                              {formatPrice(
                                booking.totalAmount
                              )}
                            </strong>
                          </div>

                          <div className="booking-detail">
                            <span>Payment</span>
                            <strong>
                              {booking.paymentMethod ||
                                "cash"}
                            </strong>
                          </div>

                        </div>

                        <div className="booking-card-bottom">

                          {customerPhone ? (
                            <a
                              href={`tel:${customerPhone}`}
                              className="customer-phone"
                            >
                              <FaPhone />
                              {customerPhone}
                            </a>
                          ) : (
                            <span></span>
                          )}

                          <div className="booking-actions">

                            <Link
                              to={`/owner/bookings/${booking._id}`}
                              className="booking-action view"
                            >
                              <FaEye />
                              View
                            </Link>

                            {booking.status ===
                              "pending" && (
                              <>
                                <button
                                  type="button"
                                  className="booking-action reject"
                                  disabled={
                                    actionLoading !== null
                                  }
                                  onClick={() =>
                                    handleStatusUpdate(
                                      booking._id,
                                      "rejected"
                                    )
                                  }
                                >
                                  <FaTimes />

                                  {actionLoading ===
                                  `${booking._id}-rejected`
                                    ? "Rejecting..."
                                    : "Reject"}
                                </button>

                                <button
                                  type="button"
                                  className="booking-action confirm"
                                  disabled={
                                    actionLoading !== null
                                  }
                                  onClick={() =>
                                    handleStatusUpdate(
                                      booking._id,
                                      "confirmed"
                                    )
                                  }
                                >
                                  <FaCheck />

                                  {actionLoading ===
                                  `${booking._id}-confirmed`
                                    ? "Confirming..."
                                    : "Confirm"}
                                </button>
                              </>
                            )}

                            {booking.status ===
                              "confirmed" && (
                              <button
                                type="button"
                                className="booking-action complete"
                                disabled={
                                  actionLoading !== null
                                }
                                onClick={() =>
                                  handleStatusUpdate(
                                    booking._id,
                                    "completed"
                                  )
                                }
                              >
                                <FaCheck />

                                {actionLoading ===
                                `${booking._id}-completed`
                                  ? "Completing..."
                                  : "Complete"}
                              </button>
                            )}

                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="owner-bookings-pagination">

                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(current - 1, 1)
                      )
                    }
                  >
                    Previous
                  </button>

                  <div className="pagination-info">
                    Page {pagination.page} of{" "}
                    {pagination.pages}
                  </div>

                  <button
                    type="button"
                    disabled={
                      page >= pagination.pages
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          current + 1,
                          pagination.pages
                        )
                      )
                    }
                  >
                    Next
                  </button>

                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default OwnerBookings;