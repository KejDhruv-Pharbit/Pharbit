import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import "../../Styles/Components/Header.css";

const url = import.meta.env.VITE_API_URL;

export default function Header({  onSearch, searchVal }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${url}/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data && data.employee) setUser(data.employee);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  const firstLetter = user?.first_name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-header-container">
      {/* Search Input Area */}
      <div className="search-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search products, codes, or brands..."
          className="profile-header-search"
          value={searchVal}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="profile-header-right">
     

        {/* Profile Section */}
        {user ? (
          <div className="profile-header-profile">
            <div className="profile-header-avatar">{firstLetter}</div>
            <div className="profile-header-info">
              <p className="profile-header-name">{user.first_name} {user.last_name}</p>
              <p className="profile-header-email">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="profile-header-loading">
            <div className="profile-header-loading-avatar" />
            <div className="profile-header-loading-text">
              <div /><div />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}