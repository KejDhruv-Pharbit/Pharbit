import { Outlet } from "react-router-dom";

import Sidebar from "../../Components/Dashboard/Sidebar";
import Header from "../../Components/Dashboard/Header";

import "../../Styles/Layout/ProfileDashboard.css";

export default function ProfileDashboard() {

  return (
    <div className="profile-dashboard-container">

      <Sidebar />

      <main className="profile-dashboard-main">

        <Header />

        <div className="profile-dashboard-content">
          <Outlet />   {/* ✅ REQUIRED */}
        </div>

      </main>

    </div>
  );
}
