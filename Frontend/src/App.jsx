import { Route, Routes } from "react-router";
import Auth from "./Pages/Auth";
import MedicalForm from "./Components/MedicalForm";
import PendingRequests from "./Pages/Admin/PendingRequest";

// Import your Layout and Pages
import ProfileDashboard from "./Layout/Dashboard/profiledashboard"; 
import Products from "./Pages/Dashboard/Products";


function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Auth />} />
      <Route path="/Form" element={<MedicalForm />} />
      <Route path="/Pending" element={<PendingRequests />} />

      {/* Dashboard Protected Routes */}
      <Route path="/Dashboard" element={<ProfileDashboard />}>
        {/* This renders at /Dashboard */}
        <Route index element={<div className="p-6">Welcome to Pharbit Dashboard</div>} />
        
        {/* This renders at /Dashboard/products */}
        <Route path="products" element={<Products/>} />
        
        {/* Add placeholders for other sidebar links so they don't break */}
        <Route path="orders" element={<div className="p-6">Orders Management coming soon...</div>} />
        <Route path="reports" element={<div className="p-6">Analytics & Reports coming soon...</div>} />
        <Route path="settings" element={<div className="p-6">Account Settings</div>} />
      </Route>
    </Routes>
  );
}

export default App;