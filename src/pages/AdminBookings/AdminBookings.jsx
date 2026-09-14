import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaSearch,
  FaSyncAlt,
  FaUsers,
} from "react-icons/fa";

import api from "../../api/axios";
import "./AdminBookings.css";

const AdminBookings = () => {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    paid: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch Bookings
  |--------------------------------------------------------------------------
  */

  const fetchBookings = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          page,
          limit: 20,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (status) {
          params.status = status;
        }

        if (paymentStatus) {
          params.paymentStatus = paymentStatus;
        }

        const response = await api.get(
          "/bookings/admin",
          {
            params,
          }
        );

        const data = response?.data;

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Failed to load bookings"
          );
        }

        setBookings(
          Array.isArray(data.bookings)
            ? data.bookings
            : []
        );

        setStats({
          total: data?.stats?.total || 0,
          pending: data?.stats?.pending || 0,
          confirmed:
            data?.stats?.confirmed || 0,
          completed:
            data?.stats?.completed || 0,
          cancelled:
            data?.stats?.cancelled || 0,
          rejected:
            data?.stats?.rejected || 0,
          paid: data?.stats?.paid || 0,
        });

        setPagination({
          page:
            data?.pagination?.page ||
            page,
          limit:
            data?.pagination?.limit ||
            20,
          total:
            data?.pagination?.total || 0,
          pages:
            data?.pagination?.pages || 0,
        });
      } catch (err) {
        console.error(
          "Admin bookings error:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load bookings";

        setError(message);

        setBookings([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      search,
      status,
      paymentStatus,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | Initial Load + Filters
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /*
  |--------------------------------------------------------------------------
  | Reset Page When Filters Change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setPage(1);
  }, [status, paymentStatus]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (page !== 1) {
      setPage(1);
      return;
    }

    fetchBookings();
  };

  /*
  |--------------------------------------------------------------------------
  | Clear Filters
  |--------------------------------------------------------------------------
  */

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  const handleRefresh = () => {
    fetchBookings(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Open Details
  |--------------------------------------------------------------------------
  */

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Details
  |--------------------------------------------------------------------------
  */

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedBooking(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Format Date
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Format Money
  |--------------------------------------------------------------------------
  */

  const formatMoney = (
    amount,
    currency = "EGP"
  ) => {
    const value = Number(amount);

    if (Number.isNaN(value)) {
      return "0 EGP";
    }

    return `${value.toLocaleString(
      "en-US"
    )} ${currency}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Status Class
  |--------------------------------------------------------------------------
  */

  const getStatusClass = (value) => {
    switch (value) {
      case "pending":
        return "pending";

      case "confirmed":
        return "confirmed";

      case "completed":
        return "completed";

      case "cancelled":
        return "cancelled";

      case "rejected":
        return "rejected";

      default:
        return "default";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Payment Class
  |--------------------------------------------------------------------------
  */

  const getPaymentClass = (value) => {
    switch (value) {
      case "paid":
        return "paid";

      case "pending":
        return "payment-pending";

      case "failed":
        return "failed";

      case "refunded":
        return "refunded";

      case "unpaid":
        return "unpaid";

      default:
        return "default";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Capitalize
  |--------------------------------------------------------------------------
  */

  const capitalize = (value) => {
    if (!value) return "-";

    return value.charAt(0).toUpperCase() +
      value.slice(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const canGoPrevious = page > 1;

  const canGoNext =
    pagination.pages > 0 &&
    page < pagination.pages;

  const handlePreviousPage = () => {
    if (!canGoPrevious) return;

    setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (!canGoNext) return;

    setPage((prev) => prev + 1);
  };

  /*
  |--------------------------------------------------------------------------
  | Visible Pagination Numbers
  |--------------------------------------------------------------------------
  */

  const paginationNumbers = useMemo(() => {
    const totalPages = pagination.pages;

    if (!totalPages) return [];

    const numbers = [];

    let start = Math.max(
      1,
      page - 2
    );

    let end = Math.min(
      totalPages,
      page + 2
    );

    if (page <= 3) {
      end = Math.min(
        totalPages,
        5
      );
    }

    if (page >= totalPages - 2) {
      start = Math.max(
        1,
        totalPages - 4
      );
    }

    for (
      let i = start;
      i <= end;
      i++
    ) {
      numbers.push(i);
    }

    return numbers;
  }, [
    pagination.pages,
    page,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (
    loading &&
    bookings.length === 0
  ) {
    return (
      <div className="admin-bookings-page">
        <div className="admin-bookings-header">
          <div>
            <h1>Bookings</h1>
            <p>
              View and monitor all platform
              bookings.
            </p>
          </div>
        </div>

        <div className="admin-bookings-loading">
          <div className="loading-spinner" />
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="admin-bookings-page">
      {/* --------------------------------------------------------------- */}
      {/* Header */}
      {/* --------------------------------------------------------------- */}

      <div className="admin-bookings-header">
        <div>
          <div className="admin-bookings-title-row">
            <div className="admin-bookings-title-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <h1>Bookings</h1>

              <p>
                View and monitor all
                bookings across Wedora.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="admin-bookings-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSyncAlt
            className={
              refreshing
                ? "spin"
                : ""
            }
          />

          <span>
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Error */}
      {/* --------------------------------------------------------------- */}

      {error && (
        <div className="admin-bookings-error">
          <div>
            <strong>
              Could not load bookings
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchBookings()
            }
          >
            Try Again
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------- */}
      {/* Stats */}
      {/* --------------------------------------------------------------- */}

      <div className="admin-bookings-stats">
        <div className="booking-stat-card">
          <div className="booking-stat-icon total">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Total Bookings</span>
            <strong>
              {stats.total}
            </strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon pending">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Pending</span>
            <strong>
              {stats.pending}
            </strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon confirmed">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Confirmed</span>
            <strong>
              {stats.confirmed}
            </strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon completed">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {stats.completed}
            </strong>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon paid">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Paid</span>
            <strong>
              {stats.paid}
            </strong>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Filters */}
      {/* --------------------------------------------------------------- */}

      <div className="admin-bookings-filters">
        <form
          className="booking-search"
          onSubmit={
            handleSearchSubmit
          }
        >
          <FaSearch />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search customer name, email or phone..."
          />

          <button type="submit">
            Search
          </button>
        </form>

        <div className="booking-filter-group">
          <select
            value={status}
            onChange={(e) => {
              setStatus(
                e.target.value
              );
              setPage(1);
            }}
          >
            <option value="">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(
                e.target.value
              );
              setPage(1);
            }}
          >
            <option value="">
              All Payments
            </option>

            <option value="unpaid">
              Unpaid
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>

          {(search ||
            status ||
            paymentStatus) && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={
                handleClearFilters
              }
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Table */}
      {/* --------------------------------------------------------------- */}

      <div className="admin-bookings-card">
        <div className="admin-bookings-card-header">
          <div>
            <h2>All Bookings</h2>

            <span>
              {pagination.total}{" "}
              booking
              {pagination.total !==
              1
                ? "s"
                : ""}
            </span>
          </div>

          <div className="readonly-label">
            Read Only
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="admin-bookings-empty">
            <div className="empty-icon">
              <FaCalendarAlt />
            </div>

            <h3>
              No bookings found
            </h3>

            <p>
              There are no bookings
              matching your current
              filters.
            </p>

            {(search ||
              status ||
              paymentStatus) && (
              <button
                type="button"
                onClick={
                  handleClearFilters
                }
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="admin-bookings-table-wrapper">
            <table className="admin-bookings-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Hall</th>
                  <th>Package</th>
                  <th>Event Date</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {bookings.map(
                  (booking) => (
                    <tr
                      key={
                        booking._id
                      }
                    >
                      {/* Customer */}
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {(
                              booking.customerName ||
                              booking.customer
                                ?.name ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="customer-info">
                            <strong>
                              {booking.customerName ||
                                booking
                                  .customer
                                  ?.name ||
                                "Unknown Customer"}
                            </strong>

                            <span>
                              {booking.customerEmail ||
                                booking
                                  .customer
                                  ?.email ||
                                "-"}
                            </span>

                            <small>
                              {booking.customerPhone ||
                                booking
                                  .customer
                                  ?.phone ||
                                "-"}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Hall */}
                      <td>
                        <div className="hall-cell">
                          <strong>
                            {booking
                              .hall
                              ?.name ||
                              "Unknown Hall"}
                          </strong>

                          <span>
                            {booking
                              .hall
                              ?.city ||
                              booking
                                .hall
                                ?.area ||
                              "-"}
                          </span>
                        </div>
                      </td>

                      {/* Package */}
                      <td>
                        <div className="package-cell">
                          <strong>
                            {booking
                              .package
                              ?.name ||
                              "Unknown Package"}
                          </strong>

                          {booking
                            .package
                            ?.price !==
                            undefined && (
                            <span>
                              {formatMoney(
                                booking
                                  .package
                                  .price,
                                booking.currency ||
                                  "EGP"
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Event Date */}
                      <td>
                        <div className="date-cell">
                          <FaCalendarAlt />

                          <span>
                            {formatDate(
                              booking.eventDate
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Guests */}
                      <td>
                        <div className="guests-cell">
                          <FaUsers />

                          <span>
                            {booking.guests ||
                              0}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td>
                        <strong className="booking-total">
                          {formatMoney(
                            booking.totalAmount,
                            booking.currency ||
                              "EGP"
                          )}
                        </strong>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`booking-status ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {capitalize(
                            booking.status
                          )}
                        </span>
                      </td>

                      {/* Payment */}
                      <td>
                        <div className="payment-cell">
                          <span
                            className={`payment-status ${getPaymentClass(
                              booking.paymentStatus
                            )}`}
                          >
                            {capitalize(
                              booking.paymentStatus
                            )}
                          </span>

                          {booking.paymentMethod && (
                            <small>
                              {capitalize(
                                booking.paymentMethod
                              )}
                            </small>
                          )}
                        </div>
                      </td>

                      {/* View */}
                      <td>
                        <button
                          type="button"
                          className="view-booking-btn"
                          onClick={() =>
                            handleViewDetails(
                              booking
                            )
                          }
                          title="View booking details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Pagination */}
        {/* ------------------------------------------------------------- */}

        {pagination.pages > 1 && (
          <div className="admin-bookings-pagination">
            <div className="pagination-info">
              Showing{" "}
              <strong>
                {(page - 1) *
                  pagination.limit +
                  1}
              </strong>{" "}
              -{" "}
              <strong>
                {Math.min(
                  page *
                    pagination.limit,
                  pagination.total
                )}
              </strong>{" "}
              of{" "}
              <strong>
                {pagination.total}
              </strong>
            </div>

            <div className="pagination-controls">
              <button
                type="button"
                onClick={
                  handlePreviousPage
                }
                disabled={
                  !canGoPrevious
                }
              >
                <FaChevronLeft />
              </button>

              {paginationNumbers.map(
                (number) => (
                  <button
                    type="button"
                    key={number}
                    className={
                      number === page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPage(number)
                    }
                  >
                    {number}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={
                  handleNextPage
                }
                disabled={!canGoNext}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Details Modal */}
      {/* --------------------------------------------------------------- */}

      {showDetails &&
        selectedBooking && (
          <div
            className="booking-details-overlay"
            onMouseDown={
              handleCloseDetails
            }
          >
            <div
              className="booking-details-modal"
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >
              <div className="booking-details-header">
                <div>
                  <span>
                    Booking Details
                  </span>

                  <h2>
                    #
                    {String(
                      selectedBooking._id
                    ).slice(-8)}
                  </h2>
                </div>

                <button
                  type="button"
                  className="close-details-btn"
                  onClick={
                    handleCloseDetails
                  }
                >
                  ×
                </button>
              </div>

              <div className="booking-details-content">
                {/* Status */}
                <div className="details-status-row">
                  <span
                    className={`booking-status ${getStatusClass(
                      selectedBooking.status
                    )}`}
                  >
                    {capitalize(
                      selectedBooking.status
                    )}
                  </span>

                  <span
                    className={`payment-status ${getPaymentClass(
                      selectedBooking.paymentStatus
                    )}`}
                  >
                    Payment:{" "}
                    {capitalize(
                      selectedBooking.paymentStatus
                    )}
                  </span>
                </div>

                {/* Customer */}
                <div className="details-section">
                  <h3>
                    Customer
                  </h3>

                  <div className="details-grid">
                    <div>
                      <span>Name</span>
                      <strong>
                        {selectedBooking.customerName ||
                          selectedBooking
                            .customer
                            ?.name ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>
                        {selectedBooking.customerEmail ||
                          selectedBooking
                            .customer
                            ?.email ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>
                        {selectedBooking.customerPhone ||
                          selectedBooking
                            .customer
                            ?.phone ||
                          "-"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Hall */}
                <div className="details-section">
                  <h3>
                    Hall
                  </h3>

                  <div className="details-grid">
                    <div>
                      <span>Name</span>
                      <strong>
                        {selectedBooking
                          .hall
                          ?.name ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>City</span>
                      <strong>
                        {selectedBooking
                          .hall
                          ?.city ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Area</span>
                      <strong>
                        {selectedBooking
                          .hall
                          ?.area ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Address</span>
                      <strong>
                        {selectedBooking
                          .hall
                          ?.address ||
                          "-"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Package */}
                <div className="details-section">
                  <h3>
                    Package
                  </h3>

                  <div className="details-grid">
                    <div>
                      <span>Name</span>
                      <strong>
                        {selectedBooking
                          .package
                          ?.name ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Package Price</span>
                      <strong>
                        {formatMoney(
                          selectedBooking
                            .packagePrice,
                          selectedBooking.currency ||
                            "EGP"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Guests</span>
                      <strong>
                        {selectedBooking.guests ||
                          0}
                      </strong>
                    </div>

                    <div>
                      <span>Event Date</span>
                      <strong>
                        {formatDate(
                          selectedBooking.eventDate
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="details-section">
                  <h3>
                    Payment
                  </h3>

                  <div className="details-grid">
                    <div>
                      <span>Payment Status</span>
                      <strong>
                        {capitalize(
                          selectedBooking.paymentStatus
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Payment Method</span>
                      <strong>
                        {capitalize(
                          selectedBooking.paymentMethod
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Extra Amount</span>
                      <strong>
                        {formatMoney(
                          selectedBooking.extraAmount,
                          selectedBooking.currency ||
                            "EGP"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Discount</span>
                      <strong>
                        {formatMoney(
                          selectedBooking.discountAmount,
                          selectedBooking.currency ||
                            "EGP"
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="details-total">
                  <span>
                    Total Amount
                  </span>

                  <strong>
                    {formatMoney(
                      selectedBooking.totalAmount,
                      selectedBooking.currency ||
                        "EGP"
                    )}
                  </strong>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="details-notes">
                    <h3>
                      Customer Notes
                    </h3>

                    <p>
                      {
                        selectedBooking.notes
                      }
                    </p>
                  </div>
                )}

                {/* Cancellation */}
                {selectedBooking.cancellationReason && (
                  <div className="details-notes cancellation">
                    <h3>
                      Cancellation /
                      Rejection Reason
                    </h3>

                    <p>
                      {
                        selectedBooking.cancellationReason
                      }
                    </p>
                  </div>
                )}

                {/* Read Only Notice */}
                <div className="readonly-notice">
                  <span>
                    This page is
                    read-only.
                  </span>

                  <p>
                    Booking actions are
                    intentionally disabled
                    from this page.
                  </p>
                </div>
              </div>

              <div className="booking-details-footer">
                <button
                  type="button"
                  onClick={
                    handleCloseDetails
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminBookings;