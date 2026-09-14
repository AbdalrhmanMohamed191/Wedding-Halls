import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUndo,
  FaImages,
  FaStar,
  FaUsers,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
  FaSave,
  FaCloudUploadAlt,
} from "react-icons/fa";

import api from "../../api/axios";
import "./OwnerHalls.css";

const emptyForm = {
  name: "",
  description: "",
  phone: "",
  secondaryPhone: "",
  address: "",
  city: "",
  area: "",
  minCapacity: "",
  maxCapacity: "",
  startingPrice: "",
  features: "",
};

const OwnerHalls = () => {
  const [halls, setHalls] = useState([]);
  const [deletedHalls, setDeletedHalls] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletedLoading, setDeletedLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("active");

  const [showModal, setShowModal] = useState(false);
  const [editingHall, setEditingHall] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchHalls = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/halls/my");

      if (response.data?.success) {
        setHalls(response.data.halls || []);
      }
    } catch (err) {
      console.error("Fetch Owner Halls Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load your halls"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedHalls = async () => {
    try {
      setDeletedLoading(true);

      const response = await api.get(
        "/halls/my?deleted=true"
      );

      if (response.data?.success) {
        setDeletedHalls(response.data.halls || []);
      }
    } catch (err) {
      console.error(
        "Fetch Deleted Halls Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load deleted halls"
      );
    } finally {
      setDeletedLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
    fetchDeletedHalls();
  }, []);

  const openCreateModal = () => {
    setEditingHall(null);
    setForm(emptyForm);
    setCoverFile(null);
    setGalleryFiles([]);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (hall) => {
    setEditingHall(hall);

    setForm({
      name: hall.name || "",
      description: hall.description || "",
      phone: hall.phone || "",
      secondaryPhone: hall.secondaryPhone || "",
      address: hall.address || "",
      city: hall.city || "",
      area: hall.area || "",
      minCapacity: hall.capacity?.min || "",
      maxCapacity: hall.capacity?.max || "",
      startingPrice: hall.startingPrice || "",
      features: Array.isArray(hall.features)
        ? hall.features.join(", ")
        : "",
    });

    setCoverFile(null);
    setGalleryFiles([]);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving || uploadingImages) return;

    setShowModal(false);
    setEditingHall(null);
    setForm(emptyForm);
    setCoverFile(null);
    setGalleryFiles([]);
    setMessage("");
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image");
      return;
    }

    setCoverFile(file);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length !== files.length) {
      setError(
        "Only image files are allowed in gallery"
      );
    }

    setGalleryFiles(imageFiles);
  };

  const buildPayload = () => {
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      phone: form.phone.trim(),
      secondaryPhone:
        form.secondaryPhone.trim() || null,
      address: form.address.trim(),
      city: form.city.trim(),
      area: form.area.trim() || null,

      capacity: {
        min: Number(form.minCapacity),
        max: Number(form.maxCapacity),
      },

      startingPrice: Number(form.startingPrice),

      features: form.features
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean),
    };
  };

  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim()
    ) {
      setError(
        "Please fill in all required fields"
      );
      return false;
    }

    if (form.description.trim().length < 20) {
      setError(
        "Description must be at least 20 characters"
      );
      return false;
    }

    const minCapacity = Number(
      form.minCapacity
    );

    const maxCapacity = Number(
      form.maxCapacity
    );

    const startingPrice = Number(
      form.startingPrice
    );

    if (
      !Number.isFinite(minCapacity) ||
      !Number.isFinite(maxCapacity) ||
      minCapacity < 1 ||
      maxCapacity < 1
    ) {
      setError(
        "Please enter valid capacity numbers"
      );
      return false;
    }

    if (minCapacity > maxCapacity) {
      setError(
        "Minimum capacity cannot be greater than maximum capacity"
      );
      return false;
    }

    if (
      !Number.isFinite(startingPrice) ||
      startingPrice < 0
    ) {
      setError(
        "Please enter a valid starting price"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = buildPayload();

      let response;

      if (editingHall) {
        response = await api.patch(
          `/halls/${editingHall._id}`,
          payload
        );
      } else {
        response = await api.post(
          "/halls",
          payload
        );
      }

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Something went wrong"
        );
      }

      const hall =
        response.data.hall;

      setMessage(
        editingHall
          ? "Hall updated successfully"
          : "Hall created successfully"
      );

      /*
        Upload cover/gallery after the hall exists.
      */

      if (hall?._id) {
        if (coverFile) {
          const coverData = new FormData();

          coverData.append(
            "image",
            coverFile
          );

          await api.post(
            `/halls/${hall._id}/cover`,
            coverData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );
        }

        if (galleryFiles.length > 0) {
          const galleryData = new FormData();

          galleryFiles.forEach((file) => {
            galleryData.append(
              "images",
              file
            );
          });

          await api.post(
            `/halls/${hall._id}/gallery`,
            galleryData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );
        }
      }

      await fetchHalls();

      setShowModal(false);
      setEditingHall(null);
      setForm(emptyForm);
      setCoverFile(null);
      setGalleryFiles([]);
    } catch (err) {
      console.error(
        "Save Hall Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save hall"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hall) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${hall.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/halls/${hall._id}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to delete hall"
        );
      }

      setMessage(
        "Hall deleted successfully"
      );

      await fetchHalls();
      await fetchDeletedHalls();
    } catch (err) {
      console.error(
        "Delete Hall Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete hall"
      );
    }
  };

  const handleRestore = async (hall) => {
    const confirmed = window.confirm(
      `Restore "${hall.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await api.patch(
        `/halls/${hall._id}/restore`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to restore hall"
        );
      }

      setMessage(
        "Hall restored successfully"
      );

      await fetchHalls();
      await fetchDeletedHalls();
    } catch (err) {
      console.error(
        "Restore Hall Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to restore hall"
      );
    }
  };

  const getStatusClass = (status) => {
    return `hall-status hall-status-${status}`;
  };

  const getStatusText = (status) => {
    const statuses = {
      pending: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
      suspended: "Suspended",
    };

    return statuses[status] || status;
  };

  const renderHallCard = (hall) => {
    const cover =
      hall.coverImage?.url;

    return (
      <div
        className="owner-hall-card"
        key={hall._id}
      >
        <div className="owner-hall-image">
          {cover ? (
            <img
              src={cover}
              alt={hall.name}
            />
          ) : (
            <div className="owner-hall-image-empty">
              <FaImages />
              <span>No Cover Image</span>
            </div>
          )}

          <span
            className={getStatusClass(
              hall.status
            )}
          >
            {getStatusText(
              hall.status
            )}
          </span>
        </div>

        <div className="owner-hall-body">
          <div className="owner-hall-heading">
            <div>
              <h3>{hall.name}</h3>

              <div className="owner-hall-location">
                <FaMapMarkerAlt />
                <span>
                  {hall.city}
                  {hall.area
                    ? `, ${hall.area}`
                    : ""}
                </span>
              </div>
            </div>

            <div className="owner-hall-rating">
              <FaStar />
              <span>
                {Number(
                  hall.rating?.average || 0
                ).toFixed(1)}
              </span>
            </div>
          </div>

          <p className="owner-hall-description">
            {hall.description}
          </p>

          <div className="owner-hall-info">
            <div>
              <FaUsers />
              <span>
                {hall.capacity?.min} -{" "}
                {hall.capacity?.max} guests
              </span>
            </div>

            <div>
              <strong>
                {Number(
                  hall.startingPrice || 0
                ).toLocaleString()}
              </strong>
              <span> EGP</span>
            </div>
          </div>

          <div className="owner-hall-meta">
            <span>
              <FaPhone />
              {hall.phone}
            </span>

            <span>
              {hall.totalBookings || 0} bookings
            </span>

            <span>
              {hall.images?.length || 0} photos
            </span>
          </div>

          {hall.status === "rejected" &&
            hall.rejectionReason && (
              <div className="hall-rejection-box">
                <strong>
                  Rejection reason
                </strong>
                <p>
                  {hall.rejectionReason}
                </p>
              </div>
            )}

          <div className="owner-hall-actions">
            <button
              type="button"
              className="hall-action-btn edit"
              onClick={() =>
                openEditModal(hall)
              }
            >
              <FaEdit />
              Edit
            </button>

            <button
              type="button"
              className="hall-action-btn delete"
              onClick={() =>
                handleDelete(hall)
              }
            >
              <FaTrash />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="owner-halls-page">
      <div className="owner-halls-container">
        <header className="owner-halls-header">
          <div>
            <span className="owner-page-eyebrow">
              Owner Management
            </span>

            <h1>My Wedding Halls</h1>

            <p>
              Manage your halls, information,
              photos and availability from one
              place.
            </p>
          </div>

          <button
            type="button"
            className="owner-add-hall-btn"
            onClick={openCreateModal}
          >
            <FaPlus />
            Add New Hall
          </button>
        </header>

        {message && (
          <div className="owner-alert success">
            {message}
          </div>
        )}

        {error && (
          <div className="owner-alert error">
            {error}
            <button
              type="button"
              onClick={() => setError("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="owner-halls-tabs">
          <button
            type="button"
            className={
              activeTab === "active"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("active")
            }
          >
            My Halls
            <span>{halls.length}</span>
          </button>

          <button
            type="button"
            className={
              activeTab === "deleted"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveTab("deleted");

              if (
                deletedHalls.length === 0
              ) {
                fetchDeletedHalls();
              }
            }}
          >
            Deleted
            <span>
              {deletedHalls.length}
            </span>
          </button>
        </div>

        {activeTab === "active" && (
          <>
            {loading ? (
              <div className="owner-halls-loading">
                <div className="owner-loading-spinner"></div>
                <p>
                  Loading your halls...
                </p>
              </div>
            ) : halls.length === 0 ? (
              <div className="owner-halls-empty">
                <div className="empty-icon">
                  <FaImages />
                </div>

                <h2>
                  You don't have any halls yet
                </h2>

                <p>
                  Add your first wedding hall
                  and start building your
                  business on Wedora.
                </p>

                <button
                  type="button"
                  onClick={
                    openCreateModal
                  }
                >
                  <FaPlus />
                  Add Your First Hall
                </button>
              </div>
            ) : (
              <div className="owner-halls-grid">
                {halls.map(renderHallCard)}
              </div>
            )}
          </>
        )}

        {activeTab === "deleted" && (
          <>
            {deletedLoading ? (
              <div className="owner-halls-loading">
                <div className="owner-loading-spinner"></div>
                <p>
                  Loading deleted halls...
                </p>
              </div>
            ) : deletedHalls.length === 0 ? (
              <div className="owner-halls-empty">
                <div className="empty-icon">
                  <FaTrash />
                </div>

                <h2>
                  No deleted halls
                </h2>

                <p>
                  Deleted halls will appear
                  here so you can restore them.
                </p>
              </div>
            ) : (
              <div className="owner-halls-grid">
                {deletedHalls.map(
                  (hall) => (
                    <div
                      className="owner-hall-card deleted-card"
                      key={hall._id}
                    >
                      <div className="owner-hall-image">
                        {hall.coverImage?.url ? (
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
                          <div className="owner-hall-image-empty">
                            <FaImages />
                            <span>
                              No Cover Image
                            </span>
                          </div>
                        )}

                        <span className="hall-status hall-status-deleted">
                          Deleted
                        </span>
                      </div>

                      <div className="owner-hall-body">
                        <h3>
                          {hall.name}
                        </h3>

                        <div className="owner-hall-location">
                          <FaMapMarkerAlt />
                          <span>
                            {hall.city}
                          </span>
                        </div>

                        <p className="owner-hall-description">
                          {hall.description}
                        </p>

                        <div className="owner-hall-actions">
                          <button
                            type="button"
                            className="hall-action-btn restore"
                            onClick={() =>
                              handleRestore(
                                hall
                              )
                            }
                          >
                            <FaUndo />
                            Restore Hall
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div
          className="owner-hall-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="owner-hall-modal">
            <div className="owner-hall-modal-header">
              <div>
                <span>
                  Hall Management
                </span>

                <h2>
                  {editingHall
                    ? "Edit Hall"
                    : "Add New Hall"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  saving ||
                  uploadingImages
                }
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="owner-hall-form"
            >
              <div className="form-section">
                <div className="form-section-title">
                  Basic Information
                </div>

                <div className="form-grid">
                  <div className="form-group full">
                    <label>
                      Hall Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Royal Wedding Hall"
                    />
                  </div>

                  <div className="form-group full">
                    <label>
                      Description *
                    </label>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleChange
                      }
                      rows="5"
                      placeholder="Describe your wedding hall..."
                    />

                    <small>
                      Minimum 20 characters
                    </small>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  Contact & Location
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Phone *
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={
                        handleChange
                      }
                      placeholder="01xxxxxxxxx"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Secondary Phone
                    </label>

                    <input
                      type="text"
                      name="secondaryPhone"
                      value={
                        form.secondaryPhone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      City *
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Mansoura"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Area
                    </label>

                    <input
                      type="text"
                      name="area"
                      value={form.area}
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. El Mashaya"
                    />
                  </div>

                  <div className="form-group full">
                    <label>
                      Address *
                    </label>

                    <input
                      type="text"
                      name="address"
                      value={
                        form.address
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Full hall address"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  Capacity & Pricing
                </div>

                <div className="form-grid three">
                  <div className="form-group">
                    <label>
                      Min Guests *
                    </label>

                    <input
                      type="number"
                      min="1"
                      name="minCapacity"
                      value={
                        form.minCapacity
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="100"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Max Guests *
                    </label>

                    <input
                      type="number"
                      min="1"
                      name="maxCapacity"
                      value={
                        form.maxCapacity
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="500"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Starting Price *
                    </label>

                    <div className="price-input">
                      <input
                        type="number"
                        min="0"
                        name="startingPrice"
                        value={
                          form.startingPrice
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="50000"
                      />

                      <span>EGP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  Features
                </div>

                <div className="form-group">
                  <label>
                    Hall Features
                  </label>

                  <input
                    type="text"
                    name="features"
                    value={
                      form.features
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Parking, Air Conditioning, Sound System, Bridal Room"
                  />

                  <small>
                    Separate features with
                    commas
                  </small>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">
                  Images
                </div>

                <div className="upload-grid">
                  <label className="upload-box">
                    <FaCloudUploadAlt />

                    <strong>
                      Cover Image
                    </strong>

                    <span>
                      {coverFile
                        ? coverFile.name
                        : editingHall?.coverImage
                            ?.url
                        ? "Choose a new cover"
                        : "Choose image"}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleCoverChange
                      }
                    />
                  </label>

                  <label className="upload-box">
                    <FaImages />

                    <strong>
                      Gallery Images
                    </strong>

                    <span>
                      {galleryFiles.length
                        ? `${galleryFiles.length} images selected`
                        : "Choose multiple images"}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleGalleryChange
                      }
                    />
                  </label>
                </div>

                {editingHall &&
                  (editingHall.coverImage
                    ?.url ||
                    editingHall.images
                      ?.length > 0) && (
                    <div className="existing-images-note">
                      Existing images remain
                      unchanged unless you
                      upload new ones.
                    </div>
                  )}
              </div>

              {error && (
                <div className="modal-error">
                  {error}
                </div>
              )}

              <div className="owner-hall-modal-footer">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeModal}
                  disabled={
                    saving ||
                    uploadingImages
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={
                    saving ||
                    uploadingImages
                  }
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {editingHall
                        ? "Save Changes"
                        : "Create Hall"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default OwnerHalls;