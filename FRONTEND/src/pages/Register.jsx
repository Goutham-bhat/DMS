import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../utils/toast"; // centralized toast

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStrongPassword(form.password)) {
      setError(
        "Password must be at least 8 characters, include one uppercase, one number, and one special character."
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/register", {
        full_name: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      // ✅ Use centralized success toast, include status code
      showSuccessToast("User registered successfully!", response.status);

      // Redirect to login after short delay
      setTimeout(() => navigate("/"), 1500);

      // Reset form
      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
    } catch (err) {
      if (err.response) {
        showErrorToast(`Status ${err.response.status}: ${err.response.data.detail}`);
      } else {
        showErrorToast("Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-950 px-4">
      <div className="max-w-6xl w-full bg-gray-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Form card */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col items-center justify-center bg-gray-900">
          <h1 className="text-4xl font-extrabold text-indigo-400 mb-6 text-center tracking-widest">
            PERSPECTIV-DMS
          </h1>

          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-200 text-center mb-6">
              Create an Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <div className="flex space-x-6 text-gray-300">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={form.role === "user"}
                    onChange={handleChange}
                    className="mr-2 text-indigo-400 focus:ring-indigo-500"
                  />
                  User
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={form.role === "admin"}
                    onChange={handleChange}
                    className="mr-2 text-indigo-400 focus:ring-indigo-500"
                  />
                  Admin
                </label>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md"
              >
                Register
              </button>
            </form>

            <p className="text-sm text-center text-gray-400 mt-6">
              Already have an account?{" "}
              <Link to="/" className="text-indigo-400 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        <div
          className="lg:block w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/perspectivlabs.jpg')" }}
        ></div>
      </div>
    </div>
  );
}
