import "../../Styles/Components/ViewModal.css";

export default function ViewModal({ open, onClose, medicine }) {

  if (!open || !medicine) return null;

  return (
    <div className="dashboard-modal-overlay">

      <div className="dashboard-modal-container">

        {/* Header */}
        <div className="dashboard-modal-header">

          <div>
            <h2 className="dashboard-modal-title">
              {medicine.name}
            </h2>

            <p className="dashboard-modal-brand">
              {medicine.brand_name}
            </p>
          </div>

          <span className="dashboard-modal-code">
            {medicine.drug_code}
          </span>

        </div>

        {/* Info Cards */}
        <div className="dashboard-modal-info-grid">

          <div className="dashboard-modal-info-card">
            <p className="dashboard-modal-label">
              Dosage Form
            </p>
            <p>{medicine.dosage_form}</p>
          </div>

          <div className="dashboard-modal-info-card">
            <p className="dashboard-modal-label">
              MRP
            </p>
            <p className="dashboard-modal-price">
              ₹{medicine.mrp}
            </p>
          </div>

        </div>

        {/* Body */}
        <div className="dashboard-modal-body">

          {/* Composition */}
          <div>
            <p className="dashboard-modal-section-title">
              Composition
            </p>

            <div className="dashboard-modal-tags">

              {medicine.composition?.map((item, index) => (
                <span
                  key={index}
                  className="dashboard-modal-tag"
                >
                  {item}
                </span>
              ))}

            </div>
          </div>


          {/* Storage */}
          <div>
            <p className="dashboard-modal-section-title">
              Storage Conditions
            </p>

            <ul className="dashboard-modal-list">

              {medicine.storage_conditions?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}

            </ul>
          </div>


          {/* Warnings */}
          {medicine.warnings?.length > 0 && (

            <div className="dashboard-modal-warning">

              <p className="dashboard-modal-warning-title">
                Warnings
              </p>

              <ul className="dashboard-modal-warning-list">

                {medicine.warnings.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}

              </ul>

            </div>
          )}


          {/* Footer Info */}
          <div className="dashboard-modal-footer-info">

            <p>HSN: {medicine.hsn_code}</p>
            <p>License: {medicine.manufacturing_license}</p>

          </div>

        </div>


        {/* Close Button */}
        <button
          onClick={onClose}
          className="dashboard-modal-close-btn"
        >
          Close Details
        </button>

      </div>
    </div>
  );
}