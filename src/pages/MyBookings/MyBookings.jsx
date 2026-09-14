import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axios";
import "./MyBookings.css";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          state: {
            from: {
              pathname: "/my-bookings",
            },
          },
        });

        return;
      }

      const response = await api.get("/bookings/my");

      const data = response.data;

      const bookingList =
        data?.bookings ||
        data?.data?.bookings ||
        data?.data ||
        [];

      setBookings(Array.isArray(bookingList) ? bookingList : []);
    } catch (err) {
      console.error("MY BOOKINGS ERROR:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");

        navigate("/login", {
          state: {
            from: {
              pathname: "/my-bookings",
            },
          },
        });

        return;
      }

      const message =
        err.response?.data?.message ||
        "Failed to load your bookings";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price, currency = "EGP") => {
    return `${Number(price || 0).toLocaleString("en-EG")} ${currency}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "booking-status confirmed";

      case "pending":
        return "booking-status pending";

      case "completed":
        return "booking-status completed";

      case "cancelled":
        return "booking-status cancelled";

      case "rejected":
        return "booking-status rejected";

      default:
        return "booking-status";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";

      case "pending":
        return "Pending";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      case "rejected":
        return "Rejected";

      default:
        return status || "Unknown";
    }
  };

  const getPaymentLabel = (status) => {
    switch (status) {
      case "paid":
        return "Paid";

      case "pending":
        return "Payment Pending";

      case "failed":
        return "Payment Failed";

      case "refunded":
        return "Refunded";

      case "unpaid":
        return "Unpaid";

      default:
        return status || "Unknown";
    }
  };

  if (loading) {
    return (
      <main className="my-bookings-page">
        <div className="my-bookings-loading">
          <div className="my-bookings-spinner" />
          <p>Loading your bookings...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="my-bookings-page">
        <section className="my-bookings-state">
          <div className="state-icon">!</div>

          <h2>Unable to load bookings</h2>

          <p>{error}</p>

          <button
            type="button"
            className="retry-bookings-button"
            onClick={fetchBookings}
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="my-bookings-page">
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <div>
            <span className="my-bookings-eyebrow">
              YOUR RESERVATIONS
            </span>

            <h1>My Bookings</h1>

            <p>
              Keep track of your wedding hall reservations and
              booking details.
            </p>
          </div>

          <Link to="/halls" className="browse-halls-button">
            Browse Halls
          </Link>
        </div>

        {bookings.length === 0 ? (
          <section className="my-bookings-empty">
            <div className="empty-icon">♡</div>

            <h2>No bookings yet</h2>

            <p>
              You haven't made any reservations yet.
              Find your perfect wedding hall and book your
              special day.
            </p>

            <Link to="/halls" className="empty-action">
              Explore Wedding Halls
            </Link>
          </section>
        ) : (
          <section className="bookings-list">
            {bookings.map((booking) => {
              const hall =
                typeof booking.hall === "object"
                  ? booking.hall
                  : null;

              const packageData =
                typeof booking.package === "object"
                  ? booking.package
                  : null;

              const hallName =
                hall?.name || "Wedding Hall";

              const packageName =
                packageData?.name || "Wedding Package";

              const hallImage =
                hall?.coverImage?.url ||
                hall?.images?.[0]?.url ||
                null;

              return (
                <article
                  className="booking-card"
                  key={booking._id}
                >
                  <div className="booking-card-image">
                    {hallImage ? (
                      <img
                        src={hallImage}
                        alt={hallName}
                      />
                    ) : (
                      <div className="booking-image-placeholder">
                        <span>♡</span>
                      </div>
                    )}
                  </div>

                  <div className="booking-card-content">
                    <div className="booking-card-top">
                      <div>
                        <span className="booking-label">
                          BOOKING
                        </span>

                        <h2>{hallName}</h2>

                        <p className="booking-package">
                          {packageName}
                        </p>
                      </div>

                      <span
                        className={getStatusClass(
                          booking.status
                        )}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="booking-info-grid">
                      <div className="booking-info-item">
                        <span>Date</span>
                        <strong>
                          {formatDate(
                            booking.eventDate
                          )}
                        </strong>
                      </div>

                      <div className="booking-info-item">
                        <span>Guests</span>
                        <strong>
                          {booking.guests || 0}
                        </strong>
                      </div>

                      <div className="booking-info-item">
                        <span>Total</span>
                        <strong>
                          {formatPrice(
                            booking.totalAmount,
                            booking.currency
                          )}
                        </strong>
                      </div>

                      <div className="booking-info-item">
                        <span>Payment</span>
                        <strong>
                          {getPaymentLabel(
                            booking.paymentStatus
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-card-bottom">
                      <div className="booking-id">
                        Booking ID:
                        <span>
                          {booking._id}
                        </span>
                      </div>

                      <Link
                        to={`/bookings/${booking._id}`}
                        className="view-booking-button"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default MyBookings;