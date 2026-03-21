import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "../../Styles/Home/MedsLocate.css";

// Fix for default marker icon issues in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MedsLocate = () => {
    const { id } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`http://localhost:6090/NearbyBatches?id=${id}`);
                const json = await res.json();
                if (json.success) {
                    setData(json.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch medicine details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    // Function to create text-based store labels
    const createStoreLabel = (name) => {
        return L.divIcon({
            className: 'user-med-custom-label',
            html: `<span>${name}</span>`,
            iconSize: [120, 30], 
            iconAnchor: [60, 15] 
        });
    };

    if (loading) return <div className="user-med-loader">Loading Pharbit Chain...</div>;

    const validBatches = data.filter(item => item.batch !== null);
    const medInfo = validBatches.length > 0 ? validBatches[0].batch.medicines : null;
    const locations = validBatches.filter(item => item.organization?.lat && item.organization?.long);

    return (
        <div className="user-med-details-container">
            <div className="user-med-left-panel">
                {medInfo ? (
                    <div className="user-med-info-card">
                        <h2 className="user-med-title">
                            {medInfo.name} <span className="user-med-strength">{medInfo.strength}</span>
                        </h2>
                        <p className="user-med-brand">{medInfo.brand_name}</p>
                        <hr className="user-med-divider" />
                        <div className="user-med-details-row">
                            <strong>Composition:</strong> {medInfo.composition.join(", ")}
                        </div>
                        <div className="user-med-details-row">
                            <strong>Side Effects:</strong> {medInfo.side_effects.join(", ")}
                        </div>
                        <div className="user-med-mrp-badge">MRP: ₹{medInfo.mrp}</div>
                    </div>
                ) : (
                    <div className="user-med-no-info-card">
                        <p>Detailed medicine information is currently unavailable.</p>
                    </div>
                )}

                <h3 className="user-med-section-title">Available Batches nearby</h3>
                
                <div className="user-med-batches-grid">
                    {validBatches.length > 0 ? (
                        validBatches.map((item) => (
                            <div key={item.id} className="user-med-batch-card">
                                <div className="user-med-batch-header">
                                    <span className="user-med-mint-id">#{item.batch.blockchain_mint_id}</span>
                                    <span className="user-med-amount">{item.amount} Units</span>
                                </div>
                                <h4 className="user-med-org-name">{item.organization.name}</h4>
                                <p className="user-med-org-address">
                                    {item.organization.address.city}, {item.organization.address.country}
                                </p>
                                <p className="user-med-expiry">Expires: {item.batch.expiry_date}</p>
                            </div>
                        ))
                    ) : (
                        <div className="user-med-no-batches-found">
                            <p>No active batches found for this medicine in your current vicinity.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="user-med-right-panel">
                {locations.length > 0 ? (
                    <MapContainer 
                        center={[parseFloat(locations[0].organization.lat), parseFloat(locations[0].organization.long)]} 
                        zoom={13} 
                        className="user-med-leaflet-map"
                    >
                        <TileLayer 
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        {locations.map((loc) => (
                            <Marker 
                                key={loc.id} 
                                position={[parseFloat(loc.organization.long), parseFloat(loc.organization.lat)]}
                                icon={createStoreLabel(loc.organization.name)}
                            >
                                <Popup>
                                    <strong className="user-med-popup-title">{loc.organization.name}</strong><br />
                                    {loc.amount} units available.
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="user-med-map-placeholder">
                        <p>Location data unavailable.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedsLocate;