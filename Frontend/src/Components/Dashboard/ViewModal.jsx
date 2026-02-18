import "../../Styles/Components/ViewModal.css";
import { Pill, ShieldCheck, AlertTriangle, Zap } from "lucide-react";

export default function ViewModal({ open, onClose, medicine }) {
  if (!open || !medicine) return null;

  const isApproved = medicine.verification_status === "approved" || medicine.verification_status === "accepted";

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
            <button className="mint-btn">
              <Zap size={18} fill="currentColor" />
              Mint Medicine
            </button>
          )}
          <button onClick={onClose} className="dashboard-modal-close-btn">
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