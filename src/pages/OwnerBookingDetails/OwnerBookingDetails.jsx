import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaExclamationTriangle,
  FaPhone,
  FaUsers,
  FaMapMarkerAlt,
  FaBuilding,
  FaBoxOpen,
  FaMoneyBillWave,
  FaCreditCard,
  FaUser,
  FaTimes,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../api/axios";
import "./OwnerBookingDetails.css";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "pending",
  },
  confirmed: {
    label: "Confirmed",
    className: "confirmed",
  },
  rejected: {
    label: "Rejected",
    className: "rejected",
  },
  cancelled: {
    label: "Cancelled",
    className: "cancelled",
  },
  completed: {
    label: "Completed",
    className: "completed",
  },
};

const PAYMENT_STATUS_CONFIG = {
  unpaid: {
    label: "Unpaid",
    className: "unpaid",
  },
  pending: {
    label: "Pending",
    className: "payment-pending",
  },
  paid: {
    label: "Paid",
    className: "paid",
  },
  failed: {
    label: "Failed",
    className: "failed",
  },
  refunded: {
    label: "Refunded",
    className: "refunded",
  },
};

const PAYMENT_METHOD_LABELS = {
  cash: "Cash",
  card: "Card",
  online: "Online",
};

const formatDate = (value) => {
  if (!value) return "-";

  const raw = String(value).slice(0, 10);

  const [year, month, day] = raw.split("-").map(Number);

  if (!year || !month || !day) return "-";

  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (value) => {
  if (!value) return "-";

  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split("-").map(Number);

  if (!year || !month || !day) return "-";

  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (value, currency = "EGP") => {
  const amount = Number(value || 0);

  return `${amount.toLocaleString("en-US")} ${currency}`;
};

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "U";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
};

const OwnerBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchBooking = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/bookings/${id}`);

      if (response.data?.success === false) {
        throw new Error(
          response.data?.message || "Failed to load booking."
        );
      }

      setBooking(response.data?.booking || response.data?.data);
    } catch (error) {
      console.error("Fetch booking error:", error);

      toast.error(
        getErrorMessage(error, "Failed to load booking details.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const updateStatus = async (status, reason = "") => {
    try {
      setActionLoading(true);

      const response = await api.patch(`/bookings/${id}/status`, {
        status,
        rejectionReason: reason,
      });

      const updatedBooking =
        response.data?.booking || response.data?.data;

      if (updatedBooking) {
        setBooking(updatedBooking);
      } else {
        await fetchBooking();
      }

      if (status === "confirmed") {
        toast.success("Booking confirmed successfully.");
      }

      if (status === "rejected") {
        toast.success("Booking rejected.");
      }

      if (status === "completed") {
        toast.success("Booking marked as completed.");
      }

      setShowRejectModal(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Update booking status error:", error);

      toast.error(
        getErrorMessage(error, "Failed to update booking status.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = () => {
    updateStatus("confirmed");
  };

  const handleComplete = () => {
    updateStatus("completed");
  };

  const handleReject = () => {
    updateStatus("rejected", rejectionReason.trim());
  };

  if (loading) {
    return (
      <div className="owner-booking-details-page">
        <div className="owner-booking-details-container">
          <div className="booking-details-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>

            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="owner-booking-details-page">
        <div className="owner-booking-details-container">
          <div className="booking-not-found">
            <div className="not-found-icon">
              <FaExclamationTriangle />
            </div>

            <h2>Booking not found</h2>

            <p>
              This booking may have been removed or you may not have
              permission to view it.
            </p>

            <button
              type="button"
              className="booking-back-btn"
              onClick={() => navigate("/owner/bookings")}
            >
              <FaArrowLeft />
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = booking.status || "pending";

  const statusConfig =
    STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const paymentStatus =
    booking.paymentStatus || "unpaid";

  const paymentStatusConfig =
    PAYMENT_STATUS_CONFIG[paymentStatus] ||
    PAYMENT_STATUS_CONFIG.unpaid;

  const hall = booking.hall || {};
  const packageData = booking.package || {};
  const customer = booking.customer || {};

  const currency = booking.currency || "EGP";

  return (
    <div className="owner-booking-details-page">
      <div className="owner-booking-details-container">
        {/* Header */}
        <div className="booking-details-header">
          <div className="booking-details-header-left">
            <button
              type="button"
              className="back-icon-btn"
              onClick={() => navigate("/owner/bookings")}
              aria-label="Back"
            >
              <FaArrowLeft />
            </button>

            <div>
              <div className="booking-breadcrumb">
                <Link to="/owner/bookings">Bookings</Link>
                <span>/</span>
                <span>Booking Details</span>
              </div>

              <h1>Booking Details</h1>

              <p>
                Review the booking information and manage its status.
              </p>
            </div>
          </div>

          <div className="booking-header-status">
            <span
              className={`booking-status-badge ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Action Bar */}
        {status === "pending" && (
          <div className="booking-action-bar">
            <div className="action-bar-info">
              <FaClock />

              <div>
                <strong>Booking requires your attention</strong>
                <span>
                  Confirm the booking or reject it with a reason.
                </span>
              </div>
            </div>

            <div className="booking-actions">
              <button
                type="button"
                className="booking-action-btn reject"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <FaTimes />
                Reject
              </button>

              <button
                type="button"
                className="booking-action-btn confirm"
                onClick={handleConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                ) : (
                  <FaCheck />
                )}

                Confirm Booking
              </button>
            </div>
          </div>
        )}

        {status === "confirmed" && (
          <div className="booking-action-bar confirmed-bar">
            <div className="action-bar-info">
              <FaCheckCircle />

              <div>
                <strong>This booking is confirmed</strong>
                <span>
                  Mark it as completed after the event takes place.
                </span>
              </div>
            </div>

            <div className="booking-actions">
              <button
                type="button"
                className="booking-action-btn complete"
                onClick={handleComplete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                ) : (
                  <FaCheckCircle />
                )}

                Mark as Completed
              </button>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="booking-details-grid">
          {/* Main Content */}
          <div className="booking-details-main">
            {/* Event Information */}
            <section className="details-card">
              <div className="details-card-header">
                <div className="details-card-title">
                  <div className="section-icon">
                    <FaCalendarAlt />
                  </div>

                  <div>
                    <h2>Event Information</h2>
                    <p>Important details about the event.</p>
                  </div>
                </div>
              </div>

              <div className="event-main-date">
                <div className="event-date-icon">
                  <FaCalendarAlt />
                </div>

                <div>
                  <span>Event Date</span>
                  <strong>{formatDate(booking.eventDate)}</strong>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">
                    <FaUsers />
                    Guests
                  </span>

                  <strong>{booking.guests || 0} Guests</strong>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <FaBuilding />
                    Hall
                  </span>

                  <strong>{hall.name || "-"}</strong>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <FaBoxOpen />
                    Package
                  </span>

                  <strong>{packageData.name || "-"}</strong>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <FaClock />
                    Booking Created
                  </span>

                  <strong>
                    {formatShortDate(booking.createdAt)}
                  </strong>
                </div>
              </div>
            </section>

            {/* Customer */}
            <section className="details-card">
              <div className="details-card-header">
                <div className="details-card-title">
                  <div className="section-icon">
                    <FaUser />
                  </div>

                  <div>
                    <h2>Customer Information</h2>
                    <p>Contact details of the customer.</p>
                  </div>
                </div>
              </div>

              <div className="customer-profile">
                <div className="customer-avatar">
                  {getInitials(
                    booking.customerName ||
                      customer.name ||
                      "Customer"
                  )}
                </div>

                <div className="customer-profile-info">
                  <h3>
                    {booking.customerName ||
                      customer.name ||
                      "Unknown Customer"}
                  </h3>

                  <span>Booking Customer</span>
                </div>
              </div>

              <div className="customer-contact-list">
                <a
                  href={
                    booking.customerPhone
                      ? `tel:${booking.customerPhone}`
                      : undefined
                  }
                  className="customer-contact-item"
                >
                  <div className="contact-icon">
                    <FaPhone />
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      {booking.customerPhone ||
                        customer.phone ||
                        "-"}
                    </strong>
                  </div>
                </a>

                <a
                  href={
                    booking.customerEmail
                      ? `mailto:${booking.customerEmail}`
                      : undefined
                  }
                  className="customer-contact-item"
                >
                  <div className="contact-icon">
                    <FaEnvelope />
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {booking.customerEmail ||
                        customer.email ||
                        "-"}
                    </strong>
                  </div>
                </a>
              </div>
            </section>

            {/* Hall */}
            <section className="details-card">
              <div className="details-card-header">
                <div className="details-card-title">
                  <div className="section-icon">
                    <FaBuilding />
                  </div>

                  <div>
                    <h2>Hall Information</h2>
                    <p>The hall selected for this booking.</p>
                  </div>
                </div>
              </div>

              <div className="hall-details-content">
                <div className="hall-details-top">
                  {hall.coverImage?.url ? (
                    <img
                      src={hall.coverImage.url}
                      alt={hall.name || "Hall"}
                      className="hall-details-image"
                    />
                  ) : hall.images?.length > 0 &&
                    hall.images[0]?.url ? (
                    <img
                      src={hall.images[0].url}
                      alt={hall.name || "Hall"}
                      className="hall-details-image"
                    />
                  ) : (
                    <div className="hall-image-placeholder">
                      <FaBuilding />
                    </div>
                  )}

                  <div className="hall-details-name">
                    <h3>{hall.name || "-"}</h3>

                    {hall.city && (
                      <span>
                        <FaMapMarkerAlt />
                        {hall.area
                          ? `${hall.area}, ${hall.city}`
                          : hall.city}
                      </span>
                    )}
                  </div>
                </div>

                {hall.address && (
                  <div className="hall-address">
                    <FaMapMarkerAlt />
                    <span>{hall.address}</span>
                  </div>
                )}

                <div className="hall-mini-info">
                  {hall.minCapacity !== undefined &&
                    hall.maxCapacity !== undefined && (
                      <div>
                        <span>Capacity</span>
                        <strong>
                          {hall.minCapacity} - {hall.maxCapacity}
                        </strong>
                      </div>
                    )}

                  {hall.startingPrice !== undefined && (
                    <div>
                      <span>Starting Price</span>
                      <strong>
                        {formatMoney(
                          hall.startingPrice,
                          hall.currency || currency
                        )}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Package */}
            <section className="details-card">
              <div className="details-card-header">
                <div className="details-card-title">
                  <div className="section-icon">
                    <FaBoxOpen />
                  </div>

                  <div>
                    <h2>Package Information</h2>
                    <p>Package selected by the customer.</p>
                  </div>
                </div>
              </div>

              <div className="package-details">
                <div className="package-details-header">
                  <div>
                    <h3>{packageData.name || "-"}</h3>

                    {packageData.description && (
                      <p>{packageData.description}</p>
                    )}
                  </div>

                  {packageData.price !== undefined && (
                    <div className="package-price">
                      {formatMoney(
                        packageData.price,
                        currency
                      )}
                    </div>
                  )}
                </div>

                <div className="package-meta">
                  {packageData.minGuests !== undefined &&
                    packageData.maxGuests !== undefined && (
                      <div>
                        <FaUsers />
                        <span>
                          {packageData.minGuests} -{" "}
                          {packageData.maxGuests} guests
                        </span>
                      </div>
                    )}

                  {packageData.durationHours && (
                    <div>
                      <FaClock />
                      <span>
                        {packageData.durationHours} hours
                      </span>
                    </div>
                  )}
                </div>

                {packageData.features?.length > 0 && (
                  <div className="package-features">
                    <h4>Package Features</h4>

                    <div className="features-list">
                      {packageData.features.map(
                        (feature, index) => (
                          <span key={`${feature}-${index}`}>
                            <FaCheck />
                            {feature}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Notes */}
            {booking.notes && (
              <section className="details-card">
                <div className="details-card-header">
                  <div className="details-card-title">
                    <div className="section-icon">
                      <FaExclamationTriangle />
                    </div>

                    <div>
                      <h2>Customer Notes</h2>
                      <p>Additional information from the customer.</p>
                    </div>
                  </div>
                </div>

                <div className="booking-notes">
                  {booking.notes}
                </div>
              </section>
            )}

            {/* Rejection Reason */}
            {booking.cancellationReason && (
              <section className="details-card rejection-card">
                <div className="details-card-header">
                  <div className="details-card-title">
                    <div className="section-icon">
                      <FaBan />
                    </div>

                    <div>
                      <h2>Rejection / Cancellation Reason</h2>
                    </div>
                  </div>
                </div>

                <div className="booking-rejection-reason">
                  {booking.cancellationReason}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="booking-details-sidebar">
            {/* Financial Summary */}
            <section className="details-card financial-card">
              <div className="details-card-header">
                <div className="details-card-title">
                  <div className="section-icon">
                    <FaMoneyBillWave />
                  </div>

                  <div>
                    <h2>Payment Summary</h2>
                    <p>Booking financial details.</p>
                  </div>
                </div>
              </div>

              <div className="financial-list">
                <div className="financial-row">
                  <span>Package Price</span>

                  <strong>
                    {formatMoney(
                      booking.packagePrice,
                      currency
                    )}
                  </strong>
                </div>

                <div className="financial-row">
                  <span>Extra Amount</span>

                  <strong>
                    {formatMoney(
                      booking.extraAmount,
                      currency
                    )}
                  </strong>
                </div>

                <div className="financial-row">
                  <span>Discount</span>

                  <strong className="discount-value">
                    -{" "}
                    {formatMoney(
                      booking.discountAmount,
                      currency
                    )}
                  </strong>
                </div>

                <div className="financial-divider" />

                <div className="financial-total">
                  <span>Total</span>

                  <strong>
                    {formatMoney(
                      booking.totalAmount,
                      currency
                    )}
                  </strong>
                </div>
              </div>

              <div className="payment-status-box">
                <div className="payment-status-header">
                  <span>Payment Status</span>

                  <span
                    className={`payment-status-badge ${paymentStatusConfig.className}`}
                  >
                    {paymentStatusConfig.label}
                  </span>
                </div>

                <div className="payment-method">
                  <FaCreditCard />

                  <span>
                    {PAYMENT_METHOD_LABELS[
                      booking.paymentMethod
                    ] || booking.paymentMethod || "-"}
                  </span>
                </div>
              </div>
            </section>

            {/* Status Timeline */}
            <section className="details-card timeline-card">
              <div className="details-card-header">
                <div className="details-card-title">
                  <div className="section-icon">
                    <FaClock />
                  </div>

                  <div>
                    <h2>Booking Timeline</h2>
                    <p>Status history.</p>
                  </div>
                </div>
              </div>

              <div className="booking-timeline">
                <div className="timeline-item active">
                  <div className="timeline-dot">
                    <FaCheck />
                  </div>

                  <div className="timeline-content">
                    <strong>Booking Created</strong>
                    <span>
                      {formatShortDate(booking.createdAt)}
                    </span>
                  </div>
                </div>

                {booking.confirmedAt && (
                  <div className="timeline-item active">
                    <div className="timeline-dot">
                      <FaCheck />
                    </div>

                    <div className="timeline-content">
                      <strong>Booking Confirmed</strong>
                      <span>
                        {formatShortDate(
                          booking.confirmedAt
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {booking.cancelledAt && (
                  <div className="timeline-item rejected">
                    <div className="timeline-dot">
                      <FaTimes />
                    </div>

                    <div className="timeline-content">
                      <strong>
                        {status === "rejected"
                          ? "Booking Rejected"
                          : "Booking Cancelled"}
                      </strong>

                      <span>
                        {formatShortDate(
                          booking.cancelledAt
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {booking.completedAt && (
                  <div className="timeline-item active">
                    <div className="timeline-dot">
                      <FaCheckCircle />
                    </div>

                    <div className="timeline-content">
                      <strong>Booking Completed</strong>

                      <span>
                        {formatShortDate(
                          booking.completedAt
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Contact */}
            <section className="details-card quick-contact-card">
              <h3>Quick Contact</h3>

              <p>
                Contact the customer directly if you need
                additional information.
              </p>

              <div className="quick-contact-actions">
                {booking.customerPhone && (
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="quick-contact-btn"
                  >
                    <FaPhone />
                    Call Customer
                  </a>
                )}

                {booking.customerEmail && (
                  <a
                    href={`mailto:${booking.customerEmail}`}
                    className="quick-contact-btn secondary"
                  >
                    <FaEnvelope />
                    Send Email
                  </a>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="owner-booking-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !actionLoading
            ) {
              setShowRejectModal(false);
            }
          }}
        >
          <div className="owner-booking-modal">
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-warning-icon">
                  <FaTimes />
                </div>

                <div>
                  <h3>Reject Booking</h3>
                  <p>
                    Are you sure you want to reject this booking?
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <label htmlFor="rejectionReason">
                Rejection Reason
                <span>Optional</span>
              </label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(event.target.value)
                }
                placeholder="Write a reason for rejecting this booking..."
                maxLength={1000}
                rows={5}
                disabled={actionLoading}
              />

              <div className="textarea-counter">
                {rejectionReason.length}/1000
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-reject-btn"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                ) : (
                  <FaTimes />
                )}

                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookingDetails;