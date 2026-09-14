import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaBell,
} from "react-icons/fa";

import { useAuth } from "../../pages/context/AuthContext";
import api from "../../api/axios";

import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const isLoggedIn = !!user;

  const isUser =
    user?.role === "user";

  const isHallOwner =
    user?.role === "hallOwner";

  const isAdmin =
    user?.role === "admin";

  /*
  |--------------------------------------------------------------------------
  | Fetch Notifications Count
  |--------------------------------------------------------------------------
  */

  const fetchUnreadCount =
    useCallback(async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const response =
          await api.get(
            "/notifications/unread-count"
          );

        const count =
          response?.data?.data
            ?.unreadCount ?? 0;

        setUnreadCount(
          Number(count) || 0
        );
      } catch (error) {
        console.error(
          "Fetch Notification Count Error:",
          error
        );

        /*
         * Don't show a toast here.
         * Notification count should not
         * disturb the user if it fails.
         */
        setUnreadCount(0);
      }
    }, [user]);

  /*
  |--------------------------------------------------------------------------
  | Notifications Synchronization
  |--------------------------------------------------------------------------
  |
  | This keeps Navbar notification badge
  | synchronized with Notifications page.
  |
  | Notifications.jsx dispatches:
  |
  | window.dispatchEvent(
  |   new Event("notifications:updated")
  | );
  |
  */

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    /*
     * Initial fetch.
     */
    fetchUnreadCount();

    /*
     * Called when Notifications page
     * changes notification state.
     */
    const handleNotificationsUpdated =
      () => {
        fetchUnreadCount();
      };

    /*
     * Refresh when user returns
     * to the browser/tab.
     */
    const handleWindowFocus = () => {
      fetchUnreadCount();
    };

    window.addEventListener(
      "notifications:updated",
      handleNotificationsUpdated
    );

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      window.removeEventListener(
        "notifications:updated",
        handleNotificationsUpdated
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, [
    user,
    fetchUnreadCount,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logout();

    setUnreadCount(0);

    setMenuOpen(false);

    navigate("/");
  };

  /*
  |--------------------------------------------------------------------------
  | Close Mobile Menu
  |--------------------------------------------------------------------------
  */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Open Notifications
  |--------------------------------------------------------------------------
  */

  const handleNotificationsClick =
    () => {
      setMenuOpen(false);
      navigate("/notifications");
    };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <nav className="site-navbar">
      {/* ==================================================
          LOGO
      ================================================== */}

      <Link
        to="/"
        className="site-logo"
        onClick={closeMenu}
      >
        <span>Wed</span>ora
      </Link>

      {/* ==================================================
          DESKTOP NAVIGATION
      ================================================== */}

      <div className="site-nav-links">
        {/* Home */}

        <Link
          to="/"
          className={
            location.pathname === "/"
              ? "active"
              : ""
          }
        >
          Home
        </Link>

        {/* Wedding Halls */}

        <Link
          to="/halls"
          className={
            location.pathname.startsWith(
              "/halls"
            )
              ? "active"
              : ""
          }
        >
          Wedding Halls
        </Link>

        {/* ==================================================
            USER LINKS
        ================================================== */}

        {isUser && (
          <Link
            to="/my-bookings"
            className={
              location.pathname.startsWith(
                "/my-bookings"
              )
                ? "active"
                : ""
            }
          >
            My Bookings
          </Link>
        )}

        {/* ==================================================
            HALL OWNER DASHBOARD
        ================================================== */}

        {isHallOwner && (
          <Link
            to="/owner/dashboard"
            className={
              location.pathname.startsWith(
                "/owner"
              )
                ? "active"
                : ""
            }
          >
            Dashboard
          </Link>
        )}

        {/* ==================================================
            ADMIN DASHBOARD
        ================================================== */}

        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className={
              location.pathname.startsWith(
                "/admin"
              )
                ? "active"
                : ""
            }
          >
            Admin Dashboard
          </Link>
        )}

        {/* How It Works */}

        <Link
          to="/how-it-works"
          className={
            location.pathname ===
            "/how-it-works"
              ? "active"
              : ""
          }
        >
          How It Works
        </Link>

        {/* About */}

        <Link
          to="/about"
          className={
            location.pathname ===
            "/about"
              ? "active"
              : ""
          }
        >
          About
        </Link>
      </div>

      {/* ==================================================
          DESKTOP ACTIONS
      ================================================== */}

      <div className="site-nav-actions">
        {isLoggedIn ? (
          <>
            {/* Notifications */}

            <button
              type="button"
              className={`navbar-notification-btn ${
                location.pathname ===
                "/notifications"
                  ? "active"
                  : ""
              }`}
              onClick={
                handleNotificationsClick
              }
              aria-label="Notifications"
              title="Notifications"
            >
              <FaBell />

              {unreadCount > 0 && (
                <span className="navbar-notification-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* User Name */}

            <span className="site-user-name">
              Hi,{" "}
              {user?.name?.split(
                " "
              )[0] || "User"}
            </span>

            {/* Logout */}

            <button
              type="button"
              className="site-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Login */}

            <Link
              to="/login"
              className="site-login-link"
            >
              Login
            </Link>

            {/* Register */}

            <Link
              to="/register"
              className="site-register-btn"
            >
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* ==================================================
          MOBILE MENU BUTTON
      ================================================== */}

      <button
        type="button"
        className={`mobile-menu-btn ${
          menuOpen ? "open" : ""
        }`}
        onClick={() =>
          setMenuOpen(
            (prev) => !prev
          )
        }
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* ==================================================
          MOBILE MENU
      ================================================== */}

      <div
        className={`mobile-menu ${
          menuOpen ? "show" : ""
        }`}
      >
        <div className="mobile-menu-inner">
          {/* Home */}

          <Link
            to="/"
            onClick={closeMenu}
            className={
              location.pathname ===
              "/"
                ? "active"
                : ""
            }
          >
            Home
          </Link>

          {/* Wedding Halls */}

          <Link
            to="/halls"
            onClick={closeMenu}
            className={
              location.pathname.startsWith(
                "/halls"
              )
                ? "active"
                : ""
            }
          >
            Wedding Halls
          </Link>

          {/* ==================================================
              USER MOBILE LINKS
          ================================================== */}

          {isUser && (
            <Link
              to="/my-bookings"
              onClick={closeMenu}
              className={
                location.pathname.startsWith(
                  "/my-bookings"
                )
                  ? "active"
                  : ""
              }
            >
              My Bookings
            </Link>
          )}

          {/* ==================================================
              HALL OWNER MOBILE DASHBOARD
          ================================================== */}

          {isHallOwner && (
            <Link
              to="/owner/dashboard"
              onClick={closeMenu}
              className={
                location.pathname.startsWith(
                  "/owner"
                )
                  ? "active"
                  : ""
              }
            >
              Dashboard
            </Link>
          )}

          {/* ==================================================
              ADMIN MOBILE DASHBOARD
          ================================================== */}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={closeMenu}
              className={
                location.pathname.startsWith(
                  "/admin"
                )
                  ? "active"
                  : ""
              }
            >
              Admin Dashboard
            </Link>
          )}

          {/* How It Works */}

          <Link
            to="/how-it-works"
            onClick={closeMenu}
            className={
              location.pathname ===
              "/how-it-works"
                ? "active"
                : ""
            }
          >
            How It Works
          </Link>

          {/* About */}

          <Link
            to="/about"
            onClick={closeMenu}
            className={
              location.pathname ===
              "/about"
                ? "active"
                : ""
            }
          >
            About
          </Link>

          {/* ==================================================
              MOBILE DIVIDER
          ================================================== */}

          <div className="mobile-menu-divider"></div>

          {/* ==================================================
              MOBILE AUTH
          ================================================== */}

          {isLoggedIn ? (
            <>
              {/* Mobile Notifications */}

              <button
                type="button"
                className={`mobile-notification-link ${
                  location.pathname ===
                  "/notifications"
                    ? "active"
                    : ""
                }`}
                onClick={
                  handleNotificationsClick
                }
              >
                <span className="mobile-notification-content">
                  <span className="mobile-notification-icon">
                    <FaBell />
                  </span>

                  <span>
                    Notifications
                  </span>
                </span>

                {unreadCount > 0 && (
                  <span className="mobile-notification-badge">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile User */}

              <div className="mobile-user">
                Hi,{" "}
                {user?.name?.split(
                  " "
                )[0] || "User"}
              </div>

              {/* Mobile Logout */}

              <button
                type="button"
                className="mobile-logout"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>
            </>
          ) : (
            <div className="mobile-auth">
              {/* Mobile Login */}

              <Link
                to="/login"
                onClick={closeMenu}
                className="mobile-login"
              >
                Login
              </Link>

              {/* Mobile Register */}

              <Link
                to="/register"
                onClick={closeMenu}
                className="mobile-register"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;