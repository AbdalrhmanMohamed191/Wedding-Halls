import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaCheck,
  FaTimes,
  FaBan,
  FaPowerOff,
  FaMapMarkerAlt,
  FaUserTie,
  FaCalendarAlt,
  FaStar,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSortAmountDown,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import "./AdminHalls.css";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "ratingHigh", label: "Highest Rating" },
  { value: "bookingsHigh", label: "Most Bookings" },
];

const AdminHalls = () => {
  const navigate = useNavigate();

  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [available, setAvailable] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [showFilters, setShowFilters] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const [rejectModal, setRejectModal] = useState({
    open: false,
    hall: null,
    reason: "",
  });

  const [detailsModal, setDetailsModal] = useState({
    open: false,
    hall: null,
    loading: false,
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    hall: null,
  });

  const fetchHalls = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const params = {
          page,
          limit: 10,
          sort,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (status) {
          params.status = status;
        }

        if (city.trim()) {
          params.city = city.trim();
        }

        if (available !== "") {
          params.available = available;
        }

        const response = await api.get("/admin/halls", {
          params,
        });

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to load halls"
          );
        }

        setHalls(response.data.halls || []);

        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (err) {
        console.error("Fetch Admin Halls Error:", err);

        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load halls";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, status, city, available, sort]
  );

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (page !== 1) {
      setPage(1);
      return;
    }

    fetchHalls();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setCity("");
    setAvailable("");
    setSort("newest");
    setPage(1);
  };

  const handleRefresh = async () => {
    await fetchHalls({ silent: true });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const runHallAction = async (hallId, type) => {
    try {
      setActionLoading(`${type}-${hallId}`);

      let endpoint = "";
      let method = "patch";

      if (type === "approve") {
        endpoint = `/admin/halls/${hallId}/approve`;
      }

      if (type === "suspend") {
        endpoint = `/admin/halls/${hallId}/suspend`;
      }

      if (type === "activate") {
        endpoint = `/admin/halls/${hallId}/activate`;
      }

      if (!endpoint) {
        return;
      }

      const response = await api[method](endpoint);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Action failed"
        );
      }

      const messages = {
        approve: "Hall approved successfully",
        suspend: "Hall suspended successfully",
        activate: "Hall activated successfully",
      };

      toast.success(
        response.data?.message ||
          messages[type] ||
          "Action completed successfully"
      );

      setConfirmModal({
        open: false,
        type: "",
        hall: null,
      });

      await fetchHalls({ silent: true });
    } catch (err) {
      console.error(`Hall ${type} Error:`, err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (event) => {
    event.preventDefault();

    const hall = rejectModal.hall;
    const reason = rejectModal.reason.trim();

    if (!hall) {
      return;
    }

    if (reason.length < 5) {
      toast.error(
        "Rejection reason must be at least 5 characters"
      );
      return;
    }

    try {
      setActionLoading(`reject-${hall._id}`);

      const response = await api.patch(
        `/admin/halls/${hall._id}/reject`,
        {
          reason,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to reject hall"
        );
      }

      toast.success(
        response.data?.message ||
          "Hall rejected successfully"
      );

      setRejectModal({
        open: false,
        hall: null,
        reason: "",
      });

      await fetchHalls({ silent: true });
    } catch (err) {
      console.error("Reject Hall Error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject hall"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmModal = (type, hall) => {
    setConfirmModal({
      open: true,
      type,
      hall,
    });
  };

  const closeConfirmModal = () => {
    if (actionLoading) {
      return;
    }

    setConfirmModal({
      open: false,
      type: "",
      hall: null,
    });
  };

  const openRejectModal = (hall) => {
    setRejectModal({
      open: true,
      hall,
      reason: "",
    });
  };

  const closeRejectModal = () => {
    if (actionLoading) {
      return;
    }

    setRejectModal({
      open: false,
      hall: null,
      reason: "",
    });
  };

  const openHallDetails = async (hallId) => {
    setDetailsModal({
      open: true,
      hall: null,
      loading: true,
    });

    try {
      const response = await api.get(
        `/admin/halls/${hallId}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load hall details"
        );
      }

      setDetailsModal({
        open: true,
        hall: response.data.hall,
        loading: false,
      });
    } catch (err) {
      console.error("Get Hall Details Error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load hall details"
      );

      setDetailsModal({
        open: false,
        hall: null,
        loading: false,
      });
    }
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      open: false,
      hall: null,
      loading: false,
    });
  };

  const formatMoney = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "—";
    }

    return `${amount.toLocaleString("en-EG")} EGP`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-EG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (value) => {
    return `status-badge status-${value || "unknown"}`;
  };

  const getStatusLabel = (value) => {
    if (!value) {
      return "Unknown";
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  };

  const getCoverImage = (hall) => {
    return hall?.coverImage?.url || "";
  };

  const getOwnerName = (hall) => {
    return hall?.owner?.name || "Unknown Owner";
  };

  const getRating = (hall) => {
    const rating = Number(hall?.rating?.average);

    return Number.isFinite(rating)
      ? rating.toFixed(1)
      : "0.0";
  };

  const getRatingCount = (hall) => {
    const count = Number(hall?.rating?.count);

    return Number.isFinite(count) ? count : 0;
  };

  const visiblePages = useMemo(() => {
    const totalPages = pagination.totalPages;

    if (!totalPages) {
      return [];
    }

    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    let start = Math.max(page - 2, 1);
    let end = Math.min(start + 4, totalPages);

    if (end - start < 4) {
      start = end - 4;
    }

    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    );
  }, [pagination.totalPages, page]);

  const confirmText = useMemo(() => {
    if (!confirmModal.hall) {
      return "";
    }

    const hallName =
      confirmModal.hall.name || "this hall";

    if (confirmModal.type === "approve") {
      return `Are you sure you want to approve "${hallName}"?`;
    }

    if (confirmModal.type === "suspend") {
      return `Are you sure you want to suspend "${hallName}"? It will no longer be available for new bookings.`;
    }

    if (confirmModal.type === "activate") {
      return `Are you sure you want to activate "${hallName}" again?`;
    }

    return "";
  }, [confirmModal]);

  const activeFilterCount = [
    status,
    city.trim(),
    available,
  ].filter(Boolean).length;

  return (
    <div className="admin-halls-page">
      {/* =========================
          HEADER
      ========================== */}
      <div className="admin-halls-header">
        <div className="admin-halls-header-content">
          <div>
            <span className="admin-halls-eyebrow">
              ADMIN PANEL
            </span>

            <h1>Halls Management</h1>

            <p>
              Review, approve and manage all wedding
              halls on Wedora.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <FaSyncAlt
              className={
                refreshing ? "spin-animation" : ""
              }
            />

            <span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {/* =========================
          TOOLBAR
      ========================== */}
      <div className="admin-halls-toolbar">
        <form
          className="hall-search-form"
          onSubmit={handleSearchSubmit}
        >
          <FaSearch />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search halls, cities, areas..."
          />

          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}

          <button
            type="submit"
            className="search-submit-btn"
          >
            Search
          </button>
        </form>

        <button
          type="button"
          className={`filter-toggle-btn ${
            showFilters ? "active" : ""
          }`}
          onClick={() =>
            setShowFilters((current) => !current)
          }
        >
          <FaFilter />

          <span>Filters</span>

          {activeFilterCount > 0 && (
            <span className="filter-count">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* =========================
          FILTERS
      ========================== */}
      {showFilters && (
        <div className="hall-filters-panel">
          <div className="filter-field">
            <label>Status</label>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>City</label>

            <input
              type="text"
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setPage(1);
              }}
              placeholder="e.g. Cairo"
            />
          </div>

          <div className="filter-field">
            <label>Availability</label>

            <select
              value={available}
              onChange={(event) => {
                setAvailable(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="true">
                Available
              </option>
              <option value="false">
                Unavailable
              </option>
            </select>
          </div>

          <div className="filter-field">
            <label>Sort By</label>

            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* =========================
          SUMMARY
      ========================== */}
      <div className="halls-summary">
        <div>
          <strong>
            {pagination.total.toLocaleString("en-EG")}
          </strong>

          <span>
            {pagination.total === 1
              ? " hall found"
              : " halls found"}
          </span>
        </div>

        <div className="summary-sort">
          <FaSortAmountDown />

          <span>
            {SORT_OPTIONS.find(
              (item) => item.value === sort
            )?.label || "Newest"}
          </span>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================== */}
      {error && !loading && (
        <div className="admin-halls-error">
          <div>
            <strong>Unable to load halls</strong>
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchHalls()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* =========================
          LOADING
      ========================== */}
      {loading ? (
        <div className="halls-loading-grid">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                className="hall-skeleton-card"
                key={index}
              >
                <div className="skeleton skeleton-image" />

                <div className="skeleton-content">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-actions" />
                </div>
              </div>
            )
          )}
        </div>
      ) : halls.length === 0 ? (
        <div className="empty-halls-state">
          <div className="empty-halls-icon">
            <FaBuilding />
          </div>

          <h3>No halls found</h3>

          <p>
            There are no halls matching your current
            search and filters.
          </p>

          {activeFilterCount > 0 || search.trim() ? (
            <button
              type="button"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {/* =========================
              HALLS GRID
          ========================== */}
          <div className="admin-halls-grid">
            {halls.map((hall) => {
              const coverImage = getCoverImage(hall);
              const owner = hall.owner;

              return (
                <article
                  className="admin-hall-card"
                  key={hall._id}
                >
                  {/* IMAGE */}
                  <div className="hall-card-image">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={hall.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="hall-no-image">
                        <FaBuilding />
                        <span>No Image</span>
                      </div>
                    )}

                    <span
                      className={getStatusClass(
                        hall.status
                      )}
                    >
                      {getStatusLabel(hall.status)}
                    </span>

                    {hall.isFeatured && (
                      <span className="featured-badge">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="hall-card-content">
                    <div className="hall-card-top">
                      <div>
                        <h3>{hall.name}</h3>

                        <div className="hall-location">
                          <FaMapMarkerAlt />

                          <span>
                            {[hall.area, hall.city]
                              .filter(Boolean)
                              .join(", ") ||
                              "Location not specified"}
                          </span>
                        </div>
                      </div>

                      <div className="hall-rating">
                        <FaStar />

                        <strong>
                          {getRating(hall)}
                        </strong>

                        <span>
                          ({getRatingCount(hall)})
                        </span>
                      </div>
                    </div>

                    <div className="hall-owner-row">
                      <div className="owner-avatar">
                        <FaUserTie />
                      </div>

                      <div className="owner-info">
                        <span>Hall Owner</span>

                        <strong>
                          {getOwnerName(hall)}
                        </strong>
                      </div>
                    </div>

                    <div className="hall-meta-grid">
                      <div className="hall-meta-item">
                        <span>Capacity</span>

                        <strong>
                          {hall.capacity?.min || 0} -{" "}
                          {hall.capacity?.max || 0}
                        </strong>
                      </div>

                      <div className="hall-meta-item">
                        <span>Starting Price</span>

                        <strong>
                          {formatMoney(
                            hall.startingPrice
                          )}
                        </strong>
                      </div>

                      <div className="hall-meta-item">
                        <span>Bookings</span>

                        <strong>
                          {Number(
                            hall.totalBookings || 0
                          ).toLocaleString("en-EG")}
                        </strong>
                      </div>

                      <div className="hall-meta-item">
                        <span>Created</span>

                        <strong>
                          {formatDate(
                            hall.createdAt
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="hall-availability">
                      <span
                        className={
                          hall.isAvailable
                            ? "availability-dot available"
                            : "availability-dot unavailable"
                        }
                      />

                      <span>
                        {hall.isAvailable
                          ? "Available for bookings"
                          : "Not available for bookings"}
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="hall-card-actions">
                      <button
                        type="button"
                        className="hall-action view"
                        onClick={() =>
                          openHallDetails(
                            hall._id
                          )
                        }
                        title="View details"
                      >
                        <FaEye />
                        <span>View</span>
                      </button>

                      {hall.status !== "approved" &&
                        hall.status !== "suspended" &&
                        !hall.isDeleted && (
                          <button
                            type="button"
                            className="hall-action approve"
                            disabled={
                              actionLoading ===
                              `approve-${hall._id}`
                            }
                            onClick={() =>
                              openConfirmModal(
                                "approve",
                                hall
                              )
                            }
                            title="Approve hall"
                          >
                            <FaCheck />

                            <span>
                              {actionLoading ===
                              `approve-${hall._id}`
                                ? "..."
                                : "Approve"}
                            </span>
                          </button>
                        )}

                      {hall.status === "pending" && (
                        <button
                          type="button"
                          className="hall-action reject"
                          disabled={
                            actionLoading ===
                            `reject-${hall._id}`
                          }
                          onClick={() =>
                            openRejectModal(hall)
                          }
                          title="Reject hall"
                        >
                          <FaTimes />
                          <span>Reject</span>
                        </button>
                      )}

                      {hall.status === "approved" && (
                        <button
                          type="button"
                          className="hall-action suspend"
                          disabled={
                            actionLoading ===
                            `suspend-${hall._id}`
                          }
                          onClick={() =>
                            openConfirmModal(
                              "suspend",
                              hall
                            )
                          }
                          title="Suspend hall"
                        >
                          <FaBan />
                          <span>Suspend</span>
                        </button>
                      )}

                      {hall.status === "suspended" && (
                        <button
                          type="button"
                          className="hall-action activate"
                          disabled={
                            actionLoading ===
                            `activate-${hall._id}`
                          }
                          onClick={() =>
                            openConfirmModal(
                              "activate",
                              hall
                            )
                          }
                          title="Activate hall"
                        >
                          <FaPowerOff />
                          <span>Activate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* =========================
              PAGINATION
          ========================== */}
          {pagination.totalPages > 1 && (
            <div className="halls-pagination">
              <button
                type="button"
                className="pagination-arrow"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  handlePageChange(page - 1)
                }
              >
                <FaChevronLeft />
              </button>

              <div className="pagination-pages">
                {visiblePages.map(
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
              </div>

              <button
                type="button"
                className="pagination-arrow"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  handlePageChange(page + 1)
                }
              >
                <FaChevronRight />
              </button>

              <span className="pagination-info">
                Page {page} of{" "}
                {pagination.totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* =========================
          REJECT MODAL
      ========================== */}
      {rejectModal.open && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeRejectModal();
            }
          }}
        >
          <div className="admin-modal reject-modal">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon reject-icon">
                  <FaTimes />
                </div>

                <div>
                  <h3>Reject Hall</h3>

                  <p>
                    Explain why this hall cannot
                    be approved.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeRejectModal}
                disabled={!!actionLoading}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleRejectSubmit}
            >
              <div className="reject-hall-preview">
                {getCoverImage(
                  rejectModal.hall
                ) ? (
                  <img
                    src={getCoverImage(
                      rejectModal.hall
                    )}
                    alt={
                      rejectModal.hall?.name ||
                      "Hall"
                    }
                  />
                ) : (
                  <div>
                    <FaBuilding />
                  </div>
                )}

                <div>
                  <strong>
                    {rejectModal.hall?.name}
                  </strong>

                  <span>
                    {rejectModal.hall?.city ||
                      "Unknown city"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="rejectionReason">
                  Rejection Reason
                </label>

                <textarea
                  id="rejectionReason"
                  value={rejectModal.reason}
                  onChange={(event) =>
                    setRejectModal(
                      (current) => ({
                        ...current,
                        reason:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Write a clear reason for rejecting this hall..."
                  rows={5}
                  maxLength={1000}
                  autoFocus
                />

                <div className="character-count">
                  {rejectModal.reason.length}/1000
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeRejectModal}
                  disabled={!!actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-danger-btn"
                  disabled={
                    actionLoading ===
                    `reject-${rejectModal.hall?._id}`
                  }
                >
                  <FaTimes />

                  {actionLoading ===
                  `reject-${rejectModal.hall?._id}`
                    ? "Rejecting..."
                    : "Reject Hall"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          CONFIRM MODAL
      ========================== */}
      {confirmModal.open && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeConfirmModal();
            }
          }}
        >
          <div className="admin-modal confirm-modal">
            <div className="confirm-icon">
              {confirmModal.type ===
                "approve" && <FaCheck />}

              {confirmModal.type ===
                "suspend" && <FaBan />}

              {confirmModal.type ===
                "activate" && <FaPowerOff />}
            </div>

            <h3>
              {confirmModal.type === "approve" &&
                "Approve Hall"}

              {confirmModal.type === "suspend" &&
                "Suspend Hall"}

              {confirmModal.type === "activate" &&
                "Activate Hall"}
            </h3>

            <p>{confirmText}</p>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={closeConfirmModal}
                disabled={!!actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`modal-confirm-btn ${confirmModal.type}`}
                disabled={
                  !!actionLoading
                }
                onClick={() =>
                  runHallAction(
                    confirmModal.hall?._id,
                    confirmModal.type
                  )
                }
              >
                {actionLoading ? (
                  "Processing..."
                ) : (
                  <>
                    {confirmModal.type ===
                      "approve" && (
                      <>
                        <FaCheck />
                        Approve
                      </>
                    )}

                    {confirmModal.type ===
                      "suspend" && (
                      <>
                        <FaBan />
                        Suspend
                      </>
                    )}

                    {confirmModal.type ===
                      "activate" && (
                      <>
                        <FaPowerOff />
                        Activate
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          DETAILS MODAL
      ========================== */}
      {detailsModal.open && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeDetailsModal();
            }
          }}
        >
          <div className="admin-modal details-modal">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon view-icon">
                  <FaBuilding />
                </div>

                <div>
                  <h3>Hall Details</h3>
                  <p>
                    Complete information about this
                    hall.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeDetailsModal}
              >
                <FaTimes />
              </button>
            </div>

            {detailsModal.loading ? (
              <div className="details-loading">
                <div className="details-spinner" />
                <span>
                  Loading hall details...
                </span>
              </div>
            ) : detailsModal.hall ? (
              <div className="details-content">
                <div className="details-main">
                  <div className="details-image">
                    {getCoverImage(
                      detailsModal.hall
                    ) ? (
                      <img
                        src={getCoverImage(
                          detailsModal.hall
                        )}
                        alt={
                          detailsModal.hall.name
                        }
                      />
                    ) : (
                      <div>
                        <FaBuilding />
                        <span>No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="details-title">
                    <div>
                      <h2>
                        {detailsModal.hall.name}
                      </h2>

                      <span
                        className={getStatusClass(
                          detailsModal.hall
                            .status
                        )}
                      >
                        {getStatusLabel(
                          detailsModal.hall
                            .status
                        )}
                      </span>
                    </div>

                    <div className="details-rating">
                      <FaStar />

                      <strong>
                        {getRating(
                          detailsModal.hall
                        )}
                      </strong>

                      <span>
                        (
                        {getRatingCount(
                          detailsModal.hall
                        )}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-grid">
                  <div className="detail-box">
                    <span>Owner</span>

                    <strong>
                      {getOwnerName(
                        detailsModal.hall
                      )}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Phone</span>

                    <strong>
                      {detailsModal.hall.phone ||
                        "—"}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>City</span>

                    <strong>
                      {detailsModal.hall.city ||
                        "—"}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Area</span>

                    <strong>
                      {detailsModal.hall.area ||
                        "—"}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Capacity</span>

                    <strong>
                      {detailsModal.hall.capacity
                        ?.min || 0}{" "}
                      -{" "}
                      {detailsModal.hall.capacity
                        ?.max || 0}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Starting Price</span>

                    <strong>
                      {formatMoney(
                        detailsModal.hall
                          .startingPrice
                      )}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Total Bookings</span>

                    <strong>
                      {Number(
                        detailsModal.hall
                          .totalBookings || 0
                      ).toLocaleString(
                        "en-EG"
                      )}
                    </strong>
                  </div>

                  <div className="detail-box">
                    <span>Created</span>

                    <strong>
                      {formatDate(
                        detailsModal.hall
                          .createdAt
                      )}
                    </strong>
                  </div>
                </div>

                {detailsModal.hall.description && (
                  <div className="details-section">
                    <h4>Description</h4>

                    <p>
                      {
                        detailsModal.hall
                          .description
                      }
                    </p>
                  </div>
                )}

                {detailsModal.hall.address && (
                  <div className="details-section">
                    <h4>Address</h4>

                    <p>
                      <FaMapMarkerAlt />

                      {
                        detailsModal.hall.address
                      }
                    </p>
                  </div>
                )}

                {Array.isArray(
                  detailsModal.hall.features
                ) &&
                  detailsModal.hall.features
                    .length > 0 && (
                    <div className="details-section">
                      <h4>Features</h4>

                      <div className="features-list">
                        {detailsModal.hall.features.map(
                          (feature, index) => (
                            <span
                              key={`${feature}-${index}`}
                            >
                              {feature}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {detailsModal.hall
                  .rejectionReason && (
                  <div className="rejection-reason-box">
                    <strong>
                      Rejection Reason
                    </strong>

                    <p>
                      {
                        detailsModal.hall
                          .rejectionReason
                      }
                    </p>
                  </div>
                )}

                <div className="owner-contact-box">
                  <div className="owner-contact-header">
                    <div className="owner-avatar large">
                      <FaUserTie />
                    </div>

                    <div>
                      <span>Hall Owner</span>

                      <strong>
                        {getOwnerName(
                          detailsModal.hall
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="owner-contact-details">
                    {detailsModal.hall.owner
                      ?.email && (
                      <a
                        href={`mailto:${detailsModal.hall.owner.email}`}
                      >
                        <FaEnvelope />

                        {
                          detailsModal.hall
                            .owner.email
                        }
                      </a>
                    )}

                    {detailsModal.hall.owner
                      ?.phone && (
                      <a
                        href={`tel:${detailsModal.hall.owner.phone}`}
                      >
                        <FaPhone />

                        {
                          detailsModal.hall
                            .owner.phone
                        }
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="details-empty">
                Unable to load hall details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHalls;