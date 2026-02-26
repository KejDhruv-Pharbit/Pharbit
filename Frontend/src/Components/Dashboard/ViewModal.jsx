import { useState } from "react";
import "../../Styles/Components/ViewModal.css";
import { Pill, ShieldCheck, AlertTriangle, Zap, Loader2 } from "lucide-react";

export default function ViewModal({ open, onClose, medicine }) {
  const [isMinting, setIsMinting] = useState(false);
  const url = import.meta.env.VITE_API_URL;

  if (!open || !medicine) return null;

  const isApproved = medicine.verification_status === "approved" || medicine.verification_status === "accepted";

  const handleMint = async () => {
    try {
      setIsMinting(true);

      // --- STATIC BATCH DATA ---
      // These match the 'batches' table constraints (date strings and numbers)
      const staticBatchData = {
        supply: 500,                                     // Maps to batch_quantity
        manufacturingDate: new Date().toISOString().split('T')[0], // Today's date (YYYY-MM-DD)
        expiryDate: "2027-12-31",                       // Static future date
        warehouseLocation: "Central Distribution Hub"   // Static location
      };

      // 1. Call Backend to execute minting and database sync
      const response = await fetch(`${url}/auto-mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: medicine.id,
          pricePerToken: medicine.mrp,
          supply: staticBatchData.supply,
          manufacturingDate: staticBatchData.manufacturingDate,
          expiryDate: staticBatchData.expiryDate,
          warehouseLocation: staticBatchData.warehouseLocation
        }),
        credentials: "include"
      });

      const result = await response.json();

      // 2. Handle errors
      if (!response.ok) {
        throw new Error(result.error || "Blockchain transaction failed");
      }

      // 3. Success Feedback
      console.log("Minting & DB Sync Successful:", result);
      alert(
        `Success!\n` +
        `Batch ID: ${result.batchId}\n` +
        `Tx Hash: ${result.transactionHash.substring(0, 20)}...`
      );
      
      onClose(); 
      
    } catch (error) {
      console.error("Minting failed:", error);
      alert(error.message || "An error occurred during server-side minting");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="dashboard-modal-overlay" onClick={onClose}>
      <div className="dashboard-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Section */}
        <div className="dashboard-modal-header">
          <div className="modal-title-group">
            <h2 className="dashboard-modal-title">{medicine.name}</h2>
            <div className="modal-subtitle-row">
              <span className="dashboard-modal-brand">{medicine.brand_name}</span>
              <span className="separator">•</span>
              <span className="dashboard-modal-code">{medicine.drug_code}</span>
            </div>
          </div>
          <div className={`status-tag ${isApproved ? "approved" : "pending"}`}>
            {isApproved ? <ShieldCheck size={14} /> : <Zap size={14} />}
            {medicine.verification_status}
          </div>
        </div>

        {/* Expanded Info Grid */}
        <div className="dashboard-modal-info-grid">
          <div className="dashboard-modal-info-card">
            <p className="dashboard-modal-label">Dosage Form</p>
            <div className="card-content">
              <Pill size={18} className="blue-icon" />
              <p>{medicine.dosage_form}</p>
            </div>
          </div>

          <div className="dashboard-modal-info-card">
            <p className="dashboard-modal-label">Unit Price (MRP)</p>
            <div className="card-content">
              <p className="dashboard-modal-price">€{medicine.mrp}</p>
            </div>
          </div>
        </div>

        {/* Detailed Body */}
        <div className="dashboard-modal-body">
          <section className="modal-section">
            <p className="dashboard-modal-section-title">Chemical Composition</p>
            <div className="dashboard-modal-tags">
              {medicine.composition?.map((item, index) => (
                <span key={index} className="dashboard-modal-tag">{item}</span>
              ))}
            </div>
          </section>

          <section className="modal-section">
            <p className="dashboard-modal-section-title">Storage & Handling</p>
            <ul className="dashboard-modal-list">
              {medicine.storage_conditions?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {medicine.warnings?.length > 0 && (
            <div className="dashboard-modal-warning">
              <div className="warning-header">
                <AlertTriangle size={16} />
                <p className="dashboard-modal-warning-title">Safety Warnings</p>
              </div>
              <ul className="dashboard-modal-warning-list">
                {medicine.warnings.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="dashboard-modal-actions">
          {isApproved && (
            <button 
                className="mint-btn" 
                onClick={handleMint}
                disabled={isMinting}
            >
              {isMinting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Zap size={18} fill="currentColor" />
              )}
              {isMinting ? "Minting Batch..." : "Mint Medicine Batch"}
            </button>
          )}
          <button onClick={onClose} className="dashboard-modal-close-btn" disabled={isMinting}>
            Close Details
          </button>
        </div>

        <div className="dashboard-modal-footer-meta">
          <span>HSN: {medicine.hsn_code}</span>
          <span>License: {medicine.manufacturing_license}</span>
        </div>
      </div>
    </div>
  );
}