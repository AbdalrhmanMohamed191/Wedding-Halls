import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./pages/Home/Home";
import Halls from "./pages/Halls/Halls";
import HallDetails from "./pages/HallDetails/HallDetails";
import ChoosePackage from "./pages/ChoosePackage/ChoosePackage";
import Booking from "./pages/Booking/Booking";
import BookingDetails from "./pages/BookingDetails/BookingDetails";

import About from "./pages/About/About";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import Notifications from "./pages/Notifications/Notifications";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import MyBookings from "./pages/MyBookings/MyBookings";

// =====================================================
// HALL OWNER PAGES
// =====================================================

import HallOwnerDashboard from "./pages/HallOwnerDashboard/HallOwnerDashboard";
import OwnerHalls from "./pages/OwnerHalls/OwnerHalls";
import OwnerPackages from "./pages/OwnerPackages/OwnerPackages";
import OwnerPackageForm from "./pages/OwnerPackageForm/OwnerPackageForm";
import OwnerBookings from "./pages/OwnerBookings/OwnerBookings";
import OwnerBookingDetails from "./pages/OwnerBookingDetails/OwnerBookingDetails";
import HallOwnerAvailability from "./pages/HallOwnerAvailability/HallOwnerAvailability";
import OwnerReviews from "./pages/OwnerReviews/OwnerReviews";
// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminHalls from "./pages/AdminHalls/AdminHalls";
import AdminBookings from "./pages/AdminBookings/AdminBookings";

// =====================================================
// COMPONENTS
// =====================================================

import Navbar from "./component/Navbar/Navbar";
import Footer from "./component/Footer/Footer";
import ProtectedRoute from "./component/ProtectedRoute/ProtectedRoute";


const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/halls"
          element={<Halls />}
        />

        <Route
          path="/halls/:id"
          element={<HallDetails />}
        />

        <Route
          path="/halls/:id/packages"
          element={<ChoosePackage />}
        />

        <Route
          path="/halls/:id/book"
          element={<Booking />}
        />

        <Route
          path="/bookings/:id"
          element={<BookingDetails />}
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRoles={[
                "user",
                "hallOwner",
                "admin",
              ]}
            >
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            AUTH ROUTES
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =====================================================
            CUSTOMER ROUTES
        ===================================================== */}

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute
              allowedRoles={["user"]}
            >
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            GENERAL ROUTES
        ===================================================== */}

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/how-it-works"
          element={<HowItWorks />}
        />

        {/* =====================================================
            HALL OWNER
        ===================================================== */}

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <HallOwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            OWNER - HALLS
        ===================================================== */}

        <Route
          path="/owner/halls"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <OwnerHalls />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/halls/new"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <div />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/halls/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <div />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/availability"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <HallOwnerAvailability />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            OWNER - PACKAGES
        ===================================================== */}

        <Route
          path="/owner/packages"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <OwnerPackages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/packages/new"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <OwnerPackageForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/packages/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <OwnerPackageForm />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            OWNER - BOOKINGS
        ===================================================== */}

        <Route
          path="/owner/bookings"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <OwnerBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/bookings/:id"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <OwnerBookingDetails />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            OWNER - REVIEWS
        ===================================================== */}

        <Route
          path="/owner/reviews"
          element={
            <ProtectedRoute
              allowedRoles={["hallOwner"]}
            >
              <OwnerReviews />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/halls"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            >
              <AdminHalls />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            >
              <AdminBookings />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            404
        ===================================================== */}

        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "10px",
                padding: "40px 20px",
              }}
            >
              <h1>
                404 - Page Not Found
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#777",
                }}
              >
                The page you are looking for
                does not exist.
              </p>
            </div>
          }
        />

      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;