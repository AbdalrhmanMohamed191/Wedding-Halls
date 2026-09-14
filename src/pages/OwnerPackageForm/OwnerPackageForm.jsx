import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrash,
  FaBuilding,
  FaUsers,
  FaClock,
  FaList,
  FaBoxOpen,
  FaToggleOn,
} from "react-icons/fa";

import api from "../../api/axios";
import "./OwnerPackageForm.css";

const OwnerPackageForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [halls, setHalls] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    hallId: "",
    name: "",
    description: "",
    price: "",
    currency: "EGP",
    minGuests: "",
    maxGuests: "",
    durationHours: "",
    sortOrder: 0,
    isActive: true,
  });

  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");

  /* =====================================================
     FETCH HALLS
  ===================================================== */

  const fetchHalls = async () => {
    try {
      const response = await api.get("/halls/my");

      if (response.data?.success) {
        const fetchedHalls = response.data.halls || [];

        setHalls(fetchedHalls);

        return fetchedHalls;
      }

      setHalls([]);
      return [];
    } catch (err) {
      console.error("Fetch Owner Halls Error:", err);

      throw new Error(
        err.response?.data?.message ||
          "Failed to load your halls"
      );
    }
  };

  /* =====================================================
     FETCH PACKAGE FOR EDIT
  ===================================================== */

  const fetchPackage = async () => {
    try {
      const response = await api.get(
        `/packages/${id}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load package"
        );
      }

      const pkg = response.data.package;

      setForm({
        hallId:
          pkg.hall?._id ||
          pkg.hall ||
          "",

        name: pkg.name || "",

        description:
          pkg.description || "",

        price:
          pkg.price !== undefined &&
          pkg.price !== null
            ? pkg.price
            : "",

        currency:
          pkg.currency || "EGP",

        minGuests:
          pkg.minGuests !== undefined &&
          pkg.minGuests !== null
            ? pkg.minGuests
            : "",

        maxGuests:
          pkg.maxGuests !== undefined &&
          pkg.maxGuests !== null
            ? pkg.maxGuests
            : "",

        durationHours:
          pkg.durationHours !== null &&
          pkg.durationHours !== undefined
            ? pkg.durationHours
            : "",

        sortOrder:
          pkg.sortOrder !== undefined &&
          pkg.sortOrder !== null
            ? pkg.sortOrder
            : 0,

        isActive:
          Boolean(pkg.isActive),
      });

      setFeatures(
        Array.isArray(pkg.features)
          ? pkg.features
          : []
      );
    } catch (err) {
      console.error(
        "Fetch Package Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load package"
      );
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        await fetchHalls();

        if (isEditMode) {
          await fetchPackage();
        }
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Failed to load page data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
     FEATURES
  ===================================================== */

  const addFeature = () => {
    const value = featureInput.trim();

    if (!value) return;

    if (
      features.some(
        (feature) =>
          feature.toLowerCase() ===
          value.toLowerCase()
      )
    ) {
      setFeatureInput("");
      return;
    }

    setFeatures((prev) => [
      ...prev,
      value,
    ]);

    setFeatureInput("");
  };

  const removeFeature = (index) => {
    setFeatures((prev) =>
      prev.filter(
        (_, featureIndex) =>
          featureIndex !== index
      )
    );
  };

  const handleFeatureKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    if (!form.hallId) {
      return "Please select a hall.";
    }

    if (!form.name.trim()) {
      return "Package name is required.";
    }

    if (form.name.trim().length < 2) {
      return "Package name must be at least 2 characters.";
    }

    if (form.name.trim().length > 150) {
      return "Package name cannot exceed 150 characters.";
    }

    if (
      form.description &&
      form.description.length > 2000
    ) {
      return "Description cannot exceed 2000 characters.";
    }

    if (
      form.price === "" ||
      form.price === null ||
      Number.isNaN(Number(form.price))
    ) {
      return "Please enter a valid price.";
    }

    if (Number(form.price) < 0) {
      return "Price cannot be negative.";
    }

    if (
      form.minGuests === "" ||
      Number.isNaN(Number(form.minGuests))
    ) {
      return "Minimum guests is required.";
    }

    if (
      form.maxGuests === "" ||
      Number.isNaN(Number(form.maxGuests))
    ) {
      return "Maximum guests is required.";
    }

    const minGuests = Number(
      form.minGuests
    );

    const maxGuests = Number(
      form.maxGuests
    );

    if (
      !Number.isInteger(minGuests) ||
      minGuests < 1
    ) {
      return "Minimum guests must be a whole number greater than 0.";
    }

    if (
      !Number.isInteger(maxGuests) ||
      maxGuests < 1
    ) {
      return "Maximum guests must be a whole number greater than 0.";
    }

    if (minGuests > maxGuests) {
      return "Minimum guests cannot be greater than maximum guests.";
    }

    if (form.durationHours !== "") {
      const duration = Number(
        form.durationHours
      );

      if (
        Number.isNaN(duration) ||
        duration < 0.5 ||
        duration > 24
      ) {
        return "Duration must be between 0.5 and 24 hours.";
      }
    }

    if (
      form.sortOrder !== "" &&
      (
        Number.isNaN(
          Number(form.sortOrder)
        ) ||
        !Number.isInteger(
          Number(form.sortOrder)
        ) ||
        Number(form.sortOrder) < 0
      )
    ) {
      return "Sort order must be a whole number 0 or greater.";
    }

    return null;
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        hallId: form.hallId,
        name: form.name.trim(),
        description:
          form.description.trim(),
        price: Number(form.price),
        currency: "EGP",
        minGuests: Number(
          form.minGuests
        ),
        maxGuests: Number(
          form.maxGuests
        ),
        durationHours:
          form.durationHours === ""
            ? null
            : Number(form.durationHours),
        features,
        sortOrder:
          form.sortOrder === ""
            ? 0
            : Number(form.sortOrder),
        isActive: Boolean(
          form.isActive
        ),
      };

      let response;

      if (isEditMode) {
        response = await api.patch(
          `/packages/${id}`,
          payload
        );
      } else {
        response = await api.post(
          "/packages",
          payload
        );
      }

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            `Failed to ${
              isEditMode
                ? "update"
                : "create"
            } package`
        );
      }

      setSuccess(
        response.data.message ||
          `Package ${
            isEditMode
              ? "updated"
              : "created"
          } successfully`
      );

      setTimeout(() => {
        navigate("/owner/packages");
      }, 900);
    } catch (err) {
      console.error(
        "Save Package Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          `Failed to ${
            isEditMode
              ? "update"
              : "create"
          } package`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     SELECTED HALL
  ===================================================== */

  const selectedHall = halls.find(
    (hall) =>
      String(hall._id) ===
      String(form.hallId)
  );

  const hallCanActivate =
    selectedHall &&
    selectedHall.status === "approved" &&
    selectedHall.isAvailable === true &&
    selectedHall.isDeleted !== true;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="owner-package-form-page">
        <div className="owner-package-form-container">
          <div className="package-form-loading">
            <div className="package-form-spinner"></div>

            <p>
              Loading package form...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-package-form-page">
      <div className="owner-package-form-container">

        {/* HEADER */}

        <header className="owner-package-form-header">
          <div>
            <Link
              to="/owner/packages"
              className="package-back-link"
            >
              <FaArrowLeft />
              Back to Packages
            </Link>

            <span className="owner-page-eyebrow">
              Owner Management
            </span>

            <h1>
              {isEditMode
                ? "Edit Package"
                : "Create New Package"}
            </h1>

            <p>
              {isEditMode
                ? "Update your package details and keep your offer accurate."
                : "Create a package that customers can choose when booking your hall."}
            </p>
          </div>
        </header>

        {/* ALERTS */}

        {error && (
          <div className="package-form-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="package-form-alert success">
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          className="owner-package-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC INFO */}

          <section className="package-form-section">
            <div className="package-section-heading">
              <div className="package-section-icon">
                <FaBoxOpen />
              </div>

              <div>
                <h2>
                  Package Information
                </h2>

                <p>
                  Add the basic details of your package.
                </p>
              </div>
            </div>

            <div className="package-form-grid">

              {/* HALL */}

              <div className="package-form-group full">
                <label htmlFor="hallId">
                  <FaBuilding />
                  Hall
                  <span>*</span>
                </label>

                <select
                  id="hallId"
                  name="hallId"
                  value={form.hallId}
                  onChange={handleChange}
                  disabled={isEditMode}
                  required
                >
                  <option value="">
                    Select your hall
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

                {halls.length === 0 && (
                  <small className="package-field-warning">
                    You don't have any halls yet.
                    Create a hall first.
                  </small>
                )}

                {isEditMode && (
                  <small className="package-field-help">
                    The hall cannot be changed after creating the package.
                  </small>
                )}
              </div>

              {/* NAME */}

              <div className="package-form-group">
                <label htmlFor="name">
                  Package Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Premium Wedding Package"
                  maxLength={150}
                  required
                />

                <small>
                  {form.name.length}/150
                </small>
              </div>

              {/* PRICE */}

              <div className="package-form-group">
                <label htmlFor="price">
                  Price
                  <span>*</span>
                </label>

                <div className="package-input-with-suffix">
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="25000"
                    required
                  />

                  <span>EGP</span>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="package-form-group full">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what this package includes..."
                  maxLength={2000}
                  rows={5}
                />

                <small>
                  {form.description.length}/2000
                </small>
              </div>
            </div>
          </section>

          {/* GUESTS & DURATION */}

          <section className="package-form-section">
            <div className="package-section-heading">
              <div className="package-section-icon">
                <FaUsers />
              </div>

              <div>
                <h2>
                  Guests & Duration
                </h2>

                <p>
                  Define the package capacity and duration.
                </p>
              </div>
            </div>

            <div className="package-form-grid">

              <div className="package-form-group">
                <label htmlFor="minGuests">
                  <FaUsers />
                  Minimum Guests
                  <span>*</span>
                </label>

                <input
                  id="minGuests"
                  name="minGuests"
                  type="number"
                  min="1"
                  step="1"
                  value={form.minGuests}
                  onChange={handleChange}
                  placeholder="100"
                  required
                />
              </div>

              <div className="package-form-group">
                <label htmlFor="maxGuests">
                  <FaUsers />
                  Maximum Guests
                  <span>*</span>
                </label>

                <input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxGuests}
                  onChange={handleChange}
                  placeholder="300"
                  required
                />
              </div>

              <div className="package-form-group">
                <label htmlFor="durationHours">
                  <FaClock />
                  Duration
                </label>

                <div className="package-input-with-suffix">
                  <input
                    id="durationHours"
                    name="durationHours"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={
                      form.durationHours
                    }
                    onChange={handleChange}
                    placeholder="5"
                  />

                  <span>Hours</span>
                </div>

                <small>
                  Optional — from 0.5 to 24 hours.
                </small>
              </div>

              <div className="package-form-group">
                <label htmlFor="sortOrder">
                  <FaList />
                  Sort Order
                </label>

                <input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min="0"
                  step="1"
                  value={form.sortOrder}
                  onChange={handleChange}
                  placeholder="0"
                />

                <small>
                  Lower numbers appear first.
                </small>
              </div>
            </div>
          </section>

          {/* FEATURES */}

          <section className="package-form-section">
            <div className="package-section-heading">
              <div className="package-section-icon">
                <FaPlus />
              </div>

              <div>
                <h2>
                  Package Features
                </h2>

                <p>
                  Add the services and benefits included in this package.
                </p>
              </div>
            </div>

            <div className="package-feature-input-row">
              <input
                type="text"
                value={featureInput}
                onChange={(e) =>
                  setFeatureInput(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleFeatureKeyDown
                }
                placeholder="Example: Decoration, DJ, Dinner..."
              />

              <button
                type="button"
                onClick={addFeature}
                className="package-add-feature-btn"
              >
                <FaPlus />
                Add
              </button>
            </div>

            {features.length > 0 ? (
              <div className="package-features-list">
                {features.map(
                  (feature, index) => (
                    <div
                      className="package-feature-item"
                      key={`${feature}-${index}`}
                    >
                      <span>
                        {feature}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeFeature(
                            index
                          )
                        }
                        aria-label={`Remove ${feature}`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="package-no-features">
                No features added yet.
              </p>
            )}
          </section>

          {/* STATUS */}

          <section className="package-form-section">
            <div className="package-section-heading">
              <div className="package-section-icon">
                <FaToggleOn />
              </div>

              <div>
                <h2>
                  Package Status
                </h2>

                <p>
                  Choose whether customers can see this package.
                </p>
              </div>
            </div>

            <label className="package-active-switch">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                disabled={
                  !hallCanActivate
                }
              />

              <span className="package-switch-ui"></span>

              <div>
                <strong>
                  {form.isActive
                    ? "Package Active"
                    : "Package Inactive"}
                </strong>

                <small>
                  {hallCanActivate
                    ? "Customers can access this package when it is active."
                    : "Your hall must be approved and available before this package can be active."}
                </small>
              </div>
            </label>

            {!hallCanActivate &&
              form.hallId && (
                <div className="package-status-notice">
                  Your hall is currently not publishable.
                  The backend will keep this package inactive
                  until the hall becomes approved and available.
                </div>
              )}
          </section>

          {/* ACTIONS */}

          <div className="package-form-actions">
            <Link
              to="/owner/packages"
              className="package-cancel-btn"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="package-submit-btn"
              disabled={
                saving ||
                halls.length === 0
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
                  {isEditMode
                    ? "Update Package"
                    : "Create Package"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default OwnerPackageForm;