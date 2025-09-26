import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authslice"; // adjust path if needed
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("[Login] Form submitted:", form);

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      console.log("[Login] Password too short");
      return;
    }

    try {
      console.log("[Login] Sending request to backend...");
      const response = await axios.post("http://localhost:8000/login", {
        email: form.email,
        password: form.password,
      });

      console.log("[Login] Response received:", response.data);

      const { user, token } = response.data;

      // Update Redux state
      dispatch(loginSuccess({ user, token }));
      console.log("[Login] Redux state updated");

      // Save token in localStorage
      localStorage.setItem("token", token);
      console.log("[Login] Token saved to localStorage");

      // Redirect to home
      navigate("/home");
      console.log("[Login] Redirecting to /home");
    } catch (err) {
      console.error("[Login] Error:", err);
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-800 to-emerald-900 px-4">
      <div className="max-w-6xl w-full bg-gray-900 shadow-2xl rounded-2xl overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-extrabold text-emerald-400 mb-6 text-center tracking-widest">
            PERSPECTIV-DMS
          </h1>

          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-200 text-center mb-6">
              Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition"
              />

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition"
              />

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-md"
              >
                Login
              </button>
            </form>

            <p className="text-sm text-center text-gray-400 mt-6">
              Don’t have an account?{" "}
              <Link to="/register" className="text-emerald-400 hover:underline">
                Register
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
