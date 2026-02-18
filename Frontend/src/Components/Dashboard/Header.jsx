import { useEffect, useState } from "react";
import "../../Styles/Components/Header.css"

const url = import.meta.env.VITE_API_URL;

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${url}/auth/me`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data && data.employee) {
          setUser(data.employee);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";
  const firstLetter = firstName.charAt(0).toUpperCase();

  return (
    <div className="profile-header-container">

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="profile-header-search"
      />

      <div className="profile-header-right">

        {/* Add Product Button */}
        <button className="profile-header-add-btn">
          + Add Product
        </button>

        {/* Profile Section */}
        {user ? (
          <div className="profile-header-profile">

            <div className="profile-header-avatar">
              {firstLetter}
            </div>

            <div className="profile-header-info">
              <p className="profile-header-name">
                {firstName} {lastName}
              </p>
              <p className="profile-header-email">
                {user.email}
              </p>
            </div>

          </div>
        ) : (
          /* Loading State */
          <div className="profile-header-loading">
            <div className="profile-header-loading-avatar"></div>
            <div className="profile-header-loading-text">
              <div></div>
              <div></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}