import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import "./Register.css";

const Register = () => {
const navigate = useNavigate();
const location = useLocation();

const { register, isAuthenticated } = useAuth();

const [formData, setFormData] = useState({
name: "",
email: "",
phone: "",
password: "",
confirmPassword: "",
});

const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] =
useState(false);

const redirectTo =
location.state?.from?.pathname || "/";

const redirectState =
location.state?.from?.state || null;

useEffect(() => {
if (isAuthenticated) {
navigate(redirectTo, {
replace: true,
state: redirectState,
});
}
}, [
isAuthenticated,
navigate,
redirectTo,
redirectState,
]);

const handleChange = (event) => {
const { name, value } = event.target;

setFormData((previous) => ({
  ...previous,
  [name]: value,
}));


};

const handleSubmit = async (event) => {
event.preventDefault();

const name = formData.name.trim();
const email = formData.email.trim();
const phone = formData.phone.trim();
const password = formData.password;
const confirmPassword = formData.confirmPassword;

if (!name || !email || !phone || !password) {
  toast.error("Please fill in all required fields");
  return;
}

if (name.length < 2) {
  toast.error("Name must be at least 2 characters");
  return;
}

if (password.length < 6) {
  toast.error("Password must be at least 6 characters");
  return;
}

if (password !== confirmPassword) {
  toast.error("Passwords do not match");
  return;
}

try {
  setLoading(true);

  await register(
    name,
    email,
    phone,
    password
  );

  toast.success("Account created successfully!");

  navigate(redirectTo, {
    replace: true,
    state: redirectState,
  });
} catch (error) {
  console.error("REGISTER ERROR:", error);

  const message =
    error.response?.data?.message ||
    error.message ||
    "Unable to create account";

  toast.error(message);
} finally {
  setLoading(false);
}


};

return ( <main className="auth-page"> <div className="auth-container register-container">


    <div className="auth-brand">
      <div className="auth-logo">
        WH
      </div>

      <span>Wedding Halls</span>
    </div>

    <div className="auth-card">

      <div className="auth-header">
        <span className="auth-eyebrow">
          GET STARTED
        </span>

        <h1>Create your account</h1>

        <p>
          Create an account to discover halls and
          manage your bookings.
        </p>
      </div>

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">
          <label htmlFor="name">
            Full name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            autoComplete="name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            Phone number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            autoComplete="tel"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Password
          </label>

          <div className="password-input-wrapper">

            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              disabled={loading}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (previous) => !previous
                )
              }
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>

          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            Confirm password
          </label>

          <div className="password-input-wrapper">

            <input
              id="confirmPassword"
              name="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
              disabled={loading}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  (previous) => !previous
                )
              }
              disabled={loading}
            >
              {showConfirmPassword
                ? "Hide"
                : "Show"}
            </button>

          </div>
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="auth-spinner" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>

      </form>

      <div className="auth-footer">
        <span>
          Already have an account?
        </span>

        <Link
          to="/login"
          state={location.state}
        >
          Sign in
        </Link>
      </div>

    </div>

    <Link
      to="/halls"
      className="auth-back-link"
    >
      ← Back to halls
    </Link>

  </div>
</main>


);
};

export default Register;
