import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./BookingDetails.css";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", {
            state: {
              from: `/bookings/${id}`,
            },
          });

          return;
        }

        const response = await api.get(`/bookings/${id}`);

        if (response.data?.success) {
          setBooking(
            response.data.booking ||
              response.data.data ||
              null
          );
        } else {
          throw new Error(
            response.data?.message ||
              "Unable to load booking details."
          );
        }
      } catch (err) {
        console.error("Booking details error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");

          navigate("/login", {
            state: {
              from: `/bookings/${id}`,
            },
          });

          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Something went wrong while loading your booking."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id, navigate]);

  const formatPrice = (price) => {
    if (
      price === null ||
      price === undefined
    ) {
      return "—";
    }

    return `${Number(price).toLocaleString(
      "en-US"
    )} EGP`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending Confirmation";

      case "confirmed":
        return "Confirmed";

      case "rejected":
        return "Rejected";

      case "cancelled":
        return "Cancelled";

      case "completed":
        return "Completed";

      default:
        return status || "Unknown";
    }
  };

  const getPaymentStatusLabel = (
    paymentStatus
  ) => {
    switch (paymentStatus) {
      case "unpaid":
        return "Unpaid";

      case "pending":
        return "Payment Pending";

      case "paid":
        return "Paid";

      case "failed":
        return "Payment Failed";

      case "refunded":
        return "Refunded";

      default:
        return paymentStatus || "Unknown";
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    const reasonInput = window.prompt(
      "Please enter a reason for cancellation:"
    );

    if (reasonInput === null) {
      return;
    }

    const reason =
      reasonInput.trim() ||
      "Cancelled by customer";

    try {
      setCancelling(true);
      setCancelError("");

      const response = await api.patch(
        `/bookings/${id}/cancel`,
        {
          reason,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to cancel this booking."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Refresh Booking
      |--------------------------------------------------------------------------
      */

      const bookingResponse =
        await api.get(`/bookings/${id}`);

      if (bookingResponse.data?.success) {
        setBooking(
          bookingResponse.data.booking ||
            bookingResponse.data.data ||
            null
        );
      }
    } catch (err) {
      console.error(
        "Cancel booking error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");

        navigate("/login", {
          state: {
            from: `/bookings/${id}`,
          },
        });

        return;
      }

      setCancelError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while cancelling the booking."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-loading">
          <div className="booking-details-spinner" />

          <p>
            Loading your booking...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-state">
          <div className="booking-details-state-icon">
            !
          </div>

          <h2>
            Booking Not Found
          </h2>

          <p>
            {error ||
              "We couldn't find this booking."}
          </p>

          <Link
            to="/halls"
            className="booking-details-back-button"
          >
            Browse Wedding Halls
          </Link>
        </div>
      </div>
    );
  }

  const hall =
    booking.hall || {};

  const packageData =
    booking.package || {};

  const hallName =
    hall.name ||
    booking.hallName ||
    "Wedding Hall";

  const packageName =
    packageData.name ||
    booking.packageName ||
    "Wedding Package";

  const hallImage =
    hall.coverImage?.url ||
    hall.image?.url ||
    null;

  const canCancel =
    booking.status === "pending" ||
    booking.status === "confirmed";

  return (
    <div className="booking-details-page">
      <div className="booking-details-container">

        {/* =========================
            SUCCESS HEADER
        ========================= */}

        <section className="booking-success-header">
          <div className="booking-success-icon">
            ✓
          </div>

          <div>
            <span className="booking-success-label">
              BOOKING REQUEST
            </span>

            <h1>
              Your Booking Has Been Submitted
            </h1>

            <p>
              Your booking request has been
              successfully received. The hall
              owner will review it and update
              the booking status.
            </p>
          </div>
        </section>

        {/* =========================
            BOOKING STATUS
        ========================= */}

        <section className="booking-status-card">
          <div className="booking-status-main">
            <div>
              <span className="booking-card-label">
                BOOKING STATUS
              </span>

              <strong
                className={`booking-status booking-status-${booking.status}`}
              >
                {getStatusLabel(
                  booking.status
                )}
              </strong>
            </div>

            <div className="booking-reference">
              <span className="booking-card-label">
                BOOKING ID
              </span>

              <strong>
                {booking._id}
              </strong>
            </div>
          </div>
        </section>

        {/* =========================
            MAIN GRID
        ========================= */}

        <div className="booking-details-grid">

          {/* =========================
              LEFT
          ========================= */}

          <div className="booking-details-main">

            {/* Hall */}
            <section className="booking-info-card">
              <div className="booking-card-heading">
                <span className="booking-card-label">
                  VENUE
                </span>

                <h2>
                  Wedding Hall
                </h2>
              </div>

              <div className="booking-hall">
                {hallImage ? (
                  <img
                    src={hallImage}
                    alt={hallName}
                  />
                ) : (
                  <div className="booking-hall-placeholder">
                    W
                  </div>
                )}

                <div>
                  <h3>
                    {hallName}
                  </h3>

                  {(hall.address ||
                    hall.city) && (
                    <p>
                      ⌖{" "}
                      {hall.address ||
                        hall.city}

                      {hall.address &&
                        hall.city
                        ? `, ${hall.city}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Package */}
            <section className="booking-info-card">
              <div className="booking-card-heading">
                <span className="booking-card-label">
                  SELECTED PACKAGE
                </span>

                <h2>
                  {packageName}
                </h2>
              </div>

              {packageData.description && (
                <p className="booking-description">
                  {packageData.description}
                </p>
              )}

              <div className="booking-package-details">

                <div>
                  <span>
                    Package Price
                  </span>

                  <strong>
                    {formatPrice(
                      booking.packagePrice
                    )}
                  </strong>
                </div>

                {booking.guests && (
                  <div>
                    <span>
                      Guests
                    </span>

                    <strong>
                      {booking.guests}
                    </strong>
                  </div>
                )}

                {packageData.durationHours && (
                  <div>
                    <span>
                      Duration
                    </span>

                    <strong>
                      {
                        packageData.durationHours
                      }{" "}
                      hours
                    </strong>
                  </div>
                )}
              </div>

              {packageData.features?.length >
                0 && (
                <div className="booking-features">
                  {packageData.features.map(
                    (feature) => (
                      <span
                        key={feature}
                      >
                        ✓ {feature}
                      </span>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Event */}
            <section className="booking-info-card">
              <div className="booking-card-heading">
                <span className="booking-card-label">
                  EVENT DETAILS
                </span>

                <h2>
                  Your Celebration
                </h2>
              </div>

              <div className="booking-event-grid">

                <div className="booking-event-item">
                  <span>
                    Event Date
                  </span>

                  <strong>
                    {formatDate(
                      booking.eventDate
                    )}
                  </strong>
                </div>

                <div className="booking-event-item">
                  <span>
                    Number of Guests
                  </span>

                  <strong>
                    {booking.guests}
                  </strong>
                </div>

                <div className="booking-event-item">
                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {booking.paymentMethod
                      ? booking.paymentMethod
                          .charAt(0)
                          .toUpperCase() +
                        booking.paymentMethod.slice(
                          1
                        )
                      : "—"}
                  </strong>
                </div>

                <div className="booking-event-item">
                  <span>
                    Payment Status
                  </span>

                  <strong>
                    {getPaymentStatusLabel(
                      booking.paymentStatus
                    )}
                  </strong>
                </div>
              </div>

              {booking.notes && (
                <div className="booking-notes">
                  <span>
                    Notes
                  </span>

                  <p>
                    {booking.notes}
                  </p>
                </div>
              )}

              {booking.status ===
                "cancelled" &&
                booking.cancellationReason && (
                  <div className="booking-cancellation-note">
                    <span>
                      Cancellation Reason
                    </span>

                    <p>
                      {
                        booking.cancellationReason
                      }
                    </p>
                  </div>
                )}
            </section>

          </div>

          {/* =========================
              RIGHT SUMMARY
          ========================= */}

          <aside className="booking-summary-card">

            <span className="booking-card-label">
              PRICE SUMMARY
            </span>

            <h2>
              Booking Summary
            </h2>

            <div className="booking-summary-lines">

              <div>
                <span>
                  Package
                </span>

                <strong>
                  {formatPrice(
                    booking.packagePrice
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Extra Amount
                </span>

                <strong>
                  {formatPrice(
                    booking.extraAmount || 0
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Discount
                </span>

                <strong>
                  -{" "}
                  {formatPrice(
                    booking.discountAmount || 0
                  )}
                </strong>
              </div>

            </div>

            <div className="booking-summary-total">
              <span>
                Total Amount
              </span>

              <strong>
                {formatPrice(
                  booking.totalAmount
                )}
              </strong>
            </div>

            <div className="booking-summary-payment">
              <span>
                Payment
              </span>

              <strong>
                {booking.paymentMethod
                  ? booking.paymentMethod
                      .charAt(0)
                      .toUpperCase() +
                    booking.paymentMethod.slice(
                      1
                    )
                  : "—"}
              </strong>
            </div>

            <div className="booking-created">
              Booking created

              <strong>
                {formatDateTime(
                  booking.createdAt
                )}
              </strong>
            </div>

          </aside>
        </div>

        {/* =========================
            CUSTOMER INFO
        ========================= */}

        <section className="booking-info-card booking-customer-card">
          <div className="booking-card-heading">
            <span className="booking-card-label">
              CUSTOMER
            </span>

            <h2>
              Contact Information
            </h2>
          </div>

          <div className="booking-customer-grid">

            <div>
              <span>
                Name
              </span>

              <strong>
                {booking.customerName ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>
                Phone
              </span>

              <strong>
                {booking.customerPhone ||
                  "—"}
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {booking.customerEmail ||
                  "—"}
              </strong>
            </div>

          </div>
        </section>

        {/* =========================
            CANCEL ERROR
        ========================= */}

        {cancelError && (
          <div className="booking-cancel-error">
            {cancelError}
          </div>
        )}

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="booking-details-actions">

          {canCancel && (
            <button
              type="button"
              className="booking-cancel-button"
              onClick={handleCancelBooking}
              disabled={cancelling}
            >
              {cancelling
                ? "Cancelling..."
                : "Cancel Booking"}
            </button>
          )}

          <Link
            to="/halls"
            className="booking-secondary-button"
          >
            Browse More Halls
          </Link>

          <button
            type="button"
            className="booking-primary-button"
            onClick={() =>
              navigate("/my-bookings")
            }
          >
            My Bookings
          </button>

        </div>

      </div>
    </div>
  );
};

export default BookingDetails;