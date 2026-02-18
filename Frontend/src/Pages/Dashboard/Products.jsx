import { useEffect, useState } from "react";

import ProfileDashboard from "../../Layout/Dashboard/profiledashboard";
import ViewModal from "../../Components/Dashboard/ViewModal";

import "../../Styles/Pages/Product.css";

const url = import.meta.env.VITE_API_URL;

export default function Products() {

  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchMedicines = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${url}/Orgmeds`, {
        credentials: "include",
      });

      const result = await res.json();

      if (result.success && result.data) {
        setMedicines(result.data);
      }
        
        console.log(medicines); 

    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMedicines();
  }, []);


    return (
       <>


      <div className="dashboard-products-card">

        {/* Header */}
        <div className="dashboard-products-header">

          <h2>Inventory List</h2>

          <span>
            Total Items: {medicines.length}
          </span>

        </div>


        {/* Table */}
        <div className="dashboard-products-table-wrapper">

          <table className="dashboard-products-table">

            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Brand</th>
                <th>Form</th>
                <th>MRP</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>


            <tbody>

              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan="6">

                    <div className="dashboard-products-loading">

                      <div className="dashboard-products-spinner"></div>

                      <p>Loading medicines...</p>

                    </div>

                  </td>
                </tr>
              )}


              {/* Data */}
              {!loading && medicines.length > 0 &&
                medicines.map((med) => (

                  <tr key={med.id}>

                    <td>
                      <div className="dashboard-products-name">
                        {med.name}
                      </div>

                      <div className="dashboard-products-code">
                        {med.drug_code}
                      </div>
                    </td>

                    <td>{med.brand_name}</td>

                    <td>{med.dosage_form}</td>

                    <td className="dashboard-products-price">
                      ₹{med.mrp}
                    </td>

                    <td>

                      <span
                        className={`dashboard-products-status ${
                          med.verification_status === "approved" ||
                          med.verification_status === "accepted"
                            ? "approved"
                            : "pending"
                        }`}
                      >
                        {med.verification_status}

                      </span>

                    </td>

                    <td>

                      <button
                        onClick={() => setSelected(med)}
                        className="dashboard-products-view-btn"
                      >
                        View Details
                      </button>

                    </td>

                  </tr>

                ))}


              {/* Empty */}
              {!loading && medicines.length === 0 && (
                <tr>
                  <td colSpan="6" className="dashboard-products-empty">
                    No medicines found in the inventory.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* Modal */}
      <ViewModal
        open={!!selected}
        medicine={selected}
        onClose={() => setSelected(null)}
      />

  </>
  );
}