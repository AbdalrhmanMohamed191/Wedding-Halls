import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaChevronLeft,
  FaChevronRight,
  FaLock,
  FaUnlock,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBan,
} from "react-icons/fa";

import { Modal, Button, Form, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";

import api from "../../api/axios";

import "./HallOwnerAvailability.css";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateString) => {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
};

const getTodayKey = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return formatDateKey(today);
};

const getMonthStart = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
};

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(
    year,
    month,
    1
  );

  const lastDay = new Date(
    year,
    month + 1,
    0
  );

  /*
  |--------------------------------------------------------------------------
  | Convert Sunday based JS index to Monday based calendar
  |--------------------------------------------------------------------------
  */

  const firstDayIndex =
    (firstDay.getDay() + 6) % 7;

  const totalDays = lastDay.getDate();

  const days = [];

  /*
  |--------------------------------------------------------------------------
  | Previous month days
  |--------------------------------------------------------------------------
  */

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const date = new Date(
      year,
      month,
      -i
    );

    days.push({
      date,
      currentMonth: false,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Current month
  |--------------------------------------------------------------------------
  */

  for (let day = 1; day <= totalDays; day++) {
    days.push({
      date: new Date(
        year,
        month,
        day
      ),
      currentMonth: true,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Next month
  |--------------------------------------------------------------------------
  */

  while (days.length % 7 !== 0) {
    const lastDate =
      days[days.length - 1].date;

    const nextDate = new Date(
      lastDate
    );

    nextDate.setDate(
      nextDate.getDate() + 1
    );

    days.push({
      date: nextDate,
      currentMonth: false,
    });
  }

  return days;
};

const getStatusLabel = (status) => {
  switch (status) {
    case "booked":
      return "Booked";

    case "pending":
      return "Pending";

    case "blocked":
      return "Blocked";

    default:
      return "Available";
  }
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

const HallOwnerAvailability = () => {
  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] =
    useState("");

  const [currentMonth, setCurrentMonth] =
    useState(
      getMonthStart(new Date())
    );

  const [calendar, setCalendar] = useState(
    []
  );

  const [summary, setSummary] = useState({
    available: 0,
    pending: 0,
    booked: 0,
    blocked: 0,
  });

  const [loadingHalls, setLoadingHalls] =
    useState(true);

  const [loadingCalendar, setLoadingCalendar] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const [modalMode, setModalMode] =
    useState("block");

  const [reason, setReason] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Calendar days
  |--------------------------------------------------------------------------
  */

  const calendarDays = useMemo(() => {
    return getCalendarDays(
      currentMonth
    );
  }, [currentMonth]);

  /*
  |--------------------------------------------------------------------------
  | Calendar map
  |--------------------------------------------------------------------------
  */

  const calendarMap = useMemo(() => {
    const map = new Map();

    calendar.forEach((item) => {
      map.set(item.date, item);
    });

    return map;
  }, [calendar]);

  /*
  |--------------------------------------------------------------------------
  | Get halls
  |--------------------------------------------------------------------------
  */

  const fetchHalls = useCallback(
    async () => {
      try {
        setLoadingHalls(true);
        setError("");

        const response =
          await api.get("/halls/my");

        const data = response.data;

        const fetchedHalls =
          data.halls ||
          data.data ||
          [];

        setHalls(fetchedHalls);

        if (
          fetchedHalls.length > 0
        ) {
          setSelectedHallId(
            (previous) =>
              previous ||
              fetchedHalls[0]._id
          );
        }
      } catch (err) {
        console.error(
          "Fetch Owner Halls Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load your halls"
        );

        toast.error(
          err.response?.data?.message ||
            "Failed to load your halls"
        );
      } finally {
        setLoadingHalls(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Fetch calendar
  |--------------------------------------------------------------------------
  */

  const fetchCalendar = useCallback(
    async () => {
      if (!selectedHallId) {
        return;
      }

      try {
        setLoadingCalendar(true);
        setError("");

        const year =
          currentMonth.getFullYear();

        const month =
          currentMonth.getMonth();

        const firstDate = new Date(
          year,
          month,
          1
        );

        const lastDate = new Date(
          year,
          month + 1,
          0
        );

        const from =
          formatDateKey(firstDate);

        const to =
          formatDateKey(lastDate);

        const response =
          await api.get(
            `/availability/my/hall/${selectedHallId}`,
            {
              params: {
                from,
                to,
              },
            }
          );

        setCalendar(
          response.data?.calendar || []
        );

        setSummary(
          response.data?.summary || {
            available: 0,
            pending: 0,
            booked: 0,
            blocked: 0,
          }
        );
      } catch (err) {
        console.error(
          "Fetch Calendar Error:",
          err
        );

        setCalendar([]);

        toast.error(
          err.response?.data?.message ||
            "Failed to load calendar"
        );
      } finally {
        setLoadingCalendar(false);
      }
    },
    [selectedHallId, currentMonth]
  );

  /*
  |--------------------------------------------------------------------------
  | Initial halls
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  /*
  |--------------------------------------------------------------------------
  | Load calendar
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  /*
  |--------------------------------------------------------------------------
  | Month navigation
  |--------------------------------------------------------------------------
  */

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const goToToday = () => {
    setCurrentMonth(
      getMonthStart(new Date())
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Open block modal
  |--------------------------------------------------------------------------
  */

  const openBlockModal = (day) => {
    const dateKey =
      formatDateKey(day.date);

    const existing =
      calendarMap.get(dateKey);

    if (
      existing?.status === "booked" ||
      existing?.status === "pending"
    ) {
      return;
    }

    if (
      dateKey < getTodayKey()
    ) {
      return;
    }

    setSelectedDay({
      date: dateKey,
      status:
        existing?.status || "available",
      availability:
        existing?.availability || null,
    });

    setModalMode(
      existing?.status === "blocked"
        ? "unblock"
        : "block"
    );

    setReason(
      existing?.availability?.reason ||
        ""
    );

    setNotes(
      existing?.availability?.notes ||
        ""
    );

    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close modal
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSelectedDay(null);
    setReason("");
    setNotes("");
  };

  /*
  |--------------------------------------------------------------------------
  | Block date
  |--------------------------------------------------------------------------
  */

  const blockDate = async () => {
    if (
      !selectedDay ||
      !selectedHallId
    ) {
      return;
    }

    try {
      setSaving(true);

      await api.put(
        "/availability",
        {
          hallId: selectedHallId,
          date: selectedDay.date,
          status: "blocked",
          reason:
            reason.trim() || null,
          notes:
            notes.trim() || null,
        }
      );

      toast.success(
        "Date blocked successfully"
      );

      closeModal();

      await fetchCalendar();
    } catch (err) {
      console.error(
        "Block Date Error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to block date"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Unblock date
  |--------------------------------------------------------------------------
  */

  const unblockDate = async () => {
    if (
      !selectedDay?.availability?._id
    ) {
      return;
    }

    try {
      setSaving(true);

      await api.delete(
        `/availability/${selectedDay.availability._id}`
      );

      toast.success(
        "Date is available again"
      );

      closeModal();

      await fetchCalendar();
    } catch (err) {
      console.error(
        "Unblock Date Error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to unblock date"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Selected hall
  |--------------------------------------------------------------------------
  */

  const selectedHall = halls.find(
    (hall) =>
      String(hall._id) ===
      String(selectedHallId)
  );

  /*
  |--------------------------------------------------------------------------
  | Loading halls
  |--------------------------------------------------------------------------
  */

  if (loadingHalls) {
    return (
      <div className="availability-page">
        <div className="availability-loading">
          <Spinner animation="border" />
          <span>
            Loading your halls...
          </span>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="availability-page">
      <div className="availability-container">

        {/* Header */}

        <div className="availability-header">
          <div>
            <div className="availability-title-row">
              <div className="availability-title-icon">
                <FaCalendarAlt />
              </div>

              <div>
                <h1>
                  Availability Calendar
                </h1>

                <p>
                  Manage your hall availability
                  and blocked dates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hall selector */}

        <div className="availability-toolbar">
          <div className="hall-selector-wrapper">
            <label>
              Select Hall
            </label>

            <Form.Select
              value={selectedHallId}
              onChange={(event) =>
                setSelectedHallId(
                  event.target.value
                )
              }
            >
              {halls.map((hall) => (
                <option
                  key={hall._id}
                  value={hall._id}
                >
                  {hall.name}
                </option>
              ))}
            </Form.Select>
          </div>

          {selectedHall && (
            <div className="selected-hall-info">
              <strong>
                {selectedHall.name}
              </strong>

              {selectedHall.city && (
                <span>
                  {selectedHall.city}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Summary */}

        <div className="availability-summary">

          <div className="summary-card available">
            <div className="summary-icon">
              <FaCheckCircle />
            </div>

            <div>
              <strong>
                {summary.available}
              </strong>

              <span>
                Available
              </span>
            </div>
          </div>

          <div className="summary-card pending">
            <div className="summary-icon">
              <FaClock />
            </div>

            <div>
              <strong>
                {summary.pending}
              </strong>

              <span>
                Pending
              </span>
            </div>
          </div>

          <div className="summary-card booked">
            <div className="summary-icon">
              <FaTimesCircle />
            </div>

            <div>
              <strong>
                {summary.booked}
              </strong>

              <span>
                Booked
              </span>
            </div>
          </div>

          <div className="summary-card blocked">
            <div className="summary-icon">
              <FaBan />
            </div>

            <div>
              <strong>
                {summary.blocked}
              </strong>

              <span>
                Blocked
              </span>
            </div>
          </div>

        </div>

        {/* Calendar */}

        <div className="calendar-card">

          {/* Calendar header */}

          <div className="calendar-topbar">

            <div>
              <h2>
                {currentMonth.toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h2>

              <span>
                Click an available day to
                block it.
              </span>
            </div>

            <div className="calendar-navigation">

              <button
                type="button"
                className="today-button"
                onClick={goToToday}
              >
                Today
              </button>

              <button
                type="button"
                className="calendar-nav-button"
                onClick={
                  goToPreviousMonth
                }
                aria-label="Previous month"
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                className="calendar-nav-button"
                onClick={goToNextMonth}
                aria-label="Next month"
              >
                <FaChevronRight />
              </button>

            </div>
          </div>

          {/* Legend */}

          <div className="calendar-legend">

            <div>
              <span className="legend-dot available-dot" />
              Available
            </div>

            <div>
              <span className="legend-dot pending-dot" />
              Pending
            </div>

            <div>
              <span className="legend-dot booked-dot" />
              Booked
            </div>

            <div>
              <span className="legend-dot blocked-dot" />
              Blocked
            </div>

          </div>

          {/* Calendar */}

          <div className="calendar-wrapper">

            {loadingCalendar && (
              <div className="calendar-loading">
                <Spinner animation="border" />
              </div>
            )}

            <div className="calendar-weekdays">

              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <div
                  key={day}
                  className="calendar-weekday"
                >
                  {day}
                </div>
              ))}

            </div>

            <div className="calendar-grid">

              {calendarDays.map(
                ({
                  date,
                  currentMonth:
                    isCurrentMonth,
                }) => {
                  const dateKey =
                    formatDateKey(date);

                  const item =
                    calendarMap.get(
                      dateKey
                    );

                  const status =
                    item?.status ||
                    "available";

                  const isPast =
                    dateKey <
                    getTodayKey();

                  const isDisabled =
                    !isCurrentMonth ||
                    isPast ||
                    status ===
                      "booked" ||
                    status ===
                      "pending";

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      className={[
                        "calendar-day",
                        isCurrentMonth
                          ? ""
                          : "outside-month",
                        `status-${status}`,
                        isPast
                          ? "past-day"
                          : "",
                        isDisabled
                          ? "day-disabled"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        if (
                          !isDisabled
                        ) {
                          openBlockModal({
                            date,
                          });
                        }
                      }}
                    >
                      <div className="day-number">
                        {date.getDate()}
                      </div>

                      {isCurrentMonth && (
                        <>
                          <div className="day-status">
                            <span className="status-dot" />

                            {getStatusLabel(
                              status
                            )}
                          </div>

                          {item?.booking && (
                            <div className="day-booking-info">
                              {item.booking.guests}{" "}
                              guests
                            </div>
                          )}

                          {item?.availability
                            ?.reason && (
                            <div className="day-reason">
                              {
                                item
                                  .availability
                                  .reason
                              }
                            </div>
                          )}

                          {status ===
                            "blocked" && (
                            <div className="day-action">
                              <FaUnlock />
                              Unblock
                            </div>
                          )}

                          {status ===
                            "available" &&
                            !isPast && (
                              <div className="day-action">
                                <FaLock />
                                Block
                              </div>
                            )}
                        </>
                      )}
                    </button>
                  );
                }
              )}

            </div>
          </div>
        </div>

        {/* Empty state */}

        {halls.length === 0 && (
          <div className="availability-empty">
            <FaCalendarAlt />

            <h3>
              No halls found
            </h3>

            <p>
              You need to have a hall before
              managing availability.
            </p>
          </div>
        )}

      </div>

      {/* Block / Unblock Modal */}

      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className="availability-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "block"
              ? "Block Date"
              : "Unblock Date"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {selectedDay && (
            <div className="selected-date-box">
              <FaCalendarAlt />

              <div>
                <span>
                  Selected Date
                </span>

                <strong>
                  {parseDateKey(
                    selectedDay.date
                  ).toLocaleDateString(
                    "en-US",
                    {
                      weekday:
                        "long",
                      day: "numeric",
                      month:
                        "long",
                      year:
                        "numeric",
                    }
                  )}
                </strong>
              </div>
            </div>
          )}

          {modalMode === "block" ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>
                  Reason
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Example: Private event"
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  maxLength={500}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>
                  Notes
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  maxLength={1000}
                />

                <div className="field-counter">
                  {notes.length}/1000
                </div>
              </Form.Group>

              <div className="block-warning">
                <FaLock />

                <span>
                  This date will no longer be
                  available for new bookings.
                </span>
              </div>
            </>
          ) : (
            <div className="unblock-content">
              <div className="unblock-icon">
                <FaUnlock />
              </div>

              <h4>
                Make this date available?
              </h4>

              <p>
                The date will become available
                for new bookings again.
              </p>
            </div>
          )}

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="light"
            onClick={closeModal}
            disabled={saving}
          >
            Cancel
          </Button>

          {modalMode === "block" ? (
            <Button
              className="block-confirm-button"
              onClick={blockDate}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner
                    size="sm"
                    animation="border"
                  />

                  <span>
                    Blocking...
                  </span>
                </>
              ) : (
                <>
                  <FaLock />
                  Block Date
                </>
              )}
            </Button>
          ) : (
            <Button
              className="unblock-confirm-button"
              onClick={unblockDate}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner
                    size="sm"
                    animation="border"
                  />

                  <span>
                    Unblocking...
                  </span>
                </>
              ) : (
                <>
                  <FaUnlock />
                  Unblock Date
                </>
              )}
            </Button>
          )}

        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HallOwnerAvailability;