import { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import Header from "../../Components/Dashboard/Header";
import PassingModal from "../../Components/Dashboard/PassingModal";

import "../../Styles/Pages/Product.css";

const url = import.meta.env.VITE_API_URL;

export default function Passing() {

    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShipment, setSelectedShipment] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {

            setLoading(true);

            const res = await fetch(`${url}/shipments/current`, {
                credentials: "include"
            });

            const result = await res.json();

            if (result.success) {
                setShipments(result.data);
            }

        } catch (err) {
            console.error("Failed to fetch shipments:", err);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(shipments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentItems = shipments.slice(indexOfFirstItem, indexOfLastItem);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="inventory-view">

            <Header />

            <div className="inventory-glass-card">

                <header className="inventory-top-bar">
                    <div className="title-area">
                        <h1>Shipments in Custody</h1>
                    </div>
                </header>

                <div className="table-responsive">
                    <table className="modern-table">

                        <thead>
                            <tr>
                                <th>Medicine & Batch</th>
                                <th>Origin</th>
                                <th>Final Destination</th>
                                <th>Current Holder</th>
                                <th>Amount</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="status-cell">
                                        <div className="loader" />
                                    </td>
                                </tr>
                            ) : currentItems.length > 0 ? (

                                currentItems.map((ship) => (

                                    <tr key={ship.id} className="fade-in-row">

                                        <td>
                                            <div className="med-identity">
                                                <span className="m-name">
                                                    {ship.batch?.medicines?.name}
                                                </span>
                                                <span className="m-code">
                                                    Mint ID: #{ship.batch?.blockchain_mint_id}
                                                </span>
                                            </div>
                                        </td>

                                        <td>{ship.source_org?.name}</td>
                                        <td>{ship.destination_org?.name}</td>
                                        <td>{ship.current_holder_org?.name}</td>

                                        <td>{ship.medicines_amount} Units</td>

                                        <td>
                                            <button
                                                className={`view-link ${ship.status === "FORWARDED" ? "disabled-btn" : ""}`}
                                                onClick={
                                                    ship.status === "FORWARDED"
                                                        ? null
                                                        : () => setSelectedShipment(ship)
                                                }
                                                disabled={ship.status === "FORWARDED"}
                                                style={
                                                    ship.status === "FORWARDED"
                                                        ? { pointerEvents: "none", opacity: 0.5, cursor: "not-allowed" }
                                                        : {}
                                                }
                                            >
                                                {ship.status === "FORWARDED" ? "Shipment Passed" : "Pass Shipment"}
                                            </button>
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td colSpan="6" className="empty-msg">
                                        No shipments available.
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>
                </div>


                {!loading && shipments.length > itemsPerPage && (

                    <footer className="pagination-footer">

                        <p className="page-info">
                            Showing <b>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, shipments.length)}</b> of {shipments.length}
                        </p>

                        <div className="pagination-controls">

                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="pag-btn"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="page-numbers">
                                {getPageNumbers().map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={`num-btn ${currentPage === num ? "active" : ""}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="pag-btn"
                            >
                                <ChevronRight size={16} />
                            </button>

                        </div>

                    </footer>

                )}

            </div>

            {selectedShipment && (
                <PassingModal
                    shipment={selectedShipment}
                    onClose={() => setSelectedShipment(null)}
                    onSuccess={fetchShipments}
                />
            )}

        </div>
    );
}