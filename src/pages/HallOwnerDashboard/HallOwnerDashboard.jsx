import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBuilding,
  FaCalendarCheck,
  FaCalendarAlt,
  FaBoxOpen,
  FaMoneyBillWave,
  FaStar,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaArrowRight,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import api from "../../api/axios";

import "./HallOwnerDashboard.css";

const HallOwnerDashboard = () => {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/owner"
      );

      if (
        response.data?.success &&
        response.data?.data
      ) {
        setDashboard(
          response.data.data
        );
      } else {
        setError(
          "Failed to load dashboard data"
        );
      }
    } catch (err) {
      console.error(
        "Owner Dashboard Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-EG",
      {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
      }
    ).format(Number(value || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-EG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed";

      case "pending":
        return "status-pending";

      case "completed":
        return "status-completed";

      case "rejected":
        return "status-rejected";

      case "cancelled":
        return "status-cancelled";

      case "approved":
        return "status-approved";

      case "suspended":
        return "status-suspended";

      default:
        return "status-default";
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "-";

    return status
      .charAt(0)
      .toUpperCase() +
      status.slice(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    return dashboard?.stats || {
      halls: {},
      packages: {},
      bookings: {},
      customers: 0,
      revenue: 0,
      paidRevenue: 0,
      last30DaysRevenue: 0,
      averageRating: 0,
      reviews: 0,
    };
  }, [dashboard]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-dashboard-loading">
          <div className="dashboard-spinner" />

          <h3>
            Loading dashboard...
          </h3>

          <p>
            Please wait while we prepare
            your hall statistics.
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="owner-dashboard-page">
        <div className="owner-dashboard-error">
          <div className="error-icon">
            <FaExclamationCircle />
          </div>

          <h2>
            Something went wrong
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="dashboard-retry-btn"
            onClick={fetchDashboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  return (
    <div className="owner-dashboard-page">
      <div className="owner-dashboard-container">
        {/* ================================================================
            HEADER
        ================================================================= */}

        <div className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              WEDORA OWNER PANEL
            </span>

            <h1>
              Welcome back 👋
            </h1>

            <p>
              Here&apos;s what&apos;s happening
              with your wedding halls.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <Link
              to="/owner/halls"
              className="dashboard-primary-btn"
            >
              <FaBuilding />
              Manage Halls
            </Link>
          </div>
        </div>

        {/* ================================================================
            MAIN STAT CARDS
        ================================================================= */}

        <div className="dashboard-stats-grid">
          {/* Halls */}

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="stat-icon stat-icon-orange">
                <FaBuilding />
              </div>

              <span className="stat-card-label">
                Total Halls
              </span>
            </div>

            <div className="stat-card-value">
              {stats.halls.total || 0}
            </div>

            <div className="stat-card-footer">
              <span className="stat-success">
                {stats.halls.approved || 0}{" "}
                approved
              </span>

              <span>
                {stats.halls.pending || 0}{" "}
                pending
              </span>
            </div>
          </div>

          {/* Bookings */}

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="stat-icon stat-icon-blue">
                <FaCalendarCheck />
              </div>

              <span className="stat-card-label">
                Total Bookings
              </span>
            </div>

            <div className="stat-card-value">
              {stats.bookings.total || 0}
            </div>

            <div className="stat-card-footer">
              <span className="stat-warning">
                {stats.bookings.pending || 0}{" "}
                pending
              </span>

              <span>
                {stats.bookings.confirmed || 0}{" "}
                confirmed
              </span>
            </div>
          </div>

          {/* Revenue */}

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="stat-icon stat-icon-green">
                <FaMoneyBillWave />
              </div>

              <span className="stat-card-label">
                Booking Value
              </span>
            </div>

            <div className="stat-card-value stat-money">
              {formatCurrency(
                stats.revenue
              )}
            </div>

            <div className="stat-card-footer">
              <span className="stat-success">
                Paid:{" "}
                {formatCurrency(
                  stats.paidRevenue
                )}
              </span>
            </div>
          </div>

          {/* Rating */}

          <div className="dashboard-stat-card">
            <div className="stat-card-top">
              <div className="stat-icon stat-icon-yellow">
                <FaStar />
              </div>

              <span className="stat-card-label">
                Average Rating
              </span>
            </div>

            <div className="stat-card-value rating-value">
              {stats.averageRating || 0}
              <FaStar />
            </div>

            <div className="stat-card-footer">
              <span>
                {stats.reviews || 0} reviews
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================
            SECONDARY STATS
        ================================================================= */}

        <div className="dashboard-secondary-grid">
          <div className="secondary-stat-card">
            <div className="secondary-stat-icon">
              <FaBoxOpen />
            </div>

            <div>
              <span>
                Active Packages
              </span>

              <strong>
                {stats.packages.active || 0}
              </strong>
            </div>
          </div>

          <div className="secondary-stat-card">
            <div className="secondary-stat-icon">
              <FaUsers />
            </div>

            <div>
              <span>
                Customers
              </span>

              <strong>
                {stats.customers || 0}
              </strong>
            </div>
          </div>

          <div className="secondary-stat-card">
            <div className="secondary-stat-icon">
              <FaClock />
            </div>

            <div>
              <span>
                Upcoming Bookings
              </span>

              <strong>
                {stats.bookings
                  .upcoming || 0}
              </strong>
            </div>
          </div>

          <div className="secondary-stat-card">
            <div className="secondary-stat-icon">
              <FaMoneyBillWave />
            </div>

            <div>
              <span>
                Last 30 Days
              </span>

              <strong>
                {formatCurrency(
                  stats.last30DaysRevenue
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* ================================================================
            CONTENT GRID
        ================================================================= */}

        <div className="dashboard-content-grid">
          {/* ============================================================
              UPCOMING BOOKINGS
          ============================================================= */}

          <section className="dashboard-section dashboard-bookings-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">
                  BOOKINGS
                </span>

                <h2>
                  Upcoming Bookings
                </h2>
              </div>

              <Link
                to="/owner/bookings"
                className="section-view-link"
              >
                View all
                <FaArrowRight />
              </Link>
            </div>

            {!dashboard?.upcomingBookings
              ?.length ? (
              <div className="empty-dashboard-state">
                <div className="empty-state-icon">
                  <FaCalendarCheck />
                </div>

                <h3>
                  No upcoming bookings
                </h3>

                <p>
                  New bookings will appear
                  here when customers reserve
                  your halls.
                </p>
              </div>
            ) : (
              <div className="bookings-list">
                {dashboard.upcomingBookings.map(
                  (booking) => (
                    <div
                      className="booking-row"
                      key={booking._id}
                    >
                      <div className="booking-date">
                        <span>
                          {new Date(
                            booking.eventDate
                          ).toLocaleDateString(
                            "en-EG",
                            {
                              day: "2-digit",
                            }
                          )}
                        </span>

                        <small>
                          {new Date(
                            booking.eventDate
                          ).toLocaleDateString(
                            "en-EG",
                            {
                              month: "short",
                            }
                          )}
                        </small>
                      </div>

                      <div className="booking-info">
                        <h3>
                          {booking.customer
                            ?.name ||
                            "Customer"}
                        </h3>

                        <p>
                          {booking.hall?.name ||
                            "Hall"}
                          {" • "}
                          {booking.package
                            ?.name ||
                            "Package"}
                        </p>

                        <small>
                          {booking.guests ||
                            0}{" "}
                          guests
                        </small>
                      </div>

                      <div className="booking-price">
                        <strong>
                          {formatCurrency(
                            booking.totalAmount
                          )}
                        </strong>

                        <span>
                          {formatDate(
                            booking.eventDate
                          )}
                        </span>
                      </div>

                      <span
                        className={`booking-status ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {getStatusLabel(
                          booking.status
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* ============================================================
              HALLS
          ============================================================= */}

          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">
                  YOUR BUSINESS
                </span>

                <h2>
                  My Halls
                </h2>
              </div>

              <Link
                to="/owner/halls"
                className="section-view-link"
              >
                Manage
                <FaArrowRight />
              </Link>
            </div>

            {!dashboard?.halls
              ?.length ? (
              <div className="empty-dashboard-state">
                <div className="empty-state-icon">
                  <FaBuilding />
                </div>

                <h3>
                  No halls yet
                </h3>

                <p>
                  Add your first wedding hall
                  to start receiving bookings.
                </p>

                <Link
                  to="/owner/halls"
                  className="dashboard-primary-btn"
                >
                  Add Hall
                </Link>
              </div>
            ) : (
              <div className="halls-list">
                {dashboard.halls.map(
                  (hall) => (
                    <div
                      className="hall-mini-card"
                      key={hall._id}
                    >
                      <div className="hall-mini-image">
                        {hall.coverImage
                          ?.url ? (
                          <img
                            src={
                              hall.coverImage
                                .url
                            }
                            alt={
                              hall.name
                            }
                          />
                        ) : (
                          <FaBuilding />
                        )}
                      </div>

                      <div className="hall-mini-info">
                        <h3>
                          {hall.name}
                        </h3>

                        <div className="hall-mini-meta">
                          <span
                            className={`hall-status ${getStatusClass(
                              hall.status
                            )}`}
                          >
                            {getStatusLabel(
                              hall.status
                            )}
                          </span>

                          <span>
                            <FaStar />
                            {hall.rating
                              ?.average ||
                              0}
                          </span>
                        </div>

                        <small>
                          {hall.totalBookings ||
                            0}{" "}
                          bookings
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>

        {/* ================================================================
            BOTTOM GRID
        ================================================================= */}

        <div className="dashboard-bottom-grid">
          {/* ============================================================
              TOP PACKAGES
          ============================================================= */}

          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">
                  PERFORMANCE
                </span>

                <h2>
                  Top Packages
                </h2>
              </div>

              <Link
                to="/owner/packages"
                className="section-view-link"
              >
                View all
                <FaArrowRight />
              </Link>
            </div>

            {!dashboard?.topPackages
              ?.length ? (
              <div className="empty-dashboard-state compact">
                <div className="empty-state-icon">
                  <FaBoxOpen />
                </div>

                <h3>
                  No package data yet
                </h3>

                <p>
                  Your best performing
                  packages will appear here.
                </p>
              </div>
            ) : (
              <div className="top-packages-list">
                {dashboard.topPackages.map(
                  (item, index) => (
                    <div
                      className="package-performance-row"
                      key={
                        item._id ||
                        index
                      }
                    >
                      <div className="package-rank">
                        #{index + 1}
                      </div>

                      <div className="package-performance-image">
                        {item.package
                          ?.image?.url ? (
                          <img
                            src={
                              item.package
                                .image
                                .url
                            }
                            alt={
                              item.package
                                .name
                            }
                          />
                        ) : (
                          <FaBoxOpen />
                        )}
                      </div>

                      <div className="package-performance-info">
                        <h3>
                          {item.package
                            ?.name ||
                            "Package"}
                        </h3>

                        <span>
                          {item.bookings || 0}{" "}
                          bookings
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(
                          item.revenue
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* ============================================================
              QUICK ACTIONS
          ============================================================= */}

          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">
                  QUICK ACTIONS
                </span>

                <h2>
                  Manage Wedora
                </h2>
              </div>
            </div>

            <div className="quick-actions">
              <Link
                to="/owner/halls"
                className="quick-action"
              >
                <div className="quick-action-icon">
                  <FaBuilding />
                </div>

                <div>
                  <strong>
                    My Halls
                  </strong>

                  <span>
                    Manage your halls
                  </span>
                </div>

                <FaArrowRight />
              </Link>

              <Link
                  to="/owner/availability"
                  className="quick-action"
                >
                  <div className="quick-action-icon">
                    <FaCalendarAlt />
                  </div>

                  <div>
                    <strong>Availability</strong>

                    <span>
                      Manage hall availability
                    </span>
                  </div>

                  <FaArrowRight />
              </Link>

              <Link
                to="/owner/packages"
                className="quick-action"
              >
                <div className="quick-action-icon">
                  <FaBoxOpen />
                </div>

                <div>
                  <strong>
                    Packages
                  </strong>

                  <span>
                    Manage packages
                  </span>
                </div>

                <FaArrowRight />
              </Link>

              <Link
                to="/owner/bookings"
                className="quick-action"
              >
                <div className="quick-action-icon">
                  <FaCalendarCheck />
                </div>

                <div>
                  <strong>
                    Bookings
                  </strong>

                  <span>
                    View customer bookings
                  </span>
                </div>

                <FaArrowRight />
              </Link>



              <Link
                    to="/owner/availability"
                    className="quick-action">
                    <div className="quick-action-icon">
                      <FaCalendarCheck />
                    </div>

                    <div>
                      <strong>Availability</strong>

                      <span>
                        Manage hall availability
                      </span>
                    </div>

                    <FaArrowRight />
              </Link>

              <Link
                to="/owner/reviews"
                className="quick-action"
              >
                <div className="quick-action-icon">
                  <FaStar />
                </div>

                <div>
                  <strong>
                    Reviews
                  </strong>

                  <span>
                    See customer feedback
                  </span>
                </div>

                <FaArrowRight />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HallOwnerDashboard;

