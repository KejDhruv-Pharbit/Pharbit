import { Route, Routes } from "react-router";
import Auth from "./Pages/Auth";
import MedicalForm from "./Layout/Dashboard/MedicalForm";
import PendingRequests from "./Pages/Admin/PendingRequest";

// Import your Layout and Pages
import ProfileDashboard from "./Layout/Dashboard/profiledashboard";
import Products from "./Pages/Dashboard/Products";
import InviteEmployee from "./Pages/Dashboard/InviteEmployee";
import Batches from "./Pages/Dashboard/Batches";


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
        <Route path="products" element={<Products />} />
        {/* Add placeholders for other sidebar links so they don't break */}
        <Route path="add-product" element={<MedicalForm />} />
        <Route path="Batches" element={<Batches/>} />
        {/* <Route path="Employee" element={<InviteEmployee/>} /> */} 
      </Route>
    </Routes>
  );
}

export default App;