import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./Halls.css";

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/halls/public");

        if (response.data?.success) {
          setHalls(response.data.halls || []);
        } else {
          setHalls([]);
          setError("Unable to load wedding halls.");
        }
      } catch (err) {
        console.error("Failed to fetch halls:", err);
        setError(
          err.response?.data?.message ||
            "Something went wrong while loading wedding halls."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const cities = useMemo(() => {
    return [...new Set(halls.map((hall) => hall.city).filter(Boolean))];
  }, [halls]);

  const filteredHalls = useMemo(() => {
    let result = [...halls];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((hall) => {
        const name = hall.name?.toLowerCase() || "";
        const description = hall.description?.toLowerCase() || "";
        const hallCity = hall.city?.toLowerCase() || "";
        const hallArea = hall.area?.toLowerCase() || "";

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          hallCity.includes(searchValue) ||
          hallArea.includes(searchValue)
        );
      });
    }

    if (city) {
      result = result.filter((hall) => hall.city === city);
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) => (a.startingPrice || 0) - (b.startingPrice || 0)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) => (b.startingPrice || 0) - (a.startingPrice || 0)
      );
    }

    if (sort === "rating") {
      result.sort(
        (a, b) =>
          (b.rating?.average || 0) - (a.rating?.average || 0)
      );
    }

    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [halls, search, city, sort]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return "Price on request";

    return `${Number(price).toLocaleString("en-US")} EGP`;
  };

  const getHallImage = (hall) => {
    if (hall.coverImage?.url) {
      return hall.coverImage.url;
    }

    if (hall.images?.length && hall.images[0]?.url) {
      return hall.images[0].url;
    }

    return null;
  };

  return (
    <div className="halls-page">
      <section className="halls-hero">
        <div className="halls-hero-overlay" />

        <div className="halls-hero-content">
          <span className="halls-eyebrow">FIND YOUR PERFECT VENUE</span>

          <h1>
            Discover Wedding Halls
            <span> Made for Your Moment</span>
          </h1>

          <p>
            Explore beautiful wedding halls, compare prices and find
            the perfect place for your special day.
          </p>
        </div>
      </section>

      <main className="halls-content">
        <section className="halls-toolbar">
          <div className="halls-search-wrapper">
            <span className="halls-search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search by hall name, city or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="halls-filter-group">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Cities</option>

              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </section>

        <section className="halls-results-header">
          <div>
            <span className="halls-results-label">
              AVAILABLE VENUES
            </span>

            <h2>
              {loading
                ? "Wedding Halls"
                : `${filteredHalls.length} Wedding ${
                    filteredHalls.length === 1 ? "Hall" : "Halls"
                  }`}
            </h2>
          </div>
        </section>

        {loading && (
          <div className="halls-loading">
            <div className="halls-spinner" />
            <p>Finding beautiful venues for you...</p>
          </div>
        )}

        {!loading && error && (
          <div className="halls-state halls-error">
            <div className="halls-state-icon">!</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredHalls.length === 0 && (
          <div className="halls-state">
            <div className="halls-state-icon">⌕</div>
            <h3>No wedding halls found</h3>
            <p>
              Try changing your search or filters to find more venues.
            </p>

            {(search || city) && (
              <button
                type="button"
                className="halls-reset-btn"
                onClick={() => {
                  setSearch("");
                  setCity("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredHalls.length > 0 && (
          <div className="halls-grid">
            {filteredHalls.map((hall) => {
              const image = getHallImage(hall);

              return (
                <Link
                  to={`/halls/${hall._id}`}
                  className="hall-card"
                  key={hall._id}
                >
                  <div className="hall-card-image">
                    {image ? (
                      <img
                        src={image}
                        alt={hall.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="hall-image-placeholder">
                        <span>W</span>
                        <p>Wedding Venue</p>
                      </div>
                    )}

                    {hall.isFeatured && (
                      <span className="hall-featured-badge">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="hall-card-body">
                    <div className="hall-card-top">
                      <div>
                        <h3>{hall.name}</h3>

                        <p className="hall-location">
                          <span>⌖</span>
                          {hall.city}
                          {hall.area ? `, ${hall.area}` : ""}
                        </p>
                      </div>

                      <div className="hall-rating">
                        <span>★</span>
                        <strong>
                          {hall.rating?.average
                            ? hall.rating.average.toFixed(1)
                            : "New"}
                        </strong>

                        {hall.rating?.count > 0 && (
                          <small>({hall.rating.count})</small>
                        )}
                      </div>
                    </div>

                    <p className="hall-description">
                      {hall.description ||
                        "A beautiful venue ready to make your special day unforgettable."}
                    </p>

                    <div className="hall-info-row">
                      <div className="hall-info-item">
                        <span className="hall-info-icon">♙</span>

                        <div>
                          <small>Capacity</small>
                          <strong>
                            {hall.capacity?.min || 0} -{" "}
                            {hall.capacity?.max || 0}
                          </strong>
                        </div>
                      </div>

                      <div className="hall-info-item">
                        <span className="hall-info-icon">◆</span>

                        <div>
                          <small>Starting from</small>
                          <strong>
                            {formatPrice(hall.startingPrice)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {hall.features?.length > 0 && (
                      <div className="hall-features">
                        {hall.features.slice(0, 3).map((feature) => (
                          <span key={feature}>{feature}</span>
                        ))}

                        {hall.features.length > 3 && (
                          <span>
                            +{hall.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="hall-card-footer">
                      <span>View Hall</span>
                      <span className="hall-arrow">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Halls;