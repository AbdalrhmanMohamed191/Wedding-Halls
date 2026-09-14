import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaBuilding,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaArrowUp,
  FaPlus,
  FaSearch,
  FaUserTie,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // =====================================================
  // Dashboard
  // =====================================================

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // Owners
  // =====================================================

  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [ownersError, setOwnersError] = useState("");

  const [ownerSearch, setOwnerSearch] = useState("");

  // =====================================================
  // Create Owner Modal
  // =====================================================

  const [showCreateOwner, setShowCreateOwner] = useState(false);

  const [ownerForm, setOwnerForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [creatingOwner, setCreatingOwner] = useState(false);

  // =====================================================
  // Action Loading
  // =====================================================

  const [actionLoading, setActionLoading] = useState(null);

  // =====================================================
  // Fetch Dashboard
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/admin");

      if (response.data?.success) {
        setDashboard(response.data.data);
      } else {
        setError("Failed to load dashboard");
      }
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong while loading dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Fetch Owners
  // =====================================================

  const fetchOwners = async () => {
    try {
      setOwnersLoading(true);
      setOwnersError("");

      const response = await api.get(
        "/users?role=hallOwner&limit=50"
      );

      if (response.data?.success) {
        setOwners(response.data.users || []);
      } else {
        setOwnersError("Failed to load owners");
      }
    } catch (err) {
      console.error("Fetch owners error:", err);

      setOwnersError(
        err.response?.data?.message ||
          "Unable to load hall owners"
      );
    } finally {
      setOwnersLoading(false);
    }
  };

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    fetchDashboard();
    fetchOwners();
  }, []);

  // =====================================================
  // Refresh Everything
  // =====================================================

  const refreshAll = async () => {
    await Promise.all([
      fetchDashboard(),
      fetchOwners(),
    ]);
  };

  // =====================================================
  // Format Money
  // =====================================================

  const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString(
      "en-EG"
    )} EGP`;
  };

  // =====================================================
  // Format Date
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-EG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // Owner Form Change
  // =====================================================

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;

    setOwnerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // Create Owner
  // =====================================================

  const handleCreateOwner = async (e) => {
    e.preventDefault();

    if (
      !ownerForm.name.trim() ||
      !ownerForm.email.trim() ||
      !ownerForm.phone.trim() ||
      !ownerForm.password
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (ownerForm.password.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setCreatingOwner(true);

      const response = await api.post(
        "/users/owners",
        {
          name: ownerForm.name.trim(),
          email: ownerForm.email.trim(),
          phone: ownerForm.phone.trim(),
          password: ownerForm.password,
        }
      );

      if (response.data?.success) {
        alert("Hall owner created successfully.");

        setOwnerForm({
          name: "",
          email: "",
          phone: "",
          password: "",
        });

        setShowCreateOwner(false);

        await fetchOwners();
      } else {
        alert(
          response.data?.message ||
            "Failed to create owner."
        );
      }
    } catch (err) {
      console.error("Create owner error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to create hall owner."
      );
    } finally {
      setCreatingOwner(false);
    }
  };

  // =====================================================
  // Toggle Owner Status
  // =====================================================

  const handleToggleOwner = async (owner) => {
    const nextStatus = !owner.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Activate ${owner.name}?`
        : `Deactivate ${owner.name}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(`status-${owner._id}`);

      await api.patch(
        `/users/${owner._id}/status`,
        {
          isActive: nextStatus,
        }
      );

      await fetchOwners();
    } catch (err) {
      console.error(
        "Toggle owner status error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to update owner status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // Delete Owner
  // =====================================================

  const handleDeleteOwner = async (owner) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${owner.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(`delete-${owner._id}`);

      await api.delete(
        `/users/${owner._id}`
      );

      alert("Owner deleted successfully.");

      await fetchOwners();
    } catch (err) {
      console.error(
        "Delete owner error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete this owner."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // Filter Owners
  // =====================================================

  const filteredOwners = owners.filter(
    (owner) => {
      const search = ownerSearch
        .trim()
        .toLowerCase();

      if (!search) return true;

      return (
        owner.name
          ?.toLowerCase()
          .includes(search) ||
        owner.email
          ?.toLowerCase()
          .includes(search) ||
        owner.phone
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="spinner-border text-warning" />

          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // Error
  // =====================================================

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-error">
          <FaTimesCircle />

          <h4>
            Unable to load dashboard
          </h4>

          <p>{error}</p>

          <button
            className="btn btn-warning"
            onClick={fetchDashboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  // =====================================================
  // Dashboard Data
  // =====================================================

  const {
    users = {},
    halls = {},
    bookings = {},
    revenue = 0,
    paidRevenue = 0,
    last30DaysRevenue = 0,
    upcomingBookingsCount = 0,
    pendingHalls = [],
    pendingBookings = [],
    recentBookings = [],
    popularHalls = [],
  } = dashboard;

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="admin-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            ADMIN PANEL
          </span>

          <h1>Dashboard</h1>

          <p>
            Welcome back. Here is what is happening
            on Wedora today.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={refreshAll}
        >
          Refresh
        </button>
      </div>

      {/* =================================================
          MAIN STATS
      ================================================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon orange">
            <FaUsers />
          </div>

          <div className="stat-content">
            <span>Total Users</span>

            <h3>
              {users.total || 0}
            </h3>

            <small>
              {users.user || 0} customers
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FaBuilding />
          </div>

          <div className="stat-content">
            <span>Total Halls</span>

            <h3>
              {halls.total || 0}
            </h3>

            <small>
              {halls.approved || 0} approved
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <FaCalendarCheck />
          </div>

          <div className="stat-content">
            <span>Total Bookings</span>

            <h3>
              {bookings.total || 0}
            </h3>

            <small>
              {bookings.confirmed || 0} confirmed
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaMoneyBillWave />
          </div>

          <div className="stat-content">
            <span>Total Revenue</span>

            <h3>
              {formatMoney(revenue)}
            </h3>

            <small>
              {formatMoney(paidRevenue)} paid
            </small>
          </div>
        </div>

      </div>

      {/* =================================================
          SECONDARY STATS
      ================================================= */}

      <div className="secondary-stats">

        <div className="mini-stat">
          <div className="mini-stat-icon">
            <FaClock />
          </div>

          <div>
            <span>Pending Halls</span>

            <strong>
              {halls.pending || 0}
            </strong>
          </div>
        </div>

        <div className="mini-stat">
          <div className="mini-stat-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span>
              Upcoming Bookings
            </span>

            <strong>
              {upcomingBookingsCount}
            </strong>
          </div>
        </div>

        <div className="mini-stat">
          <div className="mini-stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>
              Completed Bookings
            </span>

            <strong>
              {bookings.completed || 0}
            </strong>
          </div>
        </div>

        <div className="mini-stat">
          <div className="mini-stat-icon">
            <FaArrowUp />
          </div>

          <div>
            <span>
              Last 30 Days
            </span>

            <strong>
              {formatMoney(
                last30DaysRevenue
              )}
            </strong>
          </div>
        </div>

      </div>

      {/* =================================================
          HALL OWNERS
      ================================================= */}

      <section className="dashboard-panel owners-panel">

        <div className="panel-header">
          <div>
            <h2>
              Hall Owners
            </h2>

            <p>
              Manage the owners of Wedora halls
            </p>
          </div>

          <button
            className="create-owner-btn"
            onClick={() =>
              setShowCreateOwner(true)
            }
          >
            <FaPlus />

            Create Owner
          </button>
        </div>

        {/* Search */}

        <div className="owners-toolbar">

          <div className="owner-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={ownerSearch}
              onChange={(e) =>
                setOwnerSearch(
                  e.target.value
                )
              }
            />
          </div>

          <div className="owners-count">
            <FaUserTie />

            <span>
              {filteredOwners.length} Owners
            </span>
          </div>

        </div>

        {/* Loading */}

        {ownersLoading ? (
          <div className="owners-loading">
            <div className="spinner-border text-warning" />

            <p>
              Loading hall owners...
            </p>
          </div>
        ) : ownersError ? (
          <div className="owners-error">
            <FaTimesCircle />

            <p>{ownersError}</p>

            <button
              onClick={fetchOwners}
              className="btn btn-warning"
            >
              Try Again
            </button>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="owners-empty">
            <div>
              <FaUserTie />
            </div>

            <h4>
              No Hall Owners
            </h4>

            <p>
              Create your first hall owner
              to start managing halls.
            </p>

            <button
              className="create-owner-btn"
              onClick={() =>
                setShowCreateOwner(true)
              }
            >
              <FaPlus />
              Create Owner
            </button>
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="admin-table owners-table">

              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredOwners.map(
                  (owner) => (
                    <tr
                      key={owner._id}
                    >

                      {/* Owner */}

                      <td>
                        <div className="owner-profile-cell">

                          <div className="owner-avatar">
                            <FaUserTie />
                          </div>

                          <div className="owner-profile-info">

                            <strong>
                              {owner.name}
                            </strong>

                            <span>
                              {owner.email}
                            </span>

                          </div>

                        </div>
                      </td>

                      {/* Phone */}

                      <td>
                        {owner.phone || "-"}
                      </td>

                      {/* Status */}

                      <td>
                        <span
                          className={`owner-status ${
                            owner.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          <span />

                          {owner.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* Created */}

                      <td>
                        {formatDate(
                          owner.createdAt
                        )}
                      </td>

                      {/* Actions */}

                      <td>

                        <div className="owner-actions">

                          <button
                            className={`owner-action-btn ${
                              owner.isActive
                                ? "deactivate"
                                : "activate"
                            }`}
                            disabled={
                              actionLoading ===
                              `status-${owner._id}`
                            }
                            onClick={() =>
                              handleToggleOwner(
                                owner
                              )
                            }
                            title={
                              owner.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {owner.isActive ? (
                              <FaToggleOff />
                            ) : (
                              <FaToggleOn />
                            )}

                            {actionLoading ===
                            `status-${owner._id}`
                              ? "..."
                              : owner.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            className="owner-action-btn delete"
                            disabled={
                              actionLoading ===
                              `delete-${owner._id}`
                            }
                            onClick={() =>
                              handleDeleteOwner(
                                owner
                              )
                            }
                            title="Delete Owner"
                          >
                            <FaTrash />

                            {actionLoading ===
                            `delete-${owner._id}`
                              ? "..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =================================================
          HALLS + BOOKINGS OVERVIEW
      ================================================= */}

      <div className="dashboard-grid">

        {/* Hall Status */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                Hall Overview
              </h2>

              <p>
                Current hall statuses
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/halls")
              }
              className="view-all-btn"
            >
              View All
            </button>

          </div>

          <div className="status-list">

            <StatusRow
              label="Approved"
              value={
                halls.approved || 0
              }
              type="success"
            />

            <StatusRow
              label="Pending"
              value={
                halls.pending || 0
              }
              type="warning"
            />

            <StatusRow
              label="Rejected"
              value={
                halls.rejected || 0
              }
              type="danger"
            />

            <StatusRow
              label="Suspended"
              value={
                halls.suspended || 0
              }
              type="dark"
            />

          </div>

        </section>

        {/* Booking Status */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                Booking Overview
              </h2>

              <p>
                Current booking statuses
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/bookings")
              }
              className="view-all-btn"
            >
              View All
            </button>

          </div>

          <div className="status-list">

            <StatusRow
              label="Pending"
              value={
                bookings.pending || 0
              }
              type="warning"
            />

            <StatusRow
              label="Confirmed"
              value={
                bookings.confirmed || 0
              }
              type="success"
            />

            <StatusRow
              label="Completed"
              value={
                bookings.completed || 0
              }
              type="blue"
            />

            <StatusRow
              label="Cancelled"
              value={
                bookings.cancelled || 0
              }
              type="danger"
            />

          </div>

        </section>

      </div>

      {/* =================================================
          PENDING HALLS
      ================================================= */}

      <section className="dashboard-panel table-panel">

        <div className="panel-header">

          <div>
            <h2>
              Pending Halls
            </h2>

            <p>
              Halls waiting for your approval
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/admin/halls")
            }
            className="view-all-btn"
          >
            Manage Halls
          </button>

        </div>

        {pendingHalls.length === 0 ? (
          <EmptyState
            icon={<FaCheckCircle />}
            title="No pending halls"
            text="There are no halls waiting for approval."
          />
        ) : (
          <div className="table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Hall</th>
                  <th>Owner</th>
                  <th>Location</th>
                  <th>Starting Price</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {pendingHalls.map(
                  (hall) => (
                    <tr key={hall._id}>

                      <td>
                        <div className="hall-cell">

                          {hall.coverImage?.url ? (
                            <img
                              src={
                                hall.coverImage.url
                              }
                              alt={hall.name}
                            />
                          ) : (
                            <div className="hall-placeholder">
                              <FaBuilding />
                            </div>
                          )}

                          <div>
                            <strong>
                              {hall.name}
                            </strong>

                            <span>
                              {hall.area ||
                                "No area"}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="owner-cell">

                          <strong>
                            {hall.owner?.name ||
                              "Unknown"}
                          </strong>

                          <span>
                            {hall.owner?.email ||
                              "-"}
                          </span>

                        </div>
                      </td>

                      <td>
                        {hall.city || "-"}
                      </td>

                      <td>
                        {formatMoney(
                          hall.startingPrice
                        )}
                      </td>

                      <td>
                        {formatDate(
                          hall.createdAt
                        )}
                      </td>

                      <td>
                        <span className="badge pending">
                          Pending
                        </span>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =================================================
          PENDING BOOKINGS
      ================================================= */}

      <section className="dashboard-panel table-panel">

        <div className="panel-header">

          <div>
            <h2>
              Pending Bookings
            </h2>

            <p>
              Bookings waiting for confirmation
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/admin/bookings")
            }
            className="view-all-btn"
          >
            Manage Bookings
          </button>

        </div>

        {pendingBookings.length === 0 ? (
          <EmptyState
            icon={<FaCheckCircle />}
            title="No pending bookings"
            text="There are no bookings waiting for confirmation."
          />
        ) : (
          <div className="table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Hall</th>
                  <th>Package</th>
                  <th>Event Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {pendingBookings.map(
                  (booking) => (
                    <tr key={booking._id}>

                      <td>
                        <div className="owner-cell">

                          <strong>
                            {booking.customer?.name ||
                              booking.customerName ||
                              "Unknown"}
                          </strong>

                          <span>
                            {booking.customer?.phone ||
                              booking.customerPhone ||
                              "-"}
                          </span>

                        </div>
                      </td>

                      <td>
                        <strong>
                          {booking.hall?.name ||
                            "-"}
                        </strong>

                        <span className="table-secondary">
                          {booking.hall?.city ||
                            ""}
                        </span>
                      </td>

                      <td>
                        {booking.package?.name ||
                          "-"}
                      </td>

                      <td>
                        {formatDate(
                          booking.eventDate
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatMoney(
                            booking.totalAmount
                          )}
                        </strong>
                      </td>

                      <td>
                        <span className="badge pending">
                          Pending
                        </span>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =================================================
          BOTTOM GRID
      ================================================= */}

      <div className="dashboard-grid">

        {/* Recent Bookings */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                Recent Bookings
              </h2>

              <p>
                Latest activity
              </p>
            </div>

          </div>

          {recentBookings.length === 0 ? (
            <EmptyState
              icon={<FaCalendarCheck />}
              title="No bookings yet"
              text="Recent bookings will appear here."
            />
          ) : (
            <div className="recent-list">

              {recentBookings
                .slice(0, 6)
                .map((booking) => (
                  <div
                    className="recent-item"
                    key={booking._id}
                  >

                    <div className="recent-icon">
                      <FaCalendarCheck />
                    </div>

                    <div className="recent-info">

                      <strong>
                        {booking.customer?.name ||
                          booking.customerName ||
                          "Customer"}
                      </strong>

                      <span>
                        {booking.hall?.name ||
                          "Hall"}
                      </span>

                    </div>

                    <div className="recent-right">

                      <strong>
                        {formatMoney(
                          booking.totalAmount
                        )}
                      </strong>

                      <span
                        className={`status-text ${booking.status}`}
                      >
                        {booking.status}
                      </span>

                    </div>

                  </div>
                ))}

            </div>
          )}

        </section>

        {/* Popular Halls */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>
                Popular Halls
              </h2>

              <p>
                Based on confirmed bookings
              </p>
            </div>

          </div>

          {popularHalls.length === 0 ? (
            <EmptyState
              icon={<FaStar />}
              title="No popular halls yet"
              text="Hall performance will appear here."
            />
          ) : (
            <div className="popular-list">

              {popularHalls
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    className="popular-item"
                    key={item._id}
                  >

                    <span className="rank">
                      #{index + 1}
                    </span>

                    <div className="popular-info">

                      <strong>
                        {item.hall?.name ||
                          "Unknown Hall"}
                      </strong>

                      <span>
                        {item.hall?.city ||
                          "-"}
                      </span>

                    </div>

                    <div className="popular-rating">

                      <FaStar />

                      <span>
                        {item.hall?.rating
                          ?.average ??
                          item.hall?.rating ??
                          0}
                      </span>

                    </div>

                    <div className="popular-bookings">

                      <strong>
                        {item.bookings || 0}
                      </strong>

                      <span>
                        bookings
                      </span>

                    </div>

                  </div>
                ))}

            </div>
          )}

        </section>

      </div>

      {/* =================================================
          CREATE OWNER MODAL
      ================================================= */}

      {showCreateOwner && (
        <div
          className="owner-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !creatingOwner
            ) {
              setShowCreateOwner(false);
            }
          }}
        >

          <div className="owner-modal">

            <div className="owner-modal-header">

              <div>
                <div className="modal-icon">
                  <FaUserTie />
                </div>

                <div>
                  <h3>
                    Create Hall Owner
                  </h3>

                  <p>
                    Create an account for a new
                    Wedora hall owner.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                disabled={creatingOwner}
                onClick={() =>
                  setShowCreateOwner(false)
                }
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleCreateOwner}
              className="owner-form"
            >

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Ahmed Mohamed"
                  value={ownerForm.name}
                  onChange={
                    handleOwnerChange
                  }
                  disabled={creatingOwner}
                />

              </div>

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="owner@example.com"
                  value={ownerForm.email}
                  onChange={
                    handleOwnerChange
                  }
                  disabled={creatingOwner}
                />

              </div>

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="01012345678"
                  value={ownerForm.phone}
                  onChange={
                    handleOwnerChange
                  }
                  disabled={creatingOwner}
                />

              </div>

              <div className="form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={ownerForm.password}
                  onChange={
                    handleOwnerChange
                  }
                  disabled={creatingOwner}
                />

              </div>

              <div className="owner-form-note">
                <FaCheckCircle />

                <span>
                  This account will automatically
                  be created as a Hall Owner.
                </span>
              </div>

              <div className="owner-modal-actions">

                <button
                  type="button"
                  className="modal-cancel-btn"
                  disabled={creatingOwner}
                  onClick={() =>
                    setShowCreateOwner(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-owner-btn"
                  disabled={creatingOwner}
                >
                  {creatingOwner ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus />

                      Create Owner
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Status Row
|--------------------------------------------------------------------------
*/

const StatusRow = ({
  label,
  value,
  type,
}) => {
  return (
    <div className="status-row">

      <div className="status-label">

        <span
          className={`status-dot ${type}`}
        />

        <span>
          {label}
        </span>

      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

const EmptyState = ({
  icon,
  title,
  text,
}) => {
  return (
    <div className="empty-state">

      <div className="empty-icon">
        {icon}
      </div>

      <h4>
        {title}
      </h4>

      <p>
        {text}
      </p>

    </div>
  );
};

export default AdminDashboard;