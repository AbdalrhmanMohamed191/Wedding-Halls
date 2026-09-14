// import React from "react";
// import { Link } from "react-router-dom";
// import "./Home.css";

// const featuredHalls = [
//   {
//     id: 1,
//     name: "Royal Wedding Hall",
//     location: "Mit Ghamr, Dakahlia",
//     price: "25,000",
//     capacity: "100 - 500",
//     image:
//       "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85",
//   },
//   {
//     id: 2,
//     name: "Golden Palace",
//     location: "Mansoura, Dakahlia",
//     price: "30,000",
//     capacity: "150 - 600",
//     image:
//       "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85",
//   },
//   {
//     id: 3,
//     name: "Grand Celebration",
//     location: "Talkha, Dakahlia",
//     price: "20,000",
//     capacity: "100 - 400",
//     image:
//       "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=85",
//   },
// ];

// const Home = () => {
//   return (
//     <main className="home-page">

//       {/* ================= HERO ================= */}
//       <section className="hero-section">
//         <div className="hero-overlay" />

//         <div className="hero-content">
//           <span className="hero-eyebrow">
//             YOUR PERFECT DAY STARTS HERE
//           </span>

//           <h1>
//             Find the perfect
//             <br />
//             <span>place for your</span>
//             <br />
//             perfect day.
//           </h1>

//           <p>
//             Discover beautiful wedding halls, compare packages,
//             check availability and book your dream celebration
//             with confidence.
//           </p>

//           <div className="hero-actions">
//             <Link to="/halls" className="hero-primary-btn">
//               Explore Wedding Halls
//               <span>→</span>
//             </Link>

//             <Link
//               to="/how-it-works"
//               className="hero-secondary-btn"
//             >
//               How it works
//             </Link>
//           </div>
//         </div>

//         <div className="hero-scroll">
//           <span>Scroll to explore</span>
//           <div className="scroll-line" />
//         </div>
//       </section>

//       {/* ================= SEARCH ================= */}
//       <section className="search-section">
//         <div className="search-box">

//           <div className="search-item">
//             <span className="search-icon">⌖</span>

//             <div>
//               <label>Location</label>
//               <p>Where is your wedding?</p>
//             </div>
//           </div>

//           <div className="search-divider" />

//           <div className="search-item">
//             <span className="search-icon">◷</span>

//             <div>
//               <label>Wedding date</label>
//               <p>Choose your date</p>
//             </div>
//           </div>

//           <div className="search-divider" />

//           <div className="search-item">
//             <span className="search-icon">♙</span>

//             <div>
//               <label>Guests</label>
//               <p>How many guests?</p>
//             </div>
//           </div>

//           <Link to="/halls" className="search-button">
//             Search
//           </Link>
//         </div>
//       </section>

//       {/* ================= FEATURED HALLS ================= */}
//       <section className="featured-section">
//         <div className="section-heading">
//           <div>
//             <span className="section-label">
//               DISCOVER YOUR VENUE
//             </span>

//             <h2>
//               Beautiful halls.
//               <br />
//               <span>Unforgettable moments.</span>
//             </h2>
//           </div>

//           <Link to="/halls" className="view-all-link">
//             View all halls <span>→</span>
//           </Link>
//         </div>

//         <div className="halls-grid">
//           {featuredHalls.map((hall) => (
//             <Link
//               to={`/halls/${hall.id}`}
//               className="hall-card"
//               key={hall.id}
//             >
//               <div className="hall-image-wrapper">
//                 <img
//                   src={hall.image}
//                   alt={hall.name}
//                 />

//                 <div className="hall-image-overlay" />

//                 <span className="hall-badge">
//                   Featured
//                 </span>

//                 <button
//                   type="button"
//                   className="favorite-btn"
//                   onClick={(event) => event.preventDefault()}
//                   aria-label="Add to favorites"
//                 >
//                   ♡
//                 </button>
//               </div>

//               <div className="hall-card-content">
//                 <div className="hall-location">
//                   <span>⌖</span>
//                   {hall.location}
//                 </div>

//                 <h3>{hall.name}</h3>

//                 <div className="hall-details">
//                   <span>
//                     <strong>{hall.capacity}</strong> guests
//                   </span>

//                   <span className="hall-price">
//                     From <strong>{hall.price}</strong> EGP
//                   </span>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* ================= HOME CTA ================= */}
//       <section className="home-cta">
//         <div className="home-cta-content">
//           <span className="section-label">
//             YOUR DAY. YOUR VENUE.
//           </span>

//           <h2>
//             Ready to find your
//             <br />
//             <span>perfect wedding hall?</span>
//           </h2>

//           <p>
//             Explore beautiful venues, compare packages and
//             find the perfect place for your celebration.
//           </p>

//           <Link to="/halls" className="cta-btn">
//             Find Your Hall
//             <span>→</span>
//           </Link>
//         </div>
//       </section>

//       {/* ================= FOOTER ================= */}
//       <footer className="home-footer">
//         <div className="footer-main">

//           <div>
//             <Link to="/" className="footer-logo">
//               <span>Wed</span>ora
//             </Link>

//             <p>
//               Making your journey to the perfect wedding
//               venue simple, beautiful and unforgettable.
//             </p>
//           </div>

//           <div className="footer-column">
//             <h4>Explore</h4>

//             <Link to="/halls">
//               Wedding Halls
//             </Link>

//             <Link to="/halls">
//               Featured Halls
//             </Link>

//             <Link to="/how-it-works">
//               How It Works
//             </Link>
//           </div>

//           <div className="footer-column">
//             <h4>Company</h4>

//             <Link to="/about">
//               About Us
//             </Link>

//             <Link to="/contact">
//               Contact
//             </Link>

//             <Link to="/privacy">
//               Privacy Policy
//             </Link>
//           </div>

//           <div className="footer-column">
//             <h4>For Hall Owners</h4>

//             <Link to="/register">
//               List Your Hall
//             </Link>

//             <Link to="/login">
//               Owner Login
//             </Link>
//           </div>

//         </div>

//         <div className="footer-bottom">
//           <span>
//             © 2026 Wedora. All rights reserved.
//           </span>

//           <span>
//             Made for unforgettable moments.
//           </span>
//         </div>
//       </footer>

//     </main>
//   );
// };

// export default Home;



import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import api from "../../api/axios";

const Home = () => {
  const [featuredHalls, setFeaturedHalls] = useState([]);
  const [loadingHalls, setLoadingHalls] = useState(true);

  useEffect(() => {
    const fetchFeaturedHalls = async () => {
      try {
        setLoadingHalls(true);

        const response = await api.get("/halls/public", {
          params: {
            sort: "featured",
            limit: 3,
          },
        });

        const halls = response.data?.halls || [];

        setFeaturedHalls(halls);
      } catch (error) {
        console.error("Failed to fetch featured halls:", error);
        setFeaturedHalls([]);
      } finally {
        setLoadingHalls(false);
      }
    };

    fetchFeaturedHalls();
  }, []);

  return (
    <main className="home-page">

      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-eyebrow">
            YOUR PERFECT DAY STARTS HERE
          </span>

          <h1>
            Find the perfect
            <br />
            <span>place for your</span>
            <br />
            perfect day.
          </h1>

          <p>
            Discover beautiful wedding halls, compare packages,
            check availability and book your dream celebration
            with confidence.
          </p>

          <div className="hero-actions">
            <Link to="/halls" className="hero-primary-btn">
              Explore Wedding Halls
              <span>→</span>
            </Link>

            <Link
              to="/how-it-works"
              className="hero-secondary-btn"
            >
              How it works
            </Link>
          </div>
        </div>

        <div className="hero-scroll">
          <span>Scroll to explore</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ================= SEARCH ================= */}
      <section className="search-section">
        <div className="search-box">

          <div className="search-item">
            <span className="search-icon">⌖</span>

            <div>
              <label>Location</label>
              <p>Where is your wedding?</p>
            </div>
          </div>

          <div className="search-divider" />

          <div className="search-item">
            <span className="search-icon">◷</span>

            <div>
              <label>Wedding date</label>
              <p>Choose your date</p>
            </div>
          </div>

          <div className="search-divider" />

          <div className="search-item">
            <span className="search-icon">♙</span>

            <div>
              <label>Guests</label>
              <p>How many guests?</p>
            </div>
          </div>

          <Link to="/halls" className="search-button">
            Search
          </Link>
        </div>
      </section>

      {/* ================= FEATURED HALLS ================= */}
      <section className="featured-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              DISCOVER YOUR VENUE
            </span>

            <h2>
              Beautiful halls.
              <br />
              <span>Unforgettable moments.</span>
            </h2>
          </div>

          <Link to="/halls" className="view-all-link">
            View all halls <span>→</span>
          </Link>
        </div>

        {loadingHalls ? (
          <div className="halls-grid">
            {[1, 2, 3].map((item) => (
              <div className="hall-card" key={item}>
                <div
                  className="hall-image-wrapper"
                  style={{
                    background: "#f3f3f3",
                    minHeight: "260px",
                  }}
                />
              </div>
            ))}
          </div>
        ) : featuredHalls.length > 0 ? (
          <div className="halls-grid">
            {featuredHalls.map((hall) => (
              <Link
                to={`/halls/${hall._id}`}
                className="hall-card"
                key={hall._id}
              >
                <div className="hall-image-wrapper">

                  {hall.coverImage?.url ? (
                    <img
                      src={hall.coverImage.url}
                      alt={hall.name}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "260px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f3f3f3",
                      }}
                    >
                      No Image
                    </div>
                  )}

                  <div className="hall-image-overlay" />

                  {hall.isFeatured && (
                    <span className="hall-badge">
                      Featured
                    </span>
                  )}

                  <button
                    type="button"
                    className="favorite-btn"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    aria-label="Add to favorites"
                  >
                    ♡
                  </button>
                </div>

                <div className="hall-card-content">

                  <div className="hall-location">
                    <span>⌖</span>
                    {hall.city}
                    {hall.area ? `, ${hall.area}` : ""}
                  </div>

                  <h3>{hall.name}</h3>

                  <div className="hall-details">
                    <span>
                      <strong>
                        {hall.capacity?.min} - {hall.capacity?.max}
                      </strong>{" "}
                      guests
                    </span>

                    <span className="hall-price">
                      From{" "}
                      <strong>
                        {Number(hall.startingPrice || 0).toLocaleString()}
                      </strong>{" "}
                      EGP
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-halls">
            <h3>No halls available yet</h3>
            <p>
              New wedding halls will appear here once they are approved.
            </p>

            <Link to="/halls" className="view-all-link">
              Explore halls
            </Link>
          </div>
        )}
      </section>

      {/* ================= HOME CTA ================= */}
      <section className="home-cta">
        <div className="home-cta-content">
          <span className="section-label">
            YOUR DAY. YOUR VENUE.
          </span>

          <h2>
            Ready to find your
            <br />
            <span>perfect wedding hall?</span>
          </h2>

          <p>
            Explore beautiful venues, compare packages and
            find the perfect place for your celebration.
          </p>

          <Link to="/halls" className="cta-btn">
            Find Your Hall
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="home-footer">
        <div className="footer-main">

          <div>
            <Link to="/" className="footer-logo">
              <span>Wed</span>ora
            </Link>

            <p>
              Making your journey to the perfect wedding
              venue simple, beautiful and unforgettable.
            </p>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>

            <Link to="/halls">
              Wedding Halls
            </Link>

            <Link to="/halls">
              Featured Halls
            </Link>

            <Link to="/how-it-works">
              How It Works
            </Link>
          </div>

          <div className="footer-column">
            <h4>Company</h4>

            <Link to="/about">
              About Us
            </Link>

            <Link to="/contact">
              Contact
            </Link>

            <Link to="/privacy">
              Privacy Policy
            </Link>
          </div>

          <div className="footer-column">
            <h4>For Hall Owners</h4>

            <Link to="/register">
              List Your Hall
            </Link>

            <Link to="/login">
              Owner Login
            </Link>
          </div>

        </div>

        <div className="footer-bottom">
          <span>
            © 2026 Wedora. All rights reserved.
          </span>

          <span>
            Made for unforgettable moments.
          </span>
        </div>
      </footer>

    </main>
  );
};

export default Home;