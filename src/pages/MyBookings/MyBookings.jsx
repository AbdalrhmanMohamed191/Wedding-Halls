// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// import api from "../../api/axios";
// import "./MyBookings.css";

// const MyBookings = () => {
//   const navigate = useNavigate();

//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchBookings = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("token");

//       if (!token) {
//         navigate("/login", {
//           state: {
//             from: {
//               pathname: "/my-bookings",
//             },
//           },
//         });

//         return;
//       }

//       const response = await api.get("/bookings/my");

//       const data = response.data;

//       const bookingList =
//         data?.bookings ||
//         data?.data?.bookings ||
//         data?.data ||
//         [];

//       setBookings(Array.isArray(bookingList) ? bookingList : []);
//     } catch (err) {
//       console.error("MY BOOKINGS ERROR:", err);

//       if (err.response?.status === 401) {
//         localStorage.removeItem("token");

//         navigate("/login", {
//           state: {
//             from: {
//               pathname: "/my-bookings",
//             },
//           },
//         });

//         return;
//       }

//       const message =
//         err.response?.data?.message ||
//         "Failed to load your bookings";

//       setError(message);
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBookings();
//   }, []);

//   const formatDate = (date) => {
//     if (!date) return "—";

//     return new Date(date).toLocaleDateString("en-EG", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const formatPrice = (price, currency = "EGP") => {
//     return `${Number(price || 0).toLocaleString("en-EG")} ${currency}`;
//   };

//   const getStatusClass = (status) => {
//     switch (status) {
//       case "confirmed":
//         return "booking-status confirmed";

//       case "pending":
//         return "booking-status pending";

//       case "completed":
//         return "booking-status completed";

//       case "cancelled":
//         return "booking-status cancelled";

//       case "rejected":
//         return "booking-status rejected";

//       default:
//         return "booking-status";
//     }
//   };

//   const getStatusLabel = (status) => {
//     switch (status) {
//       case "confirmed":
//         return "Confirmed";

//       case "pending":
//         return "Pending";

//       case "completed":
//         return "Completed";

//       case "cancelled":
//         return "Cancelled";

//       case "rejected":
//         return "Rejected";

//       default:
//         return status || "Unknown";
//     }
//   };

//   const getPaymentLabel = (status) => {
//     switch (status) {
//       case "paid":
//         return "Paid";

//       case "pending":
//         return "Payment Pending";

//       case "failed":
//         return "Payment Failed";

//       case "refunded":
//         return "Refunded";

//       case "unpaid":
//         return "Unpaid";

//       default:
//         return status || "Unknown";
//     }
//   };

//   if (loading) {
//     return (
//       <main className="my-bookings-page">
//         <div className="my-bookings-loading">
//           <div className="my-bookings-spinner" />
//           <p>Loading your bookings...</p>
//         </div>
//       </main>
//     );
//   }

//   if (error) {
//     return (
//       <main className="my-bookings-page">
//         <section className="my-bookings-state">
//           <div className="state-icon">!</div>

//           <h2>Unable to load bookings</h2>

//           <p>{error}</p>

//           <button
//             type="button"
//             className="retry-bookings-button"
//             onClick={fetchBookings}
//           >
//             Try Again
//           </button>
//         </section>
//       </main>
//     );
//   }

//   return (
//     <main className="my-bookings-page">
//       <div className="my-bookings-container">
//         <div className="my-bookings-header">
//           <div>
//             <span className="my-bookings-eyebrow">
//               YOUR RESERVATIONS
//             </span>

//             <h1>My Bookings</h1>

//             <p>
//               Keep track of your wedding hall reservations and
//               booking details.
//             </p>
//           </div>

//           <Link to="/halls" className="browse-halls-button">
//             Browse Halls
//           </Link>
//         </div>

//         {bookings.length === 0 ? (
//           <section className="my-bookings-empty">
//             <div className="empty-icon">♡</div>

//             <h2>No bookings yet</h2>

//             <p>
//               You haven't made any reservations yet.
//               Find your perfect wedding hall and book your
//               special day.
//             </p>

//             <Link to="/halls" className="empty-action">
//               Explore Wedding Halls
//             </Link>
//           </section>
//         ) : (
//           <section className="bookings-list">
//             {bookings.map((booking) => {
//               const hall =
//                 typeof booking.hall === "object"
//                   ? booking.hall
//                   : null;

//               const packageData =
//                 typeof booking.package === "object"
//                   ? booking.package
//                   : null;

//               const hallName =
//                 hall?.name || "Wedding Hall";

//               const packageName =
//                 packageData?.name || "Wedding Package";

//               const hallImage =
//                 hall?.coverImage?.url ||
//                 hall?.images?.[0]?.url ||
//                 null;

//               return (
//                 <article
//                   className="booking-card"
//                   key={booking._id}
//                 >
//                   <div className="booking-card-image">
//                     {hallImage ? (
//                       <img
//                         src={hallImage}
//                         alt={hallName}
//                       />
//                     ) : (
//                       <div className="booking-image-placeholder">
//                         <span>♡</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="booking-card-content">
//                     <div className="booking-card-top">
//                       <div>
//                         <span className="booking-label">
//                           BOOKING
//                         </span>

//                         <h2>{hallName}</h2>

//                         <p className="booking-package">
//                           {packageName}
//                         </p>
//                       </div>

//                       <span
//                         className={getStatusClass(
//                           booking.status
//                         )}
//                       >
//                         {getStatusLabel(booking.status)}
//                       </span>
//                     </div>

//                     <div className="booking-info-grid">
//                       <div className="booking-info-item">
//                         <span>Date</span>
//                         <strong>
//                           {formatDate(
//                             booking.eventDate
//                           )}
//                         </strong>
//                       </div>

//                       <div className="booking-info-item">
//                         <span>Guests</span>
//                         <strong>
//                           {booking.guests || 0}
//                         </strong>
//                       </div>

//                       <div className="booking-info-item">
//                         <span>Total</span>
//                         <strong>
//                           {formatPrice(
//                             booking.totalAmount,
//                             booking.currency
//                           )}
//                         </strong>
//                       </div>

//                       <div className="booking-info-item">
//                         <span>Payment</span>
//                         <strong>
//                           {getPaymentLabel(
//                             booking.paymentStatus
//                           )}
//                         </strong>
//                       </div>
//                     </div>

//                     <div className="booking-card-bottom">
//                       <div className="booking-id">
//                         Booking ID:
//                         <span>
//                           {booking._id}
//                         </span>
//                       </div>

//                       <Link
//                         to={`/bookings/${booking._id}`}
//                         className="view-booking-button"
//                       >
//                         View Details
//                       </Link>
//                     </div>
//                   </div>
//                 </article>
//               );
//             })}
//           </section>
//         )}
//       </div>
//     </main>
//   );
// };

// export default MyBookings;


import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axios";
import "./MyBookings.css";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Review Modal
  |--------------------------------------------------------------------------
  */

  const [reviewModalOpen, setReviewModalOpen] =
    useState(false);

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [selectedReview, setSelectedReview] =
    useState(null);

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch Bookings + Reviews
  |--------------------------------------------------------------------------
  */

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

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

      const [
        bookingsResponse,
        reviewsResponse,
      ] = await Promise.all([
        api.get("/bookings/my"),
        api.get("/reviews/my"),
      ]);

      /*
      |----------------------------------------------------------------------
      | Bookings
      |----------------------------------------------------------------------
      */

      const bookingData =
        bookingsResponse.data;

      const bookingList =
        bookingData?.bookings ||
        bookingData?.data?.bookings ||
        bookingData?.data ||
        [];

      setBookings(
        Array.isArray(bookingList)
          ? bookingList
          : []
      );

      /*
      |----------------------------------------------------------------------
      | Reviews
      |----------------------------------------------------------------------
      */

      const reviewData =
        reviewsResponse.data;

      const reviewList =
        reviewData?.reviews ||
        reviewData?.data?.reviews ||
        reviewData?.data ||
        [];

      setReviews(
        Array.isArray(reviewList)
          ? reviewList
          : []
      );
    } catch (err) {
      console.error(
        "MY BOOKINGS ERROR:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        navigate("/login", {
          state: {
            from: {
              pathname:
                "/my-bookings",
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

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(
      date
    ).toLocaleDateString("en-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (
    price,
    currency = "EGP"
  ) => {
    return `${Number(
      price || 0
    ).toLocaleString(
      "en-EG"
    )} ${currency}`;
  };

  const getStatusClass = (
    status
  ) => {
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

  const getStatusLabel = (
    status
  ) => {
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

  const getPaymentLabel = (
    status
  ) => {
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

  /*
  |--------------------------------------------------------------------------
  | Find Review For Booking
  |--------------------------------------------------------------------------
  */

  const getBookingReview = (
    bookingId
  ) => {
    return (
      reviews.find(
        (review) => {
          const reviewBooking =
            review.booking;

          const reviewBookingId =
            typeof reviewBooking ===
            "object"
              ? reviewBooking?._id
              : reviewBooking;

          return (
            String(
              reviewBookingId
            ) === String(bookingId)
          );
        }
      ) || null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Open Create Review
  |--------------------------------------------------------------------------
  */

  const openCreateReview = (
    booking
  ) => {
    setSelectedBooking(
      booking
    );

    setSelectedReview(null);

    setReviewRating(0);

    setReviewComment("");

    setReviewModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Open Edit Review
  |--------------------------------------------------------------------------
  */

  const openEditReview = (
    booking,
    review
  ) => {
    setSelectedBooking(
      booking
    );

    setSelectedReview(review);

    setReviewRating(
      review.rating || 0
    );

    setReviewComment(
      review.comment || ""
    );

    setReviewModalOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Modal
  |--------------------------------------------------------------------------
  */

  const closeReviewModal = () => {
    if (reviewSubmitting) return;

    setReviewModalOpen(false);

    setSelectedBooking(null);

    setSelectedReview(null);

    setReviewRating(0);

    setReviewComment("");
  };

  /*
  |--------------------------------------------------------------------------
  | Submit Review
  |--------------------------------------------------------------------------
  */

  const handleSubmitReview =
    async (event) => {
      event.preventDefault();

      if (!selectedBooking) {
        return;
      }

      if (
        reviewRating < 1 ||
        reviewRating > 5
      ) {
        toast.error(
          "Please select a rating."
        );

        return;
      }

      if (
        reviewComment.trim().length >
        2000
      ) {
        toast.error(
          "Comment cannot exceed 2000 characters."
        );

        return;
      }

      try {
        setReviewSubmitting(true);

        /*
        |--------------------------------------------------------------------
        | Update
        |--------------------------------------------------------------------
        */

        if (selectedReview) {
          const response =
            await api.patch(
              `/reviews/${selectedReview._id}`,
              {
                rating:
                  reviewRating,
                comment:
                  reviewComment.trim(),
              }
            );

          const updatedReview =
            response.data?.review;

          setReviews(
            (currentReviews) =>
              currentReviews.map(
                (review) =>
                  review._id ===
                  selectedReview._id
                    ? updatedReview ||
                      {
                        ...review,
                        rating:
                          reviewRating,
                        comment:
                          reviewComment.trim(),
                      }
                    : review
              )
          );

          toast.success(
            "Review updated successfully."
          );
        } else {
          /*
          |------------------------------------------------------------------
          | Create
          |------------------------------------------------------------------
          */

          const response =
            await api.post(
              "/reviews",
              {
                bookingId:
                  selectedBooking._id,
                rating:
                  reviewRating,
                comment:
                  reviewComment.trim(),
              }
            );

          const createdReview =
            response.data?.review;

          if (createdReview) {
            setReviews(
              (currentReviews) => [
                createdReview,
                ...currentReviews,
              ]
            );
          } else {
            await fetchBookings();
          }

          toast.success(
            "Review submitted successfully."
          );
        }

        closeReviewModal();
      } catch (err) {
        console.error(
          "REVIEW SUBMIT ERROR:",
          err
        );

        toast.error(
          err.response?.data
            ?.message ||
            "Failed to save review."
        );
      } finally {
        setReviewSubmitting(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Delete Review
  |--------------------------------------------------------------------------
  */

  const handleDeleteReview =
    async (review) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this review?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await api.delete(
          `/reviews/${review._id}`
        );

        setReviews(
          (currentReviews) =>
            currentReviews.filter(
              (item) =>
                item._id !==
                review._id
            )
        );

        toast.success(
          "Review deleted successfully."
        );
      } catch (err) {
        console.error(
          "DELETE REVIEW ERROR:",
          err
        );

        toast.error(
          err.response?.data
            ?.message ||
            "Failed to delete review."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="my-bookings-page">
        <div className="my-bookings-loading">
          <div className="my-bookings-spinner" />

          <p>
            Loading your bookings...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <main className="my-bookings-page">
        <section className="my-bookings-state">
          <div className="state-icon">
            !
          </div>

          <h2>
            Unable to load bookings
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="retry-bookings-button"
            onClick={
              fetchBookings
            }
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

        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="my-bookings-header">
          <div>
            <span className="my-bookings-eyebrow">
              YOUR RESERVATIONS
            </span>

            <h1>
              My Bookings
            </h1>

            <p>
              Keep track of your wedding hall
              reservations and booking details.
            </p>
          </div>

          <Link
            to="/halls"
            className="browse-halls-button"
          >
            Browse Halls
          </Link>
        </div>

        {/* =========================================================
            EMPTY
        ========================================================= */}

        {bookings.length === 0 ? (
          <section className="my-bookings-empty">
            <div className="empty-icon">
              ♡
            </div>

            <h2>
              No bookings yet
            </h2>

            <p>
              You haven't made any
              reservations yet. Find your
              perfect wedding hall and book
              your special day.
            </p>

            <Link
              to="/halls"
              className="empty-action"
            >
              Explore Wedding Halls
            </Link>
          </section>
        ) : (
          <section className="bookings-list">
            {bookings.map(
              (booking) => {
                const hall =
                  typeof booking.hall ===
                  "object"
                    ? booking.hall
                    : null;

                const packageData =
                  typeof booking.package ===
                  "object"
                    ? booking.package
                    : null;

                const hallName =
                  hall?.name ||
                  "Wedding Hall";

                const packageName =
                  packageData?.name ||
                  "Wedding Package";

                const hallImage =
                  hall?.coverImage
                    ?.url ||
                  hall?.images?.[0]
                    ?.url ||
                  null;

                const bookingReview =
                  getBookingReview(
                    booking._id
                  );

                const canReview =
                  booking.status ===
                  "completed";

                return (
                  <article
                    className="booking-card"
                    key={booking._id}
                  >
                    {/* =================================================
                        IMAGE
                    ================================================= */}

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

                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="booking-card-content">
                      <div className="booking-card-top">
                        <div>
                          <span className="booking-label">
                            BOOKING
                          </span>

                          <h2>
                            {hallName}
                          </h2>

                          <p className="booking-package">
                            {packageName}
                          </p>
                        </div>

                        <span
                          className={getStatusClass(
                            booking.status
                          )}
                        >
                          {getStatusLabel(
                            booking.status
                          )}
                        </span>
                      </div>

                      {/* =================================================
                          INFO
                      ================================================= */}

                      <div className="booking-info-grid">
                        <div className="booking-info-item">
                          <span>
                            Date
                          </span>

                          <strong>
                            {formatDate(
                              booking.eventDate
                            )}
                          </strong>
                        </div>

                        <div className="booking-info-item">
                          <span>
                            Guests
                          </span>

                          <strong>
                            {booking.guests ||
                              0}
                          </strong>
                        </div>

                        <div className="booking-info-item">
                          <span>
                            Total
                          </span>

                          <strong>
                            {formatPrice(
                              booking.totalAmount,
                              booking.currency
                            )}
                          </strong>
                        </div>

                        <div className="booking-info-item">
                          <span>
                            Payment
                          </span>

                          <strong>
                            {getPaymentLabel(
                              booking.paymentStatus
                            )}
                          </strong>
                        </div>
                      </div>

                      {/* =================================================
                          REVIEW
                      ================================================= */}

                      {canReview && (
                        <div className="booking-review-area">
                          {bookingReview ? (
                            <>
                              <div className="booking-review-existing">
                                <div>
                                  <span>
                                    Your Review
                                  </span>

                                  <div className="booking-review-stars">
                                    {[1, 2, 3, 4, 5].map(
                                      (star) => (
                                        <span
                                          key={
                                            star
                                          }
                                          className={
                                            star <=
                                            bookingReview.rating
                                              ? "active"
                                              : ""
                                          }
                                        >
                                          ★
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>

                                <div className="booking-review-actions">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditReview(
                                        booking,
                                        bookingReview
                                      )
                                    }
                                  >
                                    Edit Review
                                  </button>

                                  <button
                                    type="button"
                                    className="delete-review-button"
                                    onClick={() =>
                                      handleDeleteReview(
                                        bookingReview
                                      )
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {bookingReview.comment && (
                                <p className="booking-review-comment">
                                  "{bookingReview.comment}"
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="booking-review-prompt">
                              <div>
                                <strong>
                                  How was your experience?
                                </strong>

                                <p>
                                  Your review helps
                                  other couples choose
                                  the right venue.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openCreateReview(
                                    booking
                                  )
                                }
                              >
                                ★ Rate This Hall
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* =================================================
                          BOTTOM
                      ================================================= */}

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
              }
            )}
          </section>
        )}
      </div>

      {/* =========================================================
          REVIEW MODAL
      ========================================================= */}

      {reviewModalOpen && (
        <div
          className="review-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeReviewModal();
            }
          }}
        >
          <div className="review-modal">
            <button
              type="button"
              className="review-modal-close"
              onClick={
                closeReviewModal
              }
              disabled={
                reviewSubmitting
              }
            >
              ×
            </button>

            <div className="review-modal-header">
              <span>
                {selectedReview
                  ? "YOUR REVIEW"
                  : "SHARE YOUR EXPERIENCE"}
              </span>

              <h2>
                {selectedReview
                  ? "Update Your Review"
                  : "How Was Your Experience?"}
              </h2>

              {selectedBooking && (
                <p>
                  {typeof selectedBooking.hall ===
                  "object"
                    ? selectedBooking.hall
                        ?.name
                    : "Wedding Hall"}
                </p>
              )}
            </div>

            <form
              onSubmit={
                handleSubmitReview
              }
            >
              {/* Rating */}

              <div className="review-rating-input">
                <label>
                  Your Rating
                </label>

                <div className="review-rating-stars">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        type="button"
                        key={star}
                        className={
                          star <=
                          reviewRating
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setReviewRating(
                            star
                          )
                        }
                        disabled={
                          reviewSubmitting
                        }
                        aria-label={`Rate ${star} stars`}
                      >
                        ★
                      </button>
                    )
                  )}
                </div>

                <span className="review-rating-text">
                  {reviewRating === 0
                    ? "Select your rating"
                    : reviewRating === 1
                    ? "Poor"
                    : reviewRating === 2
                    ? "Fair"
                    : reviewRating === 3
                    ? "Good"
                    : reviewRating === 4
                    ? "Very Good"
                    : "Excellent"}
                </span>
              </div>

              {/* Comment */}

              <div className="review-comment-input">
                <label htmlFor="review-comment">
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  value={
                    reviewComment
                  }
                  onChange={(event) =>
                    setReviewComment(
                      event.target
                        .value
                    )
                  }
                  maxLength={2000}
                  rows={5}
                  placeholder="Tell us about your experience with this wedding hall..."
                  disabled={
                    reviewSubmitting
                  }
                />

                <span>
                  {
                    reviewComment.length
                  }{" "}
                  / 2000
                </span>
              </div>

              {/* Actions */}

              <div className="review-modal-actions">
                <button
                  type="button"
                  className="review-cancel-button"
                  onClick={
                    closeReviewModal
                  }
                  disabled={
                    reviewSubmitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="review-submit-button"
                  disabled={
                    reviewSubmitting ||
                    reviewRating === 0
                  }
                >
                  {reviewSubmitting
                    ? "Saving..."
                    : selectedReview
                    ? "Update Review"
                    : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyBookings;
