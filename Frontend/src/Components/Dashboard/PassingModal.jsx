import { useState, useEffect } from "react";
import "../../Styles/Components/CreateShipModal.css";

const url = import.meta.env.VITE_API_URL;

export default function PassingModal({ shipment, onClose, onSuccess }) {

    const [organizations, setOrganizations] = useState([]);
    const [nextOrg, setNextOrg] = useState("");
    const [temperature, setTemperature] = useState("");
    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2500);
    };

    useEffect(() => {

        const fetchOrgs = async () => {

            try {

                const res = await fetch(`${url}/organization`, {
                    credentials: "include"
                });

                const data = await res.json();

                const orgArray = Array.isArray(data)
                    ? data
                    : data.data || [];

                setOrganizations(orgArray);

            } catch (err) {
                console.error("Failed to fetch orgs:", err);
            }

        };

        fetchOrgs();

    }, []);

    const handlePassShipment = async () => {

        if (!nextOrg || !temperature) {
            showToast("Fill all fields");
            return;
        }

        try {

            setLoading(true);

            const res = await fetch(`${url}/pass-shipment`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    shipment_id: shipment.id,
                    next_holder_org_id: nextOrg,
                    temperature: temperature
                })
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error);

            showToast("Shipment passed successfully");

            onSuccess();
            onClose();

        } catch (err) {

            showToast(err.message);

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="create-ship-modal-overlay" onClick={onClose}>

            <div
                className="create-ship-modal-container"
                onClick={(e) => e.stopPropagation()}
            >

                <h2 className="create-ship-modal-title">
                    Pass Shipment
                </h2>


                <div className="create-ship-modal-field">
                    <label>Next Organization</label>
                    <select
                        value={nextOrg}
                        onChange={(e) => setNextOrg(e.target.value)}
                    >
                        <option value="">Select organization</option>

                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}

                    </select>
                </div>

                <div className="create-ship-modal-field">
                    <label>Temperature</label>
                    <input
                        placeholder="Example: 2°C - 8°C"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                    />
                </div>

                <div className="create-ship-modal-actions">

                    <button
                        className="create-ship-modal-cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="create-ship-modal-submit"
                        onClick={handlePassShipment}
                        disabled={loading}
                    >
                        {loading ? "Passing..." : "Pass Shipment"}
                    </button>

                </div>

                {toast && (
                    <div className="create-ship-modal-toast">
                        {toast}
                    </div>
                )}

            </div>

        </div>
    );
}