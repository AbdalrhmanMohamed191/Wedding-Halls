import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUndo,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaClock,
  FaBuilding,
  FaBoxOpen,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

import api from "../../api/axios";
import "./OwnerPackages.css";

const OwnerPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedHall, setSelectedHall] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [processingId, setProcessingId] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/packages/my", {
        params: {
          limit: 50,
        },
      });

      if (response.data?.success) {
        setPackages(response.data.packages || []);
      } else {
        setPackages([]);
      }
    } catch (err) {
      console.error("Fetch Owner Packages Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load your packages"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const halls = useMemo(() => {
    const map = new Map();

    packages.forEach((pkg) => {
      if (pkg.hall?._id) {
        map.set(pkg.hall._id, pkg.hall);
      }
    });

    return Array.from(map.values());
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return packages.filter((pkg) => {
      const matchesSearch =
        !normalizedSearch ||
        pkg.name?.toLowerCase().includes(normalizedSearch) ||
        pkg.description
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesHall =
        selectedHall === "all" ||
        String(pkg.hall?._id) === String(selectedHall);

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && pkg.isActive) ||
        (selectedStatus === "inactive" && !pkg.isActive) ||
        (selectedStatus === "deleted" && pkg.isDeleted);

      return (
        matchesSearch &&
        matchesHall &&
        matchesStatus
      );
    });
  }, [
    packages,
    search,
    selectedHall,
    selectedStatus,
  ]);

  const stats = useMemo(() => {
    const active = packages.filter(
      (pkg) => pkg.isActive && !pkg.isDeleted
    ).length;

    const inactive = packages.filter(
      (pkg) => !pkg.isActive && !pkg.isDeleted
    ).length;

    const deleted = packages.filter(
      (pkg) => pkg.isDeleted
    ).length;

    const total = packages.filter(
      (pkg) => !pkg.isDeleted
    ).length;

    return {
      total,
      active,
      inactive,
      deleted,
    };
  }, [packages]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const handleToggleActive = async (pkg) => {
    try {
      setProcessingId(pkg._id);
      clearMessages();

      const response = await api.patch(
        `/packages/${pkg._id}/toggle-active`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update package"
        );
      }

      setMessage(
        response.data.message ||
          "Package status updated successfully"
      );

      await fetchPackages();
    } catch (err) {
      console.error(
        "Toggle Package Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update package status"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (pkg) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${pkg.name}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(pkg._id);
      clearMessages();

      const response = await api.delete(
        `/packages/${pkg._id}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to delete package"
        );
      }

      setMessage(
        "Package deleted successfully"
      );

      await fetchPackages();
    } catch (err) {
      console.error(
        "Delete Package Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete package"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (pkg) => {
    const confirmed = window.confirm(
      `Restore "${pkg.name}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(pkg._id);
      clearMessages();

      const response = await api.patch(
        `/packages/${pkg._id}/restore`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to restore package"
        );
      }

      setMessage(
        "Package restored successfully"
      );

      await fetchPackages();
    } catch (err) {
      console.error(
        "Restore Package Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to restore package"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "en-EG"
    );
  };

  const formatDuration = (hours) => {
    if (!hours) return "Not specified";

    if (hours === 1) {
      return "1 hour";
    }

    return `${hours} hours`;
  };

  return (
    <main className="owner-packages-page">
      <div className="owner-packages-container">
        {/* HEADER */}
        <header className="owner-packages-header">
          <div>
            <span className="owner-page-eyebrow">
              Owner Management
            </span>

            <h1>My Packages</h1>

            <p>
              Create and manage the packages
              offered by your wedding halls.
            </p>
          </div>

          <Link
            to="/owner/packages/new"
            className="owner-add-package-btn"
          >
            <FaPlus />
            Add New Package
          </Link>
        </header>

        {/* ALERTS */}
        {message && (
          <div className="owner-package-alert success">
            <span>{message}</span>

            <button
              type="button"
              onClick={() => setMessage("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {error && (
          <div className="owner-package-alert error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* STATS */}
        <section className="owner-package-stats">
          <div className="owner-package-stat">
            <div className="package-stat-icon">
              <FaBoxOpen />
            </div>

            <div>
              <span>Total Packages</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="owner-package-stat">
            <div className="package-stat-icon active">
              <FaToggleOn />
            </div>

            <div>
              <span>Active</span>
              <strong>{stats.active}</strong>
            </div>
          </div>

          <div className="owner-package-stat">
            <div className="package-stat-icon inactive">
              <FaToggleOff />
            </div>

            <div>
              <span>Inactive</span>
              <strong>{stats.inactive}</strong>
            </div>
          </div>

          <div className="owner-package-stat">
            <div className="package-stat-icon deleted">
              <FaTrash />
            </div>

            <div>
              <span>Deleted</span>
              <strong>{stats.deleted}</strong>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="owner-package-filters">
          <div className="package-search">
            <FaSearch />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search packages..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="package-filter">
            <FaBuilding />

            <select
              value={selectedHall}
              onChange={(e) =>
                setSelectedHall(e.target.value)
              }
            >
              <option value="all">
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

          <div className="package-filter">
            <FaFilter />

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="deleted">
                Deleted
              </option>
            </select>
          </div>
        </section>

        {/* CONTENT */}
        {loading ? (
          <div className="owner-packages-loading">
            <div className="owner-package-spinner"></div>

            <p>
              Loading your packages...
            </p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="owner-packages-empty">
            <div className="package-empty-icon">
              <FaBoxOpen />
            </div>

            <h2>
              {packages.length === 0
                ? "No packages yet"
                : "No packages found"}
            </h2>

            <p>
              {packages.length === 0
                ? "Create your first package and make your hall more attractive to customers."
                : "Try changing your search or filters."}
            </p>

            {packages.length === 0 && (
              <Link
                to="/owner/packages/new"
                className="empty-add-package-btn"
              >
                <FaPlus />
                Create Your First Package
              </Link>
            )}
          </div>
        ) : (
          <div className="owner-packages-grid">
            {filteredPackages.map((pkg) => (
              <article
                className={`owner-package-card ${
                  pkg.isDeleted
                    ? "package-deleted"
                    : ""
                }`}
                key={pkg._id}
              >
                <div className="owner-package-card-top">
                  <div>
                    <span className="package-hall-name">
                      <FaBuilding />
                      {pkg.hall?.name ||
                        "Unknown Hall"}
                    </span>

                    <h2>{pkg.name}</h2>
                  </div>

                  <span
                    className={`package-status ${
                      pkg.isDeleted
                        ? "deleted"
                        : pkg.isActive
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {pkg.isDeleted
                      ? "Deleted"
                      : pkg.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <p className="owner-package-description">
                  {pkg.description ||
                    "No package description added."}
                </p>

                <div className="owner-package-price">
                  <strong>
                    {formatPrice(pkg.price)}
                  </strong>

                  <span>
                    {pkg.currency || "EGP"}
                  </span>
                </div>

                <div className="owner-package-details">
                  <div>
                    <FaUsers />

                    <span>
                      {pkg.minGuests} -{" "}
                      {pkg.maxGuests} guests
                    </span>
                  </div>

                  <div>
                    <FaClock />

                    <span>
                      {formatDuration(
                        pkg.durationHours
                      )}
                    </span>
                  </div>
                </div>

                {Array.isArray(pkg.features) &&
                  pkg.features.length > 0 && (
                    <div className="owner-package-features">
                      {pkg.features
                        .slice(0, 4)
                        .map(
                          (
                            feature,
                            index
                          ) => (
                            <span
                              key={`${pkg._id}-${index}`}
                            >
                              {feature}
                            </span>
                          )
                        )}

                      {pkg.features.length >
                        4 && (
                        <span>
                          +
                          {pkg.features.length -
                            4}
                        </span>
                      )}
                    </div>
                  )}

                <div className="owner-package-card-footer">
                  {!pkg.isDeleted ? (
                    <>
                      <button
                        type="button"
                        className={`package-action toggle ${
                          pkg.isActive
                            ? "active"
                            : ""
                        }`}
                        disabled={
                          processingId ===
                          pkg._id
                        }
                        onClick={() =>
                          handleToggleActive(
                            pkg
                          )
                        }
                      >
                        {pkg.isActive ? (
                          <>
                            <FaToggleOn />
                            Active
                          </>
                        ) : (
                          <>
                            <FaToggleOff />
                            Inactive
                          </>
                        )}
                      </button>

                      <Link
                        to={`/owner/packages/${pkg._id}/edit`}
                        className="package-action edit"
                      >
                        <FaEdit />
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="package-action delete"
                        disabled={
                          processingId ===
                          pkg._id
                        }
                        onClick={() =>
                          handleDelete(pkg)
                        }
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="package-action restore"
                      disabled={
                        processingId ===
                        pkg._id
                      }
                      onClick={() =>
                        handleRestore(pkg)
                      }
                    >
                      <FaUndo />
                      Restore Package
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default OwnerPackages;