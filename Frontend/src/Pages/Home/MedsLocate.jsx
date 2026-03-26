// FIXED MedsLocate.jsx (only map-related fixes applied)

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "../../Styles/Home/MedsLocate.css";

// 🔥 Leaflet icon fix (important)
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
                if (json.success) setData(json.data.data);
            } catch (err) {
                console.error("Fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const createStoreLabel = (name) => {
        return L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="marker-container">
                    <span class="marker-text">${name.split(' ')[0]}</span>
                    <div class="marker-tip"></div>
                   </div>`,
            iconSize: [100, 40],
            iconAnchor: [50, 40]
        });
    };

    if (loading) return <div className="app-loader"><span>Syncing with Pharbit Chain...</span></div>;

    const validBatches = data.filter(item => item.batch !== null);
    const medInfo = validBatches.length > 0 ? validBatches[0].batch.medicines : null;
    const locations = validBatches.filter(item => item.organization?.lat && item.organization?.long);

    // 🔥 FIX: Safe center fallback
    const center = locations.length > 0
        ? [
            parseFloat(locations[0].organization.lat),
            parseFloat(locations[0].organization.long)
        ]
        : [28.6139, 77.2090];

    return (
        <div className="med-locate-wrapper">
            <div className="med-content-sidebar">
                {medInfo && (
                    <div className="med-hero-section">
                        <div className="status-tag">Verified Supply</div>
                        <h1 className="med-name">{medInfo.name} <small>{medInfo.strength}</small></h1>
                        <p className="med-brand-name">{medInfo.brand_name}</p>
                        <div className="med-price">₹{medInfo.mrp}</div>

                        <div className="med-tags">
                            {medInfo.composition.slice(0, 2).map((c, i) => (
                                <span key={i} className="tag">{c}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="availability-section">
                    <h3 className="section-heading">Nearby Pharmacies</h3>
                    <div className="pharmacy-list">
                        {validBatches.map((item) => {
                            const isLowStock = item.amount < 30;
                            return (
                                <div key={item.id} className={`pharmacy-item ${isLowStock ? 'is-urgent' : ''}`}>
                                    <div className="item-header">
                                        <div className="org-details">
                                            <h4>{item.organization.name}</h4>
                                            <p>{item.organization.address.city}</p>
                                        </div>
                                        <div className="stock-badge">
                                            <span className="count">{item.amount}</span>
                                            <span className="label">Units</span>
                                        </div>
                                    </div>

                                    {isLowStock && (
                                        <div className="urgency-banner">⚠️ Limited availability - Act fast</div>
                                    )}

                                    <div className="item-footer">
                                        <span className="exp-date">Expires: {item.batch.expiry_date}</span>
                                        <button className="nav-btn">Directions</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 🔥 FIXED MAP */}
            <div className="med-map-container">
                {locations.length > 0 && (
                    <MapContainer
                        key={center.join(",")} // 🔥 forces rerender
                        center={center}
                        zoom={14}
                        className="leaflet-full-view"
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />

                        {locations.map((loc) => (
                            <Marker
                                key={loc.id}
                                position={[
                                    parseFloat(loc.organization.long),
                                    parseFloat(loc.organization.lat)
                                ]}
                                icon={createStoreLabel(loc.organization.name)}
                            >
                                <Popup className="premium-popup">
                                    <strong>{loc.organization.name}</strong><br />
                                    Ready for pickup.
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default MedsLocate;