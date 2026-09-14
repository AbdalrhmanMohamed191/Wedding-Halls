// import React, { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import api from "../../api/axios";
// import "./HallDetails.css";

// const HallDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [hall, setHall] = useState(null);
//   const [packages, setPackages] = useState([]);
//   const [availability, setAvailability] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [activeImage, setActiveImage] = useState(0);

//   useEffect(() => {
//     const fetchHallDetails = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const [hallResponse, packagesResponse, availabilityResponse] =
//           await Promise.all([
//             api.get(`/halls/public/${id}`),
//             api.get(`/packages/public/hall/${id}`),
//             api.get(`/availability/public/hall/${id}`),
//           ]);

//         /*
//           Hall API
//         */
//         if (hallResponse.data?.success) {
//           setHall(hallResponse.data.hall);
//         } else {
//           throw new Error("Wedding hall not found.");
//         }

//         /*
//           Packages API
//           We support the common response shapes so the page
//           doesn't break if the controller returns packages
//           directly or inside data.
//         */
//         const packageData = packagesResponse.data;

//         if (packageData?.success) {
//           setPackages(
//             packageData.packages ||
//               packageData.data?.packages ||
//               packageData.data ||
//               []
//           );
//         } else {
//           setPackages([]);
//         }

//         /*
//           Availability API
//         */
//         const availabilityData = availabilityResponse.data;

//         if (availabilityData?.success) {
//           setAvailability(
//             availabilityData.availability ||
//               availabilityData.data?.availability ||
//               availabilityData.data ||
//               []
//           );
//         } else {
//           setAvailability([]);
//         }
//       } catch (err) {
//         console.error("Hall details error:", err);

//         setError(
//           err.response?.data?.message ||
//             err.message ||
//             "Something went wrong while loading this wedding hall."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchHallDetails();
//     }
//   }, [id]);

//   const galleryImages = useMemo(() => {
//     if (!hall) return [];

//     const images = [];

//     if (hall.coverImage?.url) {
//       images.push(hall.coverImage.url);
//     }

//     if (Array.isArray(hall.images)) {
//       hall.images.forEach((image) => {
//         if (image?.url && !images.includes(image.url)) {
//           images.push(image.url);
//         }
//       });
//     }

//     return images;
//   }, [hall]);

//   const formatPrice = (price) => {
//     if (price === null || price === undefined) {
//       return "Price on request";
//     }

//     return `${Number(price).toLocaleString("en-US")} EGP`;
//   };

//   const getPackagePrice = (pkg) => {
//     if (pkg.price === undefined || pkg.price === null) {
//       return "Price on request";
//     }

//     return formatPrice(pkg.price);
//   };

//   const isDateAvailable = (date) => {
//     const item = availability.find(
//       (entry) => String(entry.date).slice(0, 10) === date
//     );

//     if (!item) return true;

//     return item.status === "available";
//   };

//   const handleBook = (selectedPackage = null) => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       navigate("/login", {
//         state: {
//           from: `/halls/${id}`,
//           message: "Please login to book this wedding hall.",
//         },
//       });

//       return;
//     }

//     navigate(`/halls/${id}/book`, {
//       state: {
//         hall,
//         selectedPackage,
//       },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="hall-details-page">
//         <div className="hall-details-loading">
//           <div className="hall-details-spinner" />
//           <p>Loading wedding hall...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !hall) {
//     return (
//       <div className="hall-details-page">
//         <div className="hall-details-state">
//           <div className="hall-details-state-icon">!</div>

//           <h2>Wedding Hall Not Found</h2>

//           <p>
//             {error ||
//               "We couldn't find the wedding hall you're looking for."}
//           </p>

//           <Link to="/halls" className="hall-back-button">
//             ← Back to Wedding Halls
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const rating = hall.rating?.average || 0;
//   const ratingCount = hall.rating?.count || 0;

//   return (
//     <div className="hall-details-page">
//       {/* =========================
//           BREADCRUMB
//       ========================= */}

//       <div className="hall-details-container">
//         <div className="hall-breadcrumb">
//           <Link to="/">Home</Link>
//           <span>/</span>
//           <Link to="/halls">Wedding Halls</Link>
//           <span>/</span>
//           <strong>{hall.name}</strong>
//         </div>

//         {/* =========================
//             GALLERY
//         ========================= */}

//         <section className="hall-gallery-section">
//           <div className="hall-gallery-main">
//             {galleryImages.length > 0 ? (
//               <img
//                 src={galleryImages[activeImage]}
//                 alt={hall.name}
//               />
//             ) : (
//               <div className="hall-gallery-placeholder">
//                 <span>W</span>
//                 <p>Wedding Venue</p>
//               </div>
//             )}

//             {hall.isFeatured && (
//               <span className="hall-details-featured">
//                 Featured
//               </span>
//             )}

//             {galleryImages.length > 1 && (
//               <>
//                 <button
//                   type="button"
//                   className="gallery-arrow gallery-arrow-left"
//                   onClick={() =>
//                     setActiveImage(
//                       activeImage === 0
//                         ? galleryImages.length - 1
//                         : activeImage - 1
//                     )
//                   }
//                 >
//                   ‹
//                 </button>

//                 <button
//                   type="button"
//                   className="gallery-arrow gallery-arrow-right"
//                   onClick={() =>
//                     setActiveImage(
//                       activeImage === galleryImages.length - 1
//                         ? 0
//                         : activeImage + 1
//                     )
//                   }
//                 >
//                   ›
//                 </button>
//               </>
//             )}
//           </div>

//           {galleryImages.length > 1 && (
//             <div className="hall-gallery-thumbnails">
//               {galleryImages.map((image, index) => (
//                 <button
//                   type="button"
//                   key={image}
//                   className={`hall-gallery-thumbnail ${
//                     activeImage === index ? "active" : ""
//                   }`}
//                   onClick={() => setActiveImage(index)}
//                 >
//                   <img src={image} alt={`${hall.name} ${index + 1}`} />
//                 </button>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* =========================
//             MAIN INFO
//         ========================= */}

//         <section className="hall-main-info">
//           <div className="hall-main-info-left">
//             <span className="hall-details-eyebrow">
//               WEDDING VENUE
//             </span>

//             <h1>{hall.name}</h1>

//             <div className="hall-details-location">
//               <span>⌖</span>

//               <span>
//                 {hall.address || hall.area || hall.city}
//                 {hall.city && hall.address
//                   ? `, ${hall.city}`
//                   : ""}
//               </span>
//             </div>

//             <div className="hall-details-rating">
//               <span className="rating-star">★</span>

//               <strong>
//                 {rating > 0 ? rating.toFixed(1) : "New"}
//               </strong>

//               {ratingCount > 0 && (
//                 <span>
//                   {ratingCount}{" "}
//                   {ratingCount === 1 ? "review" : "reviews"}
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="hall-main-info-price">
//             <span>STARTING FROM</span>

//             <strong>{formatPrice(hall.startingPrice)}</strong>

//             <small>per event</small>
//           </div>
//         </section>

//         {/* =========================
//             QUICK INFO
//         ========================= */}

//         <section className="hall-quick-info">
//           <div className="hall-quick-item">
//             <div className="hall-quick-icon">♙</div>

//             <div>
//               <span>Capacity</span>

//               <strong>
//                 {hall.capacity?.min || 0} -{" "}
//                 {hall.capacity?.max || 0} Guests
//               </strong>
//             </div>
//           </div>

//           <div className="hall-quick-item">
//             <div className="hall-quick-icon">⌖</div>

//             <div>
//               <span>Location</span>

//               <strong>
//                 {hall.city || "Not specified"}
//               </strong>
//             </div>
//           </div>

//           <div className="hall-quick-item">
//             <div className="hall-quick-icon">★</div>

//             <div>
//               <span>Rating</span>

//               <strong>
//                 {rating > 0 ? `${rating.toFixed(1)} / 5` : "New"}
//               </strong>
//             </div>
//           </div>

//           <div className="hall-quick-item">
//             <div className="hall-quick-icon">✓</div>

//             <div>
//               <span>Status</span>

//               <strong>
//                 {hall.isAvailable ? "Available" : "Unavailable"}
//               </strong>
//             </div>
//           </div>
//         </section>

//         {/* =========================
//             DESCRIPTION + FEATURES
//         ========================= */}

//         <section className="hall-content-grid">
//           <div className="hall-about">
//             <span className="hall-section-label">ABOUT THE VENUE</span>

//             <h2>Everything You Need for Your Special Day</h2>

//             <p>
//               {hall.description ||
//                 "This beautiful wedding venue is ready to make your special day unforgettable."}
//             </p>

//             {hall.address && (
//               <div className="hall-address-box">
//                 <span>⌖</span>

//                 <div>
//                   <small>ADDRESS</small>
//                   <strong>{hall.address}</strong>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="hall-features-section">
//             <span className="hall-section-label">
//               VENUE FEATURES
//             </span>

//             <h2>What This Venue Offers</h2>

//             {hall.features?.length > 0 ? (
//               <div className="hall-details-features">
//                 {hall.features.map((feature) => (
//                   <div
//                     className="hall-detail-feature"
//                     key={feature}
//                   >
//                     <span>✓</span>
//                     <p>{feature}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="hall-no-data">
//                 No features have been added yet.
//               </p>
//             )}
//           </div>
//         </section>

//         {/* =========================
//             PACKAGES
//         ========================= */}

//         <section className="hall-packages-section">
//           <div className="hall-section-heading">
//             <div>
//               <span className="hall-section-label">
//                 WEDDING PACKAGES
//               </span>

//               <h2>Choose Your Perfect Package</h2>

//               <p>
//                 Select a package that matches your celebration
//                 and your needs.
//               </p>
//             </div>
//           </div>

//           {packages.length === 0 ? (
//             <div className="hall-no-packages">
//               <span>◇</span>

//               <h3>No Packages Available Yet</h3>

//               <p>
//                 The hall owner hasn't added any packages yet.
//               </p>
//             </div>
//           ) : (
//             <div className="hall-packages-grid">
//               {packages.map((pkg) => (
//                 <div className="hall-package-card" key={pkg._id}>
//                   {pkg.image?.url && (
//                     <div className="hall-package-image">
//                       <img
//                         src={pkg.image.url}
//                         alt={pkg.name}
//                       />
//                     </div>
//                   )}

//                   <div className="hall-package-body">
//                     <div className="hall-package-top">
//                       <h3>{pkg.name}</h3>

//                       {pkg.isActive === false && (
//                         <span className="package-inactive">
//                           Unavailable
//                         </span>
//                       )}
//                     </div>

//                     {pkg.description && (
//                       <p className="hall-package-description">
//                         {pkg.description}
//                       </p>
//                     )}

//                     <div className="hall-package-price">
//                       <small>PACKAGE PRICE</small>
//                       <strong>{getPackagePrice(pkg)}</strong>
//                     </div>

//                     {(pkg.minGuests || pkg.maxGuests) && (
//                       <div className="hall-package-detail">
//                         <span>Guests</span>

//                         <strong>
//                           {pkg.minGuests || 0} -{" "}
//                           {pkg.maxGuests || "Unlimited"}
//                         </strong>
//                       </div>
//                     )}

//                     {pkg.durationHours && (
//                       <div className="hall-package-detail">
//                         <span>Duration</span>

//                         <strong>
//                           {pkg.durationHours} hours
//                         </strong>
//                       </div>
//                     )}

//                     {pkg.features?.length > 0 && (
//                       <div className="hall-package-features">
//                         {pkg.features.slice(0, 5).map((feature) => (
//                           <span key={feature}>
//                             ✓ {feature}
//                           </span>
//                         ))}
//                       </div>
//                     )}

//                     <button
//                       type="button"
//                       className="hall-package-book"
//                       disabled={pkg.isActive === false}
//                       onClick={() => handleBook(pkg)}
//                     >
//                       {pkg.isActive === false
//                         ? "Currently Unavailable"
//                         : "Choose This Package"}
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* =========================
//             AVAILABILITY
//         ========================= */}

//         <section className="hall-availability-section">
//           <div className="hall-section-heading">
//             <div>
//               <span className="hall-section-label">
//                 AVAILABILITY
//               </span>

//               <h2>Check Venue Availability</h2>

//               <p>
//                 See the current availability before making your
//                 booking.
//               </p>
//             </div>
//           </div>

//           <div className="hall-availability-card">
//             {availability.length === 0 ? (
//               <div className="hall-availability-empty">
//                 <span>✓</span>

//                 <div>
//                   <strong>
//                     No blocked dates currently listed
//                   </strong>

//                   <p>
//                     You can continue to the booking process and
//                     select your preferred event date.
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className="availability-legend">
//                   <div>
//                     <span className="legend-dot available" />
//                     Available
//                   </div>

//                   <div>
//                     <span className="legend-dot blocked" />
//                     Blocked
//                   </div>
//                 </div>

//                 <div className="availability-list">
//                   {availability
//                     .slice()
//                     .sort(
//                       (a, b) =>
//                         new Date(a.date) -
//                         new Date(b.date)
//                     )
//                     .map((item) => {
//                       const date = new Date(item.date);

//                       return (
//                         <div
//                           className={`availability-item ${
//                             item.status === "blocked"
//                               ? "blocked"
//                               : "available"
//                           }`}
//                           key={item._id || item.date}
//                         >
//                           <div>
//                             <strong>
//                               {date.toLocaleDateString(
//                                 "en-US",
//                                 {
//                                   weekday: "short",
//                                   month: "short",
//                                   day: "numeric",
//                                   year: "numeric",
//                                 }
//                               )}
//                             </strong>

//                             {item.reason && (
//                               <small>{item.reason}</small>
//                             )}
//                           </div>

//                           <span>
//                             {item.status === "blocked"
//                               ? "Blocked"
//                               : "Available"}
//                           </span>
//                         </div>
//                       );
//                     })}
//                 </div>
//               </>
//             )}

//             <button
//               type="button"
//               className="hall-main-book-button"
//               onClick={() => handleBook()}
//               disabled={hall.isAvailable === false}
//             >
//               {hall.isAvailable === false
//                 ? "Currently Unavailable"
//                 : "Book This Wedding Hall"}
//             </button>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default HallDetails;


import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./HallDetails.css";

const HallDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hall, setHall] = useState(null);
  const [packages, setPackages] = useState([]);
  const [availability, setAvailability] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchHallDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [hallResponse, packagesResponse, availabilityResponse] =
          await Promise.all([
            api.get(`/halls/public/${id}`),
            api.get(`/packages/public/hall/${id}`),
            api.get(`/availability/public/hall/${id}`),
          ]);

        /*
          Hall API
        */
        if (hallResponse.data?.success) {
          setHall(hallResponse.data.hall);
        } else {
          throw new Error("Wedding hall not found.");
        }

        /*
          Packages API
        */
        const packageData = packagesResponse.data;

        if (packageData?.success) {
          setPackages(
            packageData.packages ||
              packageData.data?.packages ||
              packageData.data ||
              []
          );
        } else {
          setPackages([]);
        }

        /*
          Availability API
        */
        const availabilityData = availabilityResponse.data;

        if (availabilityData?.success) {
          setAvailability(
            availabilityData.availability ||
              availabilityData.data?.availability ||
              availabilityData.data ||
              []
          );
        } else {
          setAvailability([]);
        }
      } catch (err) {
        console.error("Hall details error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Something went wrong while loading this wedding hall."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHallDetails();
    }
  }, [id]);

  /*
    Build gallery images
  */
  const galleryImages = useMemo(() => {
    if (!hall) return [];

    const images = [];

    if (hall.coverImage?.url) {
      images.push(hall.coverImage.url);
    }

    if (Array.isArray(hall.images)) {
      hall.images.forEach((image) => {
        if (image?.url && !images.includes(image.url)) {
          images.push(image.url);
        }
      });
    }

    return images;
  }, [hall]);

  /*
    Format prices
  */
  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return "Price on request";
    }

    return `${Number(price).toLocaleString("en-US")} EGP`;
  };

  const getPackagePrice = (pkg) => {
    if (pkg.price === undefined || pkg.price === null) {
      return "Price on request";
    }

    return formatPrice(pkg.price);
  };

  /*
    Check availability
  */
  const isDateAvailable = (date) => {
    const item = availability.find(
      (entry) => String(entry.date).slice(0, 10) === date
    );

    if (!item) return true;

    return item.status === "available";
  };

  /*
    Booking flow:
    Hall Details
        ↓
    Choose Package
        ↓
    Booking
  */
  const handleBook = () => {
    navigate(`/halls/${id}/packages`, {
      state: {
        hall,
      },
    });
  };

  /*
    Loading state
  */
  if (loading) {
    return (
      <div className="hall-details-page">
        <div className="hall-details-loading">
          <div className="hall-details-spinner" />
          <p>Loading wedding hall...</p>
        </div>
      </div>
    );
  }

  /*
    Error state
  */
  if (error || !hall) {
    return (
      <div className="hall-details-page">
        <div className="hall-details-state">
          <div className="hall-details-state-icon">!</div>

          <h2>Wedding Hall Not Found</h2>

          <p>
            {error ||
              "We couldn't find the wedding hall you're looking for."}
          </p>

          <Link to="/halls" className="hall-back-button">
            ← Back to Wedding Halls
          </Link>
        </div>
      </div>
    );
  }

  const rating = hall.rating?.average || 0;
  const ratingCount = hall.rating?.count || 0;

  return (
    <div className="hall-details-page">
      <div className="hall-details-container">
        {/* =========================
            BREADCRUMB
        ========================= */}

        <div className="hall-breadcrumb">
          <Link to="/">Home</Link>

          <span>/</span>

          <Link to="/halls">Wedding Halls</Link>

          <span>/</span>

          <strong>{hall.name}</strong>
        </div>

        {/* =========================
            GALLERY
        ========================= */}

        <section className="hall-gallery-section">
          <div className="hall-gallery-main">
            {galleryImages.length > 0 ? (
              <img
                src={galleryImages[activeImage]}
                alt={hall.name}
              />
            ) : (
              <div className="hall-gallery-placeholder">
                <span>W</span>
                <p>Wedding Venue</p>
              </div>
            )}

            {hall.isFeatured && (
              <span className="hall-details-featured">
                Featured
              </span>
            )}

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-left"
                  onClick={() =>
                    setActiveImage(
                      activeImage === 0
                        ? galleryImages.length - 1
                        : activeImage - 1
                    )
                  }
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="gallery-arrow gallery-arrow-right"
                  onClick={() =>
                    setActiveImage(
                      activeImage === galleryImages.length - 1
                        ? 0
                        : activeImage + 1
                    )
                  }
                >
                  ›
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="hall-gallery-thumbnails">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image}
                  className={`hall-gallery-thumbnail ${
                    activeImage === index ? "active" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image}
                    alt={`${hall.name} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            MAIN INFO
        ========================= */}

        <section className="hall-main-info">
          <div className="hall-main-info-left">
            <span className="hall-details-eyebrow">
              WEDDING VENUE
            </span>

            <h1>{hall.name}</h1>

            <div className="hall-details-location">
              <span>⌖</span>

              <span>
                {hall.address || hall.area || hall.city}

                {hall.city && hall.address
                  ? `, ${hall.city}`
                  : ""}
              </span>
            </div>

            <div className="hall-details-rating">
              <span className="rating-star">★</span>

              <strong>
                {rating > 0 ? rating.toFixed(1) : "New"}
              </strong>

              {ratingCount > 0 && (
                <span>
                  {ratingCount}{" "}
                  {ratingCount === 1
                    ? "review"
                    : "reviews"}
                </span>
              )}
            </div>
          </div>

          <div className="hall-main-info-price">
            <span>STARTING FROM</span>

            <strong>
              {formatPrice(hall.startingPrice)}
            </strong>

            <small>per event</small>
          </div>
        </section>

        {/* =========================
            QUICK INFO
        ========================= */}

        <section className="hall-quick-info">
          <div className="hall-quick-item">
            <div className="hall-quick-icon">
              ♙
            </div>

            <div>
              <span>Capacity</span>

              <strong>
                {hall.capacity?.min || 0} -{" "}
                {hall.capacity?.max || 0} Guests
              </strong>
            </div>
          </div>

          <div className="hall-quick-item">
            <div className="hall-quick-icon">
              ⌖
            </div>

            <div>
              <span>Location</span>

              <strong>
                {hall.city || "Not specified"}
              </strong>
            </div>
          </div>

          <div className="hall-quick-item">
            <div className="hall-quick-icon">
              ★
            </div>

            <div>
              <span>Rating</span>

              <strong>
                {rating > 0
                  ? `${rating.toFixed(1)} / 5`
                  : "New"}
              </strong>
            </div>
          </div>

          <div className="hall-quick-item">
            <div className="hall-quick-icon">
              ✓
            </div>

            <div>
              <span>Status</span>

              <strong>
                {hall.isAvailable
                  ? "Available"
                  : "Unavailable"}
              </strong>
            </div>
          </div>
        </section>

        {/* =========================
            DESCRIPTION + FEATURES
        ========================= */}

        <section className="hall-content-grid">
          <div className="hall-about">
            <span className="hall-section-label">
              ABOUT THE VENUE
            </span>

            <h2>
              Everything You Need for Your Special Day
            </h2>

            <p>
              {hall.description ||
                "This beautiful wedding venue is ready to make your special day unforgettable."}
            </p>

            {hall.address && (
              <div className="hall-address-box">
                <span>⌖</span>

                <div>
                  <small>ADDRESS</small>

                  <strong>
                    {hall.address}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="hall-features-section">
            <span className="hall-section-label">
              VENUE FEATURES
            </span>

            <h2>
              What This Venue Offers
            </h2>

            {hall.features?.length > 0 ? (
              <div className="hall-details-features">
                {hall.features.map((feature) => (
                  <div
                    className="hall-detail-feature"
                    key={feature}
                  >
                    <span>✓</span>

                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hall-no-data">
                No features have been added yet.
              </p>
            )}
          </div>
        </section>

        {/* =========================
            PACKAGES
        ========================= */}

        <section className="hall-packages-section">
          <div className="hall-section-heading">
            <div>
              <span className="hall-section-label">
                WEDDING PACKAGES
              </span>

              <h2>
                Choose Your Perfect Package
              </h2>

              <p>
                Select a package that matches your
                celebration and your needs.
              </p>
            </div>
          </div>

          {packages.length === 0 ? (
            <div className="hall-no-packages">
              <span>◇</span>

              <h3>
                No Packages Available Yet
              </h3>

              <p>
                The hall owner hasn't added any
                packages yet.
              </p>
            </div>
          ) : (
            <div className="hall-packages-grid">
              {packages.map((pkg) => (
                <div
                  className="hall-package-card"
                  key={pkg._id}
                >
                  {pkg.image?.url && (
                    <div className="hall-package-image">
                      <img
                        src={pkg.image.url}
                        alt={pkg.name}
                      />
                    </div>
                  )}

                  <div className="hall-package-body">
                    <div className="hall-package-top">
                      <h3>{pkg.name}</h3>

                      {pkg.isActive === false && (
                        <span className="package-inactive">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {pkg.description && (
                      <p className="hall-package-description">
                        {pkg.description}
                      </p>
                    )}

                    <div className="hall-package-price">
                      <small>
                        PACKAGE PRICE
                      </small>

                      <strong>
                        {getPackagePrice(pkg)}
                      </strong>
                    </div>

                    {(pkg.minGuests ||
                      pkg.maxGuests) && (
                      <div className="hall-package-detail">
                        <span>Guests</span>

                        <strong>
                          {pkg.minGuests || 0} -{" "}
                          {pkg.maxGuests ||
                            "Unlimited"}
                        </strong>
                      </div>
                    )}

                    {pkg.durationHours && (
                      <div className="hall-package-detail">
                        <span>Duration</span>

                        <strong>
                          {pkg.durationHours} hours
                        </strong>
                      </div>
                    )}

                    {pkg.features?.length > 0 && (
                      <div className="hall-package-features">
                        {pkg.features
                          .slice(0, 5)
                          .map((feature) => (
                            <span key={feature}>
                              ✓ {feature}
                            </span>
                          ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className="hall-package-book"
                      disabled={
                        pkg.isActive === false
                      }
                      onClick={handleBook}
                    >
                      {pkg.isActive === false
                        ? "Currently Unavailable"
                        : "Choose This Package"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            AVAILABILITY
        ========================= */}

        <section className="hall-availability-section">
          <div className="hall-section-heading">
            <div>
              <span className="hall-section-label">
                AVAILABILITY
              </span>

              <h2>
                Check Venue Availability
              </h2>

              <p>
                See the current availability before
                making your booking.
              </p>
            </div>
          </div>

          <div className="hall-availability-card">
            {availability.length === 0 ? (
              <div className="hall-availability-empty">
                <span>✓</span>

                <div>
                  <strong>
                    No blocked dates currently listed
                  </strong>

                  <p>
                    You can continue to the booking
                    process and select your preferred
                    event date.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="availability-legend">
                  <div>
                    <span className="legend-dot available" />
                    Available
                  </div>

                  <div>
                    <span className="legend-dot blocked" />
                    Blocked
                  </div>
                </div>

                <div className="availability-list">
                  {availability
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.date) -
                        new Date(b.date)
                    )
                    .map((item) => {
                      const date = new Date(
                        item.date
                      );

                      return (
                        <div
                          className={`availability-item ${
                            item.status === "blocked"
                              ? "blocked"
                              : "available"
                          }`}
                          key={
                            item._id ||
                            item.date
                          }
                        >
                          <div>
                            <strong>
                              {date.toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </strong>

                            {item.reason && (
                              <small>
                                {item.reason}
                              </small>
                            )}
                          </div>

                          <span>
                            {item.status ===
                            "blocked"
                              ? "Blocked"
                              : "Available"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </>
            )}

            <button
              type="button"
              className="hall-main-book-button"
              onClick={handleBook}
              disabled={
                hall.isAvailable === false
              }
            >
              {hall.isAvailable === false
                ? "Currently Unavailable"
                : "Book This Wedding Hall"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HallDetails;

