import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import api from "../../api/axios";
import "./ChoosePackage.css";

const ChoosePackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [hall, setHall] = useState(
    location.state?.hall || null
  );

  const [packages, setPackages] = useState([]);

  const [selectedPackage, setSelectedPackage] = useState(
    location.state?.selectedPackage || null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = [
          api.get(`/packages/public/hall/${id}`),
        ];

        // لو القاعة مش جاية من HallDetails
        if (!hall) {
          requests.push(api.get(`/halls/public/${id}`));
        }

        const responses = await Promise.all(requests);

        const packagesResponse = responses[0];
        const packageData = packagesResponse.data;

        if (packageData?.success) {
          const fetchedPackages =
            packageData.packages ||
            packageData.data?.packages ||
            packageData.data ||
            [];

          const activePackages = Array.isArray(fetchedPackages)
            ? fetchedPackages.filter(
                (pkg) => pkg.isActive !== false
              )
            : [];

          setPackages(activePackages);

          // لو مفيش package مختارة، نختار أول واحدة
          if (
            !selectedPackage &&
            activePackages.length > 0
          ) {
            setSelectedPackage(activePackages[0]);
          }
        } else {
          setPackages([]);
        }

        // Hall response
        if (!hall && responses[1]?.data?.success) {
          setHall(responses[1].data.hall);
        }
      } catch (err) {
        console.error("Choose package error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Something went wrong while loading packages."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return "Price on request";
    }

    return `${Number(price).toLocaleString("en-US")} EGP`;
  };

  const handleContinue = () => {
    if (!selectedPackage) {
      toast.error("Please choose a package first.");
      return;
    }

    navigate(`/halls/${id}/book`, {
      state: {
        hall,
        selectedPackage,
      },
    });
  };

  if (loading) {
    return (
      <div className="choose-package-page">
        <div className="choose-package-loading">
          <div className="choose-package-spinner" />
          <p>Loading packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="choose-package-page">
        <div className="choose-package-state">
          <div className="choose-package-state-icon">
            !
          </div>

          <h2>Unable to load packages</h2>

          <p>{error}</p>

          <Link
            to={`/halls/${id}`}
            className="choose-package-back"
          >
            ← Back to Hall
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="choose-package-page">
      <div className="choose-package-container">

        {/* =========================
            BREADCRUMB
        ========================= */}

        <div className="choose-package-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>

          <Link to="/halls">Wedding Halls</Link>
          <span>/</span>

          <Link to={`/halls/${id}`}>
            {hall?.name || "Wedding Hall"}
          </Link>

          <span>/</span>

          <strong>Choose Package</strong>
        </div>

        {/* =========================
            HEADER
        ========================= */}

        <section className="choose-package-header">
          <div>
            <span className="choose-package-eyebrow">
              STEP 1 OF 2
            </span>

            <h1>Choose Your Package</h1>

            <p>
              Select the package that best fits your
              celebration.
            </p>
          </div>

          <div className="choose-package-step">
            <div className="step-item active">
              <span>1</span>
              <strong>Package</strong>
            </div>

            <div className="step-line" />

            <div className="step-item">
              <span>2</span>
              <strong>Booking Details</strong>
            </div>
          </div>
        </section>

        {/* =========================
            HALL SUMMARY
        ========================= */}

        {hall && (
          <section className="choose-package-hall">
            <div className="choose-package-hall-image">
              {hall.coverImage?.url ? (
                <img
                  src={hall.coverImage.url}
                  alt={hall.name}
                />
              ) : (
                <div className="choose-package-hall-placeholder">
                  W
                </div>
              )}
            </div>

            <div className="choose-package-hall-info">
              <span>WEDDING VENUE</span>

              <h2>{hall.name}</h2>

              <p>
                {hall.address || hall.city || "Location not specified"}
              </p>
            </div>

            <Link
              to={`/halls/${id}`}
              className="choose-package-view-hall"
            >
              View Hall
            </Link>
          </section>
        )}

        {/* =========================
            PACKAGES
        ========================= */}

        {packages.length === 0 ? (
          <section className="choose-package-empty">
            <div className="choose-package-empty-icon">
              ◇
            </div>

            <h2>No Packages Available</h2>

            <p>
              This wedding hall doesn't have any active
              packages available for booking yet.
            </p>

            <Link
              to={`/halls/${id}`}
              className="choose-package-back"
            >
              ← Back to Hall
            </Link>
          </section>
        ) : (
          <>
            <section className="choose-package-grid">
              {packages.map((pkg) => {
                const isSelected =
                  selectedPackage?._id === pkg._id;

                return (
                  <button
                    type="button"
                    key={pkg._id}
                    className={`choose-package-card ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() =>
                      setSelectedPackage(pkg)
                    }
                  >
                    {isSelected && (
                      <div className="package-selected-badge">
                        ✓ Selected
                      </div>
                    )}

                    {pkg.image?.url && (
                      <div className="choose-package-image">
                        <img
                          src={pkg.image.url}
                          alt={pkg.name}
                        />
                      </div>
                    )}

                    <div className="choose-package-card-body">
                      <div className="choose-package-card-top">
                        <div>
                          <span className="package-label">
                            PACKAGE
                          </span>

                          <h3>{pkg.name}</h3>
                        </div>

                        <div className="package-radio">
                          <span />
                        </div>
                      </div>

                      {pkg.description && (
                        <p className="choose-package-description">
                          {pkg.description}
                        </p>
                      )}

                      <div className="choose-package-price">
                        <span>PACKAGE PRICE</span>

                        <strong>
                          {formatPrice(pkg.price)}
                        </strong>
                      </div>

                      <div className="choose-package-details">
                        {(pkg.minGuests ||
                          pkg.maxGuests) && (
                          <div className="package-detail">
                            <span className="detail-icon">
                              ♙
                            </span>

                            <div>
                              <small>Guests</small>

                              <strong>
                                {pkg.minGuests || 0} -{" "}
                                {pkg.maxGuests ||
                                  "Unlimited"}
                              </strong>
                            </div>
                          </div>
                        )}

                        {pkg.durationHours && (
                          <div className="package-detail">
                            <span className="detail-icon">
                              ◷
                            </span>

                            <div>
                              <small>Duration</small>

                              <strong>
                                {pkg.durationHours} hours
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>

                      {pkg.features?.length > 0 && (
                        <div className="choose-package-features">
                          <span className="features-title">
                            Includes
                          </span>

                          {pkg.features
                            .slice(0, 6)
                            .map((feature) => (
                              <div
                                key={feature}
                                className="package-feature"
                              >
                                <span>✓</span>
                                {feature}
                              </div>
                            ))}
                        </div>
                      )}

                      <div
                        className={`choose-package-select ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                      >
                        <span>
                          {isSelected
                            ? "Package selected"
                            : "Select this package"}
                        </span>

                        <span>→</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </section>

            {/* =========================
                BOTTOM ACTION
            ========================= */}

            <section className="choose-package-footer">
              <div>
                <span>Selected package</span>

                <strong>
                  {selectedPackage?.name ||
                    "Choose a package"}
                </strong>
              </div>

              <button
                type="button"
                className="choose-package-continue"
                onClick={handleContinue}
                disabled={!selectedPackage}
              >
                Continue to Booking
                <span>→</span>
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default ChoosePackage;
