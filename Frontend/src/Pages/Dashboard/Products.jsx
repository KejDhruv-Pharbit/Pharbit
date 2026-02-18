import { useEffect, useState } from "react";
import ViewModal from "../../Components/Dashboard/ViewModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../Styles/Pages/Product.css";
import Header from "../../Components/Dashboard/Header";

const url = import.meta.env.VITE_API_URL;

export default function Products() {
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Search State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${url}/Orgmeds`, { credentials: "include" });
        const result = await res.json();
        if (result.success && result.data) setMedicines(result.data);
      } catch (err) {
        console.error("Failed to fetch medicines:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  // Filter Logic based on Search Query
  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.drug_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const maxVisible = 3;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="inventory-view">
      {/* Pass search state and med count to Header */}
      <Header 
        onSearch={setSearchQuery} 
        searchVal={searchQuery}
      />

      <div className="inventory-glass-card">
        <header className="inventory-top-bar">
          <div className="title-area">
            <h1>Inventory</h1>
          </div>
          <div className="header-meta">

          </div>
        </header>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Medicine & Code</th>
                <th>Manufacturer</th>
                <th>Format</th>
                <th>Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="status-cell"><div className="loader" /></td></tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((med) => (
                  <tr key={med.id} className="fade-in-row">
                    <td>
                      <div className="med-identity">
                        <span className="m-name">{med.name}</span>
                        <span className="m-code">{med.drug_code}</span>
                      </div>
                    </td>
                    <td className="m-brand">{med.brand_name}</td>
                    <td><span className="m-tag">{med.dosage_form}</span></td>
                    <td className="m-price">€{med.mrp}</td>
                    <td>
                      <div className={`m-status ${med.verification_status === "approved" || med.verification_status === "accepted" ? "is-ok" : "is-wait"}`}>
                        {med.verification_status}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => setSelected(med)} className="view-link">View</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="empty-msg">No medicines match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredMedicines.length > itemsPerPage && (
          <footer className="pagination-footer">
            <p className="page-info">
              Showing <b>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredMedicines.length)}</b> of {filteredMedicines.length}
            </p>
            <div className="pagination-controls">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="pag-btn"><ChevronLeft size={16} /></button>
              <div className="page-numbers">
                {getPageNumbers().map((num) => (
                  <button key={num} onClick={() => setCurrentPage(num)} className={`num-btn ${currentPage === num ? 'active' : ''}`}>{num}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="pag-btn"><ChevronRight size={16} /></button>
            </div>
          </footer>
        )}
      </div>
      <ViewModal open={!!selected} medicine={selected} onClose={() => setSelected(null)} />
    </div>
  );
}