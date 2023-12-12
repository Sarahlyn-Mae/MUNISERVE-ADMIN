import React, { useState } from "react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import Chart from "react-apexcharts";
import './transactions.css';
import Sidebar from "../components/sidebar";

function App() {

    const [state, setState] = useState({
        options: {
            colors: ["#8884d8", "#82ca9d"],
            chart: {
                id: "basic-bar",
            },
            xaxis: {
                categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
            },
        },
        series: [
            {
                name: "People Born",
                data: [30, 40, 45, 50, 49, 60, 70, 91],
            },
            {
                name: "People Died",
                data: [3, 60, 35, 80, 49, 70, 20, 81],
            },
        ],
    });

    return (
        <div>
            <div className="sidebar">
                <Sidebar />
            </div>

            <div className="container">
                <h1>Transaction Records</h1>
                
                <div className='screen'>
                    <div className="categories-container">
                        <Link to="/birthReg" className="link">
                            <button className="categories1">
                                <h5>Certificate of Live Birth</h5>
                            </button>
                        </Link>

                        <Link to="/marriageCert" className="link">
                            <button className="categories1">
                                <h5>Marriage Certificate</h5>
                            </button>
                        </Link>

                        <Link to="/deathCert" className="link">
                            <button className="categories1">
                                <h5>Certificate of Death Certificate</h5>
                            </button>
                        </Link>

                        <Link to="/businessPermit" className="link">
                            <button className="categories1">
                                <h5>Business Permit</h5>
                            </button>
                        </Link>

                        <Link to="/job" className="link">
                            <button className="categories1">
                                <h5>Job Application</h5>
                            </button>
                        </Link> 
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;