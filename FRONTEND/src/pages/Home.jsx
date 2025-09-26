import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../redux/authslice";
import { UserIcon } from "lucide-react"; // Admin icon

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/");
  };

  const goToPage = (path) => navigate(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white">
      {/* Navbar */}
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gray-900/70 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-widest text-indigo-400">
            PERSPECTIV-DMS
          </h1>

          <div className="flex items-center gap-4">
            {/* Admin icon: only visible to admins */}
            {user?.role === "admin" && (
              <button
                onClick={() => goToPage("/admin")}
                className="p-2 rounded-full hover:bg-indigo-600/70 transition"
                title="Admin Dashboard"
              >
                <UserIcon className="w-6 h-6 text-white" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white bg-red-600 hover:bg-red-700 transition rounded-lg shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-32 px-6 text-center">
        {user && (
          <h2 className="text-3xl font-semibold text-indigo-400 mb-4">
            Hello, {user.full_name}!
          </h2>
        )}
        <h3 className="text-2xl font-semibold text-indigo-300 mb-12">
          Welcome to PERSPECTIV-DMS - Your Secure Document Management System
        </h3>

        {/* Page Navigation */}
        <div className="flex justify-center gap-4 flex-wrap mb-12">
          <button
            onClick={() => goToPage("/upload")}
            className="px-6 py-3 text-lg font-semibold text-gray-200 bg-gray-800/60 hover:bg-indigo-600/70 hover:text-white transition rounded-lg shadow-md"
          >
            Upload Files
          </button>
          <button
            onClick={() => goToPage("/files")}
            className="px-6 py-3 text-lg font-semibold text-gray-200 bg-gray-800/60 hover:bg-indigo-600/70 hover:text-white transition rounded-lg shadow-md"
          >
            Your Files
          </button>
        </div>

        {/* System Flow Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { step: "1. Login", desc: "Sign in securely with your credentials to receive your access token (JWT)." },
            { step: "2. Upload", desc: "Select and upload your documents. Files are saved locally or on IPFS with metadata stored in the database." },
            { step: "3. View", desc: "Access your documents anytime and preview them directly in the React app." },
            { step: "4. Edit", desc: "Update metadata or replace documents. All changes are saved automatically." },
            { step: "5. Manage", desc: "Search, filter, update, and delete documents. Admins have extra management powers." },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-800 rounded-2xl shadow-lg p-6 transform hover:scale-105 hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-bold text-indigo-400 mb-2">{item.step}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
