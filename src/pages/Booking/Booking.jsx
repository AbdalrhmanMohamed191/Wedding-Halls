import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import "./Booking.css";

const Booking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPackageFromState =
    location.state?.selectedPackage || null;

  const [hall, setHall] = useState(null);
  const [packages, setPackages] = useState([]);

  const [selectedPackageId, setSelectedPackageId] =
    useState(selectedPackageFromState?._id || "");

  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("cash");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Availability Calendar
  |--------------------------------------------------------------------------
  */

  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [calendarDate, setCalendarDate] =
    useState(() => {
      const today = new Date();

      return new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
    });

  /*
  |--------------------------------------------------------------------------
  | Authentication
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");

      navigate("/login", {
        replace: true,
        state: {
          from: `/halls/${id}/book`,
        },
      });
    }
  }, [id, navigate]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Hall + Packages
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          hallResponse,
          packagesResponse,
        ] = await Promise.all([
          api.get(`/halls/public/${id}`),
          api.get(`/packages/public/hall/${id}`),
        ]);

        const hallData =
          hallResponse.data?.hall ||
          hallResponse.data?.data ||
          hallResponse.data;

        let packageData =
          packagesResponse.data?.packages ||
          packagesResponse.data?.data ||
          [];

        if (!Array.isArray(packageData)) {
          packageData = [];
        }

        setHall(hallData);
        setPackages(packageData);

        /*
        |--------------------------------------------------------------------------
        | Select Package
        |--------------------------------------------------------------------------
        */

        if (selectedPackageFromState?._id) {
          const exists = packageData.some(
            (item) =>
              String(item._id) ===
              String(selectedPackageFromState._id)
          );

          if (exists) {
            setSelectedPackageId(
              selectedPackageFromState._id
            );
          }
        } else if (packageData.length > 0) {
          setSelectedPackageId(packageData[0]._id);
        }
      } catch (err) {
        console.error(
          "Booking Data Error:",
          err
        );

        const message =
          err.response?.data?.message ||
          "Unable to load booking information";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingData();
    }
  }, [id, selectedPackageFromState]);

  /*
  |--------------------------------------------------------------------------
  | Minimum Date
  |--------------------------------------------------------------------------
  */

  const minDate = useMemo(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Date Helpers
  |--------------------------------------------------------------------------
  */

  const formatDateKey = (date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const parseDateKey = (dateKey) => {
    if (!dateKey) return null;

    const [year, month, day] =
      dateKey.split("-").map(Number);

    return new Date(
      year,
      month - 1,
      day
    );
  };

  const isPastDate = (dateKey) => {
    return dateKey < minDate;
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Public Availability
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!id) return;

    const fetchAvailability = async () => {
      try {
        setAvailabilityLoading(true);

        const year =
          calendarDate.getFullYear();

        const month =
          calendarDate.getMonth();

        const fromDate = new Date(
          year,
          month,
          1
        );

        const toDate = new Date(
          year,
          month + 1,
          0
        );

        const from = formatDateKey(fromDate);
        const to = formatDateKey(toDate);

        const response = await api.get(
          `/availability/public/hall/${id}`,
          {
            params: {
              from,
              to,
            },
          }
        );

        const calendar =
          response.data?.calendar ||
          response.data?.data?.calendar ||
          [];

          console.log("PUBLIC CALENDAR:", calendar);

        setAvailability(
          Array.isArray(calendar)
            ? calendar
            : []
        );
      } catch (err) {
        console.error(
          "Availability Error:",
          err
        );

        setAvailability([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [id, calendarDate]);

  /*
  |--------------------------------------------------------------------------
  | Availability Map
  |--------------------------------------------------------------------------
  */

  const availabilityMap = useMemo(() => {
    const map = {};

    availability.forEach((item) => {
      const rawDate =
        item.date ||
        item.eventDate ||
        item.day;

      if (!rawDate) return;

      const dateKey =
        typeof rawDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
          ? rawDate
          : formatDateKey(
              new Date(rawDate)
            );

      map[dateKey] = {
        ...item,
        status:
          item.status || "available",
      };
    });

    return map;
  }, [availability]);

  /*
  |--------------------------------------------------------------------------
  | Get Day Status
  |--------------------------------------------------------------------------
  */

  // const getDateStatus = (dateKey) => {
  //   if (isPastDate(dateKey)) {
  //     return "past";
  //   }

  //   return (
  //     availabilityMap[dateKey]?.status ||
  //     "available"
  //   );
  // };


  const getDateStatus = (dateKey) => {
  if (isPastDate(dateKey)) {
    return "past";
  }

  const status =
    availabilityMap[dateKey]?.status;

  if (
    status === "booked" ||
    status === "pending"
  ) {
    return "booked";
  }

  return status || "available";
};
  /*
  |--------------------------------------------------------------------------
  | Is Date Selectable
  |--------------------------------------------------------------------------
  */

  const isDateSelectable = (dateKey) => {
    const status =
      getDateStatus(dateKey);

    return (
      status === "available" &&
      !isPastDate(dateKey)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Calendar Days
  |--------------------------------------------------------------------------
  */

  const calendarDays = useMemo(() => {
    const year =
      calendarDate.getFullYear();

    const month =
      calendarDate.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const firstWeekday =
      firstDay.getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const previousMonthDays =
      new Date(
        year,
        month,
        0
      ).getDate();

    const days = [];

    /*
    |--------------------------------------------------------------------------
    | Previous Month Days
    |--------------------------------------------------------------------------
    */

    for (
      let i = firstWeekday - 1;
      i >= 0;
      i--
    ) {
      const day =
        previousMonthDays - i;

      const date = new Date(
        year,
        month - 1,
        day
      );

      days.push({
        date,
        dateKey: formatDateKey(date),
        currentMonth: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Current Month Days
    |--------------------------------------------------------------------------
    */

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      const date = new Date(
        year,
        month,
        day
      );

      days.push({
        date,
        dateKey: formatDateKey(date),
        currentMonth: true,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Next Month Days
    |--------------------------------------------------------------------------
    */

    const remaining =
      42 - days.length;

    for (
      let day = 1;
      day <= remaining;
      day++
    ) {
      const date = new Date(
        year,
        month + 1,
        day
      );

      days.push({
        date,
        dateKey: formatDateKey(date),
        currentMonth: false,
      });
    }

    return days;
  }, [calendarDate, minDate]);

  /*
  |--------------------------------------------------------------------------
  | Calendar Month Label
  |--------------------------------------------------------------------------
  */

  const calendarMonthLabel =
    useMemo(() => {
      return calendarDate.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      );
    }, [calendarDate]);

  /*
  |--------------------------------------------------------------------------
  | Calendar Navigation
  |--------------------------------------------------------------------------
  */

  const goToPreviousMonth = () => {
    const today = new Date();

    const currentMonthStart =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    const previousMonth =
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth() - 1,
        1
      );

    if (
      previousMonth <
      currentMonthStart
    ) {
      return;
    }

    setCalendarDate(previousMonth);
  };

  const goToNextMonth = () => {
    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth() + 1,
        1
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Today Check
  |--------------------------------------------------------------------------
  */

  const isToday = (dateKey) => {
    return dateKey === minDate;
  };

  /*
  |--------------------------------------------------------------------------
  | Select Calendar Date
  |--------------------------------------------------------------------------
  */

  const handleDateSelect = (dateKey) => {
    if (!isDateSelectable(dateKey)) {
      const status =
        getDateStatus(dateKey);

      if (status === "blocked") {
        toast.error(
          "This date is blocked by the hall."
        );
      } else if (status === "booked") {
        toast.error(
          "This date is already booked."
        );
      } else if (status === "pending") {
        toast.error(
          "This date currently has a pending booking."
        );
      }

      return;
    }

    setEventDate(dateKey);
  };

  /*
  |--------------------------------------------------------------------------
  | Selected Package
  |--------------------------------------------------------------------------
  */

  const selectedPackage = useMemo(() => {
    return packages.find(
      (item) =>
        String(item._id) ===
        String(selectedPackageId)
    );
  }, [
    packages,
    selectedPackageId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Guest Validation
  |--------------------------------------------------------------------------
  */

  const guestValidation = useMemo(() => {
    if (!selectedPackage || !guests) {
      return {
        valid: true,
        message: "",
      };
    }

    const guestNumber =
      Number(guests);

    if (!Number.isInteger(guestNumber)) {
      return {
        valid: false,
        message:
          "Enter a valid number of guests.",
      };
    }

    if (
      guestNumber <
      selectedPackage.minGuests
    ) {
      return {
        valid: false,
        message: `Minimum guests for this package is ${selectedPackage.minGuests}.`,
      };
    }

    if (
      guestNumber >
      selectedPackage.maxGuests
    ) {
      return {
        valid: false,
        message: `Maximum guests for this package is ${selectedPackage.maxGuests}.`,
      };
    }

    return {
      valid: true,
      message: "",
    };
  }, [
    selectedPackage,
    guests,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Submit Booking
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem("token")) {
      toast.error("Please login first");

      navigate("/login", {
        state: {
          from: `/halls/${id}/book`,
        },
      });

      return;
    }

    if (!selectedPackageId) {
      toast.error(
        "Please select a package"
      );
      return;
    }

    if (!eventDate) {
      toast.error(
        "Please select your event date"
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Extra Client-Side Availability Check
    |--------------------------------------------------------------------------
    */

    // const selectedStatus =
    //   getDateStatus(eventDate);

    // if (
    //   selectedStatus !== "available"
    // ) {
    //   if (selectedStatus === "blocked") {
    //     toast.error(
    //       "This date is blocked by the hall. Please choose another date."
    //     );
    //   } else if (
    //     selectedStatus === "booked"
    //   ) {
    //     toast.error(
    //       "This date is already booked. Please choose another date."
    //     );
    //   } else if (
    //     selectedStatus === "pending"
    //   ) {
    //     toast.error(
    //       "This date has a pending booking. Please choose another date."
    //     );
    //   } else {
    //     toast.error(
    //       "Please choose an available date."
    //     );
    //   }

    //   return;
    // }
            const selectedStatus =
          getDateStatus(eventDate);

        if (selectedStatus !== "available") {
          if (selectedStatus === "booked") {
            toast.error(
              "This date is already booked. Please choose another date."
            );
          } else if (selectedStatus === "blocked") {
            toast.error(
              "This date is blocked by the hall. Please choose another date."
            );
          } else {
            toast.error(
              "Please choose an available date."
            );
          }

          return;
        }

    if (!guests) {
      toast.error(
        "Please enter the number of guests"
      );
      return;
    }

    if (!guestValidation.valid) {
      toast.error(
        guestValidation.message
      );
      return;
    }

    if (eventDate < minDate) {
      toast.error(
        "Event date cannot be in the past"
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/bookings",
        {
          hallId: id,
          packageId:
            selectedPackageId,
          eventDate,
          guests: Number(guests),
          paymentMethod,
          notes:
            notes.trim() || null,
        }
      );

      const booking =
        response.data?.booking;

      toast.success(
        "Booking request submitted successfully 🎉"
      );

      /*
      |--------------------------------------------------------------------------
      | Move to Booking Details
      |--------------------------------------------------------------------------
      */

      if (booking?._id) {
        navigate(
          `/bookings/${booking._id}`,
          {
            replace: true,
            state: {
              booking,
              justCreated: true,
            },
          }
        );
      } else {
        navigate(
          "/my-bookings",
          {
            replace: true,
          }
        );
      }
    } catch (err) {
      console.error(
        "Create Booking Error:",
        err
      );

      const status =
        err.response?.status;

      const message =
        err.response?.data?.message ||
        "Unable to create booking. Please try again.";

      if (status === 409) {
        toast.error(
          "This hall is already booked for this date. Please choose another date."
        );

        /*
        |--------------------------------------------------------------------------
        | Refresh Availability After Conflict
        |--------------------------------------------------------------------------
        */

        const currentMonth =
          calendarDate.getTime();

        setCalendarDate(
          new Date(currentMonth)
        );
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="booking-page">
        <div className="booking-container">
          <div className="booking-loading">
            <div className="booking-spinner" />

            <p>
              Loading booking details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !hall) {
    return (
      <main className="booking-page">
        <div className="booking-container">
          <div className="booking-error">
            <div className="booking-error-icon">
              !
            </div>

            <h2>
              Unable to load booking
            </h2>

            <p>
              {error ||
                "Hall information could not be found."}
            </p>

            <button
              type="button"
              className="booking-back-button"
              onClick={() =>
                navigate(`/halls/${id}`)
              }
            >
              Back to Hall
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <div className="booking-container">
        {/* Breadcrumb */}

        <div className="booking-breadcrumb">
          <button
            type="button"
            onClick={() =>
              navigate("/halls")
            }
          >
            Halls
          </button>

          <span>/</span>

          <button
            type="button"
            onClick={() =>
              navigate(`/halls/${id}`)
            }
          >
            {hall.name}
          </button>

          <span>/</span>

          <span>Booking</span>
        </div>

        {/* Header */}

        <div className="booking-header">
          <div>
            <span className="booking-eyebrow">
              RESERVE YOUR DATE
            </span>

            <h1>
              Book Your Wedding Hall
            </h1>

            <p>
              Choose your package, event
              date and guest count to
              submit your booking request.
            </p>
          </div>
        </div>

        <form
          className="booking-layout"
          onSubmit={handleSubmit}
        >
          {/* =========================================================
              LEFT SIDE
          ========================================================== */}

          <div className="booking-form-card">
            {/* =======================================================
                PACKAGE
            ======================================================== */}

            <div className="booking-section">
              <div className="booking-section-heading">
                <div className="booking-step">
                  01
                </div>

                <div>
                  <h2>
                    Choose your package
                  </h2>

                  <p>
                    Select the package that
                    fits your event.
                  </p>
                </div>
              </div>

              {packages.length === 0 ? (
                <div className="booking-empty">
                  <h3>
                    No packages available
                  </h3>

                  <p>
                    This hall currently has
                    no active packages.
                  </p>
                </div>
              ) : (
                <div className="booking-packages">
                  {packages.map((pkg) => {
                    const isSelected =
                      String(pkg._id) ===
                      String(
                        selectedPackageId
                      );

                    return (
                      <button
                        type="button"
                        key={pkg._id}
                        className={`booking-package ${
                          isSelected
                            ? "booking-package-selected"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedPackageId(
                            pkg._id
                          );

                          if (
                            guests &&
                            (Number(guests) <
                              pkg.minGuests ||
                              Number(guests) >
                                pkg.maxGuests)
                          ) {
                            setGuests("");
                          }
                        }}
                      >
                        <div className="booking-package-radio">
                          <span />
                        </div>

                        <div className="booking-package-content">
                          <div className="booking-package-top">
                            <div>
                              <h3>
                                {pkg.name}
                              </h3>

                              {pkg.description && (
                                <p>
                                  {
                                    pkg.description
                                  }
                                </p>
                              )}
                            </div>

                            <strong>
                              {Number(
                                pkg.price || 0
                              ).toLocaleString()}{" "}
                              EGP
                            </strong>
                          </div>

                          <div className="booking-package-meta">
                            <span>
                              👥{" "}
                              {pkg.minGuests}{" "}
                              -{" "}
                              {pkg.maxGuests}{" "}
                              guests
                            </span>

                            {pkg.durationHours && (
                              <span>
                                🕒{" "}
                                {
                                  pkg.durationHours
                                }{" "}
                                hours
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =======================================================
                EVENT DETAILS
            ======================================================== */}

            <div className="booking-section">
              <div className="booking-section-heading">
                <div className="booking-step">
                  02
                </div>

                <div>
                  <h2>
                    Event details
                  </h2>

                  <p>
                    Tell us when your event
                    will take place.
                  </p>
                </div>
              </div>

              {/* =====================================================
                  CUSTOM AVAILABILITY CALENDAR
              ====================================================== */}

              <div className="booking-calendar-wrapper">
                <div className="booking-calendar-header">
                  <div>
                    <span className="booking-calendar-label">
                      SELECT YOUR DATE
                    </span>

                    <h3>
                      {calendarMonthLabel}
                    </h3>
                  </div>

                  <div className="booking-calendar-navigation">
                    <button
                      type="button"
                      onClick={
                        goToPreviousMonth
                      }
                      aria-label="Previous month"
                      disabled={
                        new Date(
                          calendarDate.getFullYear(),
                          calendarDate.getMonth() - 1,
                          1
                        ) <
                        new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          1
                        )
                      }
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={
                        goToNextMonth
                      }
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="booking-calendar-legend">
                  <span>
                    <i className="legend-dot available" />
                    Available
                  </span>

                  <span>
                    <i className="legend-dot pending" />
                    Pending
                  </span>

                  <span>
                    <i className="legend-dot booked" />
                    Booked
                  </span>

                  <span>
                    <i className="legend-dot blocked" />
                    Blocked
                  </span>
                </div>

                <div className="booking-calendar">
                  <div className="booking-calendar-weekdays">
                    <span>
                      Sun
                    </span>

                    <span>
                      Mon
                    </span>

                    <span>
                      Tue
                    </span>

                    <span>
                      Wed
                    </span>

                    <span>
                      Thu
                    </span>

                    <span>
                      Fri
                    </span>

                    <span>
                      Sat
                    </span>
                  </div>

                  <div className="booking-calendar-grid">
                    {calendarDays.map(
                      ({
                        date,
                        dateKey,
                        currentMonth,
                      }) => {
                        const status =
                          getDateStatus(
                            dateKey
                          );

                        const selectable =
                          isDateSelectable(
                            dateKey
                          );

                        const selected =
                          eventDate ===
                          dateKey;

                        const today =
                          isToday(dateKey);

                        const availabilityItem =
                          availabilityMap[
                            dateKey
                          ];

                        return (
                          <button
                            type="button"
                            key={dateKey}
                            className={[
                              "booking-calendar-day",
                              !currentMonth
                                ? "outside-month"
                                : "",
                              `status-${status}`,
                              selected
                                ? "selected"
                                : "",
                              today
                                ? "today"
                                : "",
                              !selectable
                                ? "disabled"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            disabled={
                              !selectable
                            }
                            onClick={() =>
                              handleDateSelect(
                                dateKey
                              )
                            }
                            title={
                              status ===
                              "blocked"
                                ? "Blocked by hall"
                                : status ===
                                  "booked"
                                ? "Already booked"
                                : status ===
                                  "pending"
                                ? "Pending booking"
                                : status ===
                                  "past"
                                ? "Past date"
                                : "Available"
                            }
                          >
                            <span className="booking-calendar-day-number">
                              {date.getDate()}
                            </span>

                            {currentMonth &&
                              status !==
                                "available" &&
                              status !==
                                "past" && (
                                <span className="booking-calendar-day-status">
                                  {status ===
                                  "blocked"
                                    ? "Blocked"
                                    : status ===
                                      "booked"
                                    ? "Booked"
                                    : "Pending"}
                                </span>
                              )}

                            {selected && (
                              <span className="booking-calendar-selected-mark">
                                ✓
                              </span>
                            )}

                            {availabilityItem?.reason &&
                              status ===
                                "blocked" && (
                                <span className="booking-calendar-tooltip">
                                  {
                                    availabilityItem.reason
                                  }
                                </span>
                              )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {availabilityLoading && (
                  <div className="booking-calendar-loading">
                    <span className="booking-button-spinner" />
                    Checking availability...
                  </div>
                )}

                <div className="booking-selected-date">
                  <span>
                    Selected date
                  </span>

                  <strong>
                    {eventDate
                      ? parseDateKey(
                          eventDate
                        )?.toLocaleDateString(
                          "en-US",
                          {
                            weekday:
                              "long",
                            month:
                              "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "No date selected"}
                  </strong>
                </div>
              </div>

              <div className="booking-fields">
                <div className="booking-field">
                  <label htmlFor="guests">
                    Number of guests
                  </label>

                  <input
                    id="guests"
                    type="number"
                    min={
                      selectedPackage?.minGuests ||
                      1
                    }
                    max={
                      selectedPackage?.maxGuests ||
                      undefined
                    }
                    value={guests}
                    onChange={(e) =>
                      setGuests(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 250"
                    required
                  />

                  {selectedPackage && (
                    <small>
                      This package supports{" "}
                      {
                        selectedPackage.minGuests
                      }{" "}
                      -{" "}
                      {
                        selectedPackage.maxGuests
                      }{" "}
                      guests.
                    </small>
                  )}

                  {!guestValidation.valid && (
                    <span className="booking-field-error">
                      {
                        guestValidation.message
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* =======================================================
                PAYMENT
            ======================================================== */}

            <div className="booking-section">
              <div className="booking-section-heading">
                <div className="booking-step">
                  03
                </div>

                <div>
                  <h2>
                    Payment method
                  </h2>

                  <p>
                    Choose how you intend to
                    pay.
                  </p>
                </div>
              </div>

              <div className="booking-payment-options">
                <label
                  className={`booking-payment-option ${
                    paymentMethod ===
                    "cash"
                      ? "booking-payment-selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={
                      paymentMethod ===
                      "cash"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Cash
                    </strong>

                    <span>
                      Pay directly to the
                      hall.
                    </span>
                  </div>
                </label>

                <label
                  className={`booking-payment-option ${
                    paymentMethod ===
                    "card"
                      ? "booking-payment-selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={
                      paymentMethod ===
                      "card"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Card
                    </strong>

                    <span>
                      Card payment at the
                      hall.
                    </span>
                  </div>
                </label>

                <label
                  className={`booking-payment-option ${
                    paymentMethod ===
                    "online"
                      ? "booking-payment-selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={
                      paymentMethod ===
                      "online"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Online
                    </strong>

                    <span>
                      Online payment.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* =======================================================
                NOTES
            ======================================================== */}

            <div className="booking-section">
              <div className="booking-section-heading">
                <div className="booking-step">
                  04
                </div>

                <div>
                  <h2>
                    Additional notes
                  </h2>

                  <p>
                    Add anything the hall
                    management should know.
                  </p>
                </div>
              </div>

              <div className="booking-field">
                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  maxLength={2000}
                  placeholder="Tell the hall about any special requests..."
                  rows={5}
                />

                <small>
                  {notes.length}/2000
                </small>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT SIDE SUMMARY
          ========================================================== */}

          <aside className="booking-summary">
            <div className="booking-summary-card">
              <div className="booking-summary-image">
                {hall.coverImage?.url ? (
                  <img
                    src={
                      hall.coverImage.url
                    }
                    alt={hall.name}
                  />
                ) : (
                  <div className="booking-image-placeholder">
                    <span>
                      Wedding Hall
                    </span>
                  </div>
                )}
              </div>

              <div className="booking-summary-content">
                <span className="booking-summary-label">
                  YOUR VENUE
                </span>

                <h2>
                  {hall.name}
                </h2>

                <p className="booking-summary-location">
                  📍 {hall.city}
                  {hall.area
                    ? `, ${hall.area}`
                    : ""}
                </p>

                <div className="booking-summary-divider" />

                <div className="booking-summary-row">
                  <span>
                    Package
                  </span>

                  <strong>
                    {selectedPackage?.name ||
                      "Select package"}
                  </strong>
                </div>

                <div className="booking-summary-row">
                  <span>
                    Event date
                  </span>

                  <strong>
                    {eventDate ||
                      "Not selected"}
                  </strong>
                </div>

                <div className="booking-summary-row">
                  <span>
                    Guests
                  </span>

                  <strong>
                    {guests ||
                      "Not selected"}
                  </strong>
                </div>

                <div className="booking-summary-row">
                  <span>
                    Payment
                  </span>

                  <strong>
                    {paymentMethod ===
                    "cash"
                      ? "Cash"
                      : paymentMethod ===
                        "card"
                      ? "Card"
                      : "Online"}
                  </strong>
                </div>

                <div className="booking-summary-divider" />

                <div className="booking-total">
                  <span>
                    Package price
                  </span>

                  <strong>
                    {Number(
                      selectedPackage?.price ||
                        0
                    ).toLocaleString()}{" "}
                    EGP
                  </strong>
                </div>

                <p className="booking-price-note">
                  Final price is calculated
                  and verified by the server
                  when you submit the booking.
                </p>

                <button
                  type="submit"
                  className="booking-submit"
                  disabled={
                    submitting ||
                    packages.length === 0 ||
                    !selectedPackageId ||
                    !eventDate ||
                    getDateStatus(
                      eventDate
                    ) !== "available"
                  }
                >
                  {submitting ? (
                    <>
                      <span className="booking-button-spinner" />
                      Sending request...
                    </>
                  ) : (
                    <>
                      Submit Booking Request
                      <span>→</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="booking-cancel"
                  onClick={() =>
                    navigate(
                      `/halls/${id}`
                    )
                  }
                  disabled={submitting}
                >
                  Back to Hall
                </button>

                <div className="booking-security">
                  <span>✓</span>

                  <p>
                    Your booking request
                    will be reviewed by the
                    hall management before
                    confirmation.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default Booking;