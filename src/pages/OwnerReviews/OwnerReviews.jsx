import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaUsers,
  FaCommentAlt,
  FaEye,
  FaEyeSlash,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../api/axios";
import "./OwnerReviews.css";

const ratingOptions = [
  { value: "", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
];

const formatDate = (value) => {
  if (!value) return "-";

  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split("-").map(Number);

  if (!year || !month || !day) return "-";

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "U";

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const renderStars = (rating) => {
  return Array.from({ length: 5 }).map(
    (_, index) =>
      index < rating ? (
        <FaStar key={index} />
      ) : (
        <FaRegStar key={index} />
      )
  );
};

const OwnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [halls, setHalls] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    averageRating: 0,
  });

  const [loading, setLoading] = useState(true);

  const [selectedHall, setSelectedHall] =
    useState("");

  const [selectedRating, setSelectedRating] =
    useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchReviews = async (
    requestedPage = page
  ) => {
    try {
      setLoading(true);

      const params = {
        page: requestedPage,
        limit: 20,
      };

      if (selectedHall) {
        params.hallId = selectedHall;
      }

      if (selectedRating) {
        params.rating = selectedRating;
      }

      const response = await api.get(
        "/reviews/owner",
        { params }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load reviews"
        );
      }

      setReviews(
        response.data.reviews || []
      );

      setHalls(
        response.data.halls || []
      );

      setStats(
        response.data.stats || {
          total: 0,
          visible: 0,
          hidden: 0,
          averageRating: 0,
        }
      );

      setPagination(
        response.data.pagination || {
          page: requestedPage,
          limit: 20,
          total: 0,
          pages: 0,
        }
      );
    } catch (error) {
      console.error(
        "Fetch owner reviews error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [selectedHall, selectedRating]);

  const resetFilters = () => {
    setSelectedHall("");
    setSelectedRating("");
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.pages ||
      newPage === page
    ) {
      return;
    }

    setPage(newPage);
    fetchReviews(newPage);
  };

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.pages;

    if (!totalPages) return [];

    const pages = [];

    const start = Math.max(
      1,
      page - 2
    );

    const end = Math.min(
      totalPages,
      page + 2
    );

    for (
      let number = start;
      number <= end;
      number++
    ) {
      pages.push(number);
    }

    return pages;
  }, [pagination.pages, page]);

  const hasFilters =
    Boolean(selectedHall) ||
    Boolean(selectedRating);

  return (
    <div className="owner-reviews-page">
      <div className="owner-reviews-container">
        {/* Header */}
        <div className="owner-reviews-header">
          <div>
            <div className="owner-reviews-breadcrumb">
              <Link to="/owner/dashboard">
                Dashboard
              </Link>

              <span>/</span>

              <span>Reviews</span>
            </div>

            <h1>Customer Reviews</h1>

            <p>
              See what customers are saying about
              your wedding halls.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="reviews-stats">
          <div className="review-stat-card">
            <div className="review-stat-icon total">
              <FaCommentAlt />
            </div>

            <div>
              <span>Total Reviews</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="review-stat-card">
            <div className="review-stat-icon rating">
              <FaStar />
            </div>

            <div>
              <span>Average Rating</span>
              <strong>
                {Number(
                  stats.averageRating || 0
                ).toFixed(1)}
              </strong>
            </div>
          </div>

          <div className="review-stat-card">
            <div className="review-stat-icon visible">
              <FaEye />
            </div>

            <div>
              <span>Visible</span>
              <strong>{stats.visible}</strong>
            </div>
          </div>

          <div className="review-stat-card">
            <div className="review-stat-icon hidden">
              <FaEyeSlash />
            </div>

            <div>
              <span>Hidden</span>
              <strong>{stats.hidden}</strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="reviews-filter-card">
          <div className="filter-title">
            <FaFilter />

            <span>Filter Reviews</span>
          </div>

          <div className="reviews-filters">
            <div className="review-filter-group">
              <label>Hall</label>

              <select
                value={selectedHall}
                onChange={(event) => {
                  setSelectedHall(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  All Halls
                </option>

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

            <div className="review-filter-group">
              <label>Rating</label>

              <select
                value={selectedRating}
                onChange={(event) => {
                  setSelectedRating(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                {ratingOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                className="reset-review-filters"
                onClick={resetFilters}
              >
                <FaTimes />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-list-header">
          <div>
            <h2>Reviews</h2>

            <span>
              {pagination.total} review
              {pagination.total !== 1
                ? "s"
                : ""}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="reviews-loading">
            <div
              className="spinner-border"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <div className="reviews-empty-icon">
              <FaCommentAlt />
            </div>

            <h3>No reviews found</h3>

            <p>
              {hasFilters
                ? "No reviews match your current filters."
                : "Your halls haven't received any reviews yet."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="owner-reviews-list">
              {reviews.map((review) => {
                const customer =
                  review.customer || {};

                const hall =
                  review.hall || {};

                const booking =
                  review.booking || {};

                return (
                  <article
                    className="owner-review-card"
                    key={review._id}
                  >
                    <div className="owner-review-top">
                      <div className="owner-review-customer">
                        <div className="owner-review-avatar">
                          {getInitials(
                            customer.name ||
                              "Customer"
                          )}
                        </div>

                        <div>
                          <h3>
                            {customer.name ||
                              "Customer"}
                          </h3>

                          <span>
                            {formatDate(
                              review.createdAt
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="owner-review-rating">
                        <div className="review-stars">
                          {renderStars(
                            Number(
                              review.rating || 0
                            )
                          )}
                        </div>

                        <strong>
                          {review.rating}/5
                        </strong>
                      </div>
                    </div>

                    <div className="owner-review-content">
                      {review.comment ? (
                        <p>
                          "{review.comment}"
                        </p>
                      ) : (
                        <p className="no-comment">
                          Customer left a rating
                          without a comment.
                        </p>
                      )}
                    </div>

                    <div className="owner-review-meta">
                      <div className="review-meta-item">
                        <FaBuilding />

                        <span>
                          {hall.name || "-"}
                        </span>
                      </div>

                      <div className="review-meta-item">
                        <FaCalendarAlt />

                        <span>
                          {formatDate(
                            booking.eventDate
                          )}
                        </span>
                      </div>

                      <div className="review-meta-item">
                        <FaUsers />

                        <span>
                          {booking.guests || 0} guests
                        </span>
                      </div>

                      <div
                        className={`review-visibility ${
                          review.isVisible
                            ? "visible"
                            : "hidden"
                        }`}
                      >
                        {review.isVisible ? (
                          <>
                            <FaEye />
                            Visible
                          </>
                        ) : (
                          <>
                            <FaEyeSlash />
                            Hidden
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="reviews-pagination">
                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      page - 1
                    )
                  }
                  disabled={page === 1}
                >
                  <FaChevronLeft />
                </button>

                {pageNumbers.map(
                  (pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      className={
                        pageNumber === page
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        handlePageChange(
                          pageNumber
                        )
                      }
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(
                      page + 1
                    )
                  }
                  disabled={
                    page === pagination.pages
                  }
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerReviews;