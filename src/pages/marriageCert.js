import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Import Firebase Storage related functions
import { useTable } from "react-table";
import { saveAs } from 'file-saver'; // Import file-saver for downloading
import { FaSearch } from 'react-icons/fa'; // Import icons
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import './transactions.css';
import Sidebar from "../components/sidebar";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsIqHHA8727cGeTjr0dUQQmttqJ2nW_IE",
    authDomain: "muniserve-4dc11.firebaseapp.com",
    projectId: "muniserve-4dc11",
    storageBucket: "muniserve-4dc11.appspot.com",
    messagingSenderId: "874813480248",
    appId: "1:874813480248:web:edd1ff1f128b5bb4a2b5cd",
    measurementId: "G-LS66HXR3GT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function App() {
    // State to hold the fetched data
    const [data, setData] = useState([]);
    // Initialize Firebase Storage
    const storage = getStorage(app);
    const [searchQuery, setSearchQuery] = useState(""); // New state for the search query
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedYearFilter, setSelectedYearFilter] = useState("");
    const [selectedMonthFilter, setSelectedMonthFilter] = useState("");
    const [selectedDayFilter, setSelectedDayFilter] = useState("");
    const [selectedBirthplaceFilter, setSelectedBirthplaceFilter] = useState("");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

    const fetchData = async () => {
        try {
            const snapshot = await collection(firestore, "marriageCert");
            const querySnapshot = await getDocs(snapshot);
            const items = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Fetch image URLs from Firebase Storage and add them to the data
            for (const item of items) {
                if (item.imagePath) {
                    const imageUrl = await getDownloadURL(ref(storage, item.imagePath));
                    item.imageUrl = imageUrl; // Store the image URL in the data
                }
            }

            // Sort the data based on createdAt timestamp in descending order
            items.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

            setData(items);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Function to export data as CSV
    const exportDataAsCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8," +
            "Childname,Birthdate,Birth Place,Sex,Type of Birth,Weight,Birth Order,Mother's Name,Mother's Age,Mother's Occupation,Mother's Citizenship,Mother's Religion,Mother's Total Children,Father's Name,Father's Age,Father's Occupation,Father's Citizenship,Father's Religion,Place of Marriage,Birth Attendant,Status\n"; // CSV header row

        // Add data rows to CSV
        data.forEach((item) => {
            const row = Object.values(item).map(value => `"${value}"`).join(",") + "\n";
            csvContent += row;
        });

        // Create a data URI and trigger download
        const encodedURI = encodeURI(csvContent);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'Transaction_Records.csv');
    };

    const openModal = async (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRow(null);
        setIsModalOpen(false);
    };

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }

    const formatTimestamp = (timestamp) => {
        if (timestamp && timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleDateString();
        }
        return 'Invalid Date';
    };

    // Define table columns
    const columns = React.useMemo(
        () => [
            {
                Header: "No.", // Auto-numbering column
                accessor: (row, index) => index + 1, // Calculate row number
            },
            {
                Header: "Name",
                accessor: "rname",
            },
            {
                Header: "Date of Application",
                accessor: "createdAt",
                Cell: ({ value }) => {
                    if (value) {
                        const date = value.toDate ? value.toDate() : value; // Check if toDate() is available
                        if (isValidDate(date)) {
                            return date.toLocaleDateString();
                        } else {
                            return "Invalid Date";
                        }
                    } else {
                        return "N/A"; // Handle the case where value is null or undefined
                    }
                },
            },
            {
                Header: "Status",
                accessor: "status",
            },
            {
                Header: "Actions",
                accessor: "actions",
                Cell: ({ row }) => (
                    <button onClick={() => openModal(row)}>View</button>
                ),
            },
        ],
        []
    );

    const filteredData = data.filter((item) => {
        const getMonthName = (monthNumber) => {
            const monthNames = [
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December"
            ];
            return monthNames[monthNumber - 1];
        };

        return (
            item.rname &&
            item.rname.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedYearFilter !== "" ? (item.createdAt && item.createdAt.toDate && typeof item.createdAt.toDate === 'function' && item.createdAt.toDate().getFullYear().toString() === selectedYearFilter) : true) &&
            (selectedMonthFilter !== "" ? (item.createdAt && item.createdAt.toDate && typeof item.createdAt.toDate === 'function' && getMonthName(item.createdAt.toDate().getMonth() + 1).toLowerCase() === selectedMonthFilter.toLowerCase()) : true) &&
            (selectedDayFilter !== "" ? (item.createdAt && item.createdAt.toDate && typeof item.createdAt.toDate === 'function' && item.createdAt.toDate().getDate().toString() === selectedDayFilter) : true) &&
            (selectedStatusFilter !== "" ? item.status.toLowerCase().includes(selectedStatusFilter.toLowerCase()) : true)
        );
    });

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data: filteredData,
    });

    const handleYearFilterChange = (event) => {
        setSelectedYearFilter(event.target.value);
    };

    const handleMonthFilterChange = (event) => {
        setSelectedMonthFilter(event.target.value);
    };

    const handleDayFilterChange = (event) => {
        setSelectedDayFilter(event.target.value);
    };

    const handleStatusFilterChange = (event) => {
        setSelectedStatusFilter(event.target.value);
    };

    return (
        <div>
            <div className="sidebar">
                <Sidebar />
            </div>

            <div className="container">
                <h1>Marriage Certificate Transaction Records</h1>

                <div className='screen'>
                    <div className="categories-container">
                        <Link to="/birthreg" className="link">
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

                <div className="search-container">
                    <FaSearch className="search-icon"></FaSearch>
                    <input
                        type="text"
                        placeholder="Search by Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <div className="filter-container">
                        <label>Filter:</label>
                        <select value={selectedYearFilter} onChange={handleYearFilterChange} className="filter">
                            <option value="">Year</option>
                            <option value="2031">2031</option>
                            <option value="2030">2030</option>
                            <option value="2029">2029</option>
                            <option value="2028">2028</option>
                            <option value="2027">2027</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            
                        </select>
                        <select value={selectedMonthFilter} onChange={handleMonthFilterChange} className="filter">
                            <option value="">Month</option>
                            <option value="January">January</option>
                            <option value="February">February</option>
                            <option value="March">March</option>
                            <option value="April">April</option>
                            <option value="May">May</option>
                            <option value="June">June</option>
                            <option value="July">July</option>
                            <option value="August">August</option>
                            <option value="September">September</option>
                            <option value="October">October</option>
                            <option value="November">November</option>
                            <option value="December">December</option>
                        </select>
                        <select value={selectedDayFilter} onChange={handleDayFilterChange} className="filter">
                            <option value="">Day</option>
                            <option value="1">1</option>
                            <option value="2">2</option>\
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                            <option value="24">24</option>
                            <option value="25">25</option>
                            <option value="26">26</option>
                            <option value="27">27</option>
                            <option value="28">28</option>
                            <option value="29">29</option>
                            <option value="30">30</option>
                            <option value="31">31</option>                          
                        </select>

                        <select
                            value={selectedStatusFilter}
                            onChange={handleStatusFilterChange}
                            className="filter"
                        >
                            <option value="">Status</option>
                            <option value="Completed">Completed</option>
                            <option value="On Process">On Process</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>

                <button className="btn" onClick={exportDataAsCSV}>Export as CSV</button>

                {isModalOpen ? ( // Render modal content if the modal is open
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Full Details</h2>
                            {selectedRow && (
                                <form>
                                    {data
                                        .filter((item) => item.id === selectedRow.original.id)
                                        .map((item) => (
                                            <div key={item.id} className="request-item">
                                                <div className="title">
                                                    <h6>Full Details</h6>
                                                    <span className="close" onClick={closeModal}>
                                                        &times;
                                                    </span>
                                                </div>
                                                <p>This registration form is requested by {selectedRow.values.m_name}.</p>

                                                <div className="section">
                                                    <div className="form-grid">

                                                        <div className="form-group">
                                                            <label>Name of Wife</label>
                                                            <div className="placeholder">{item.wname}</div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Name of Husband</label>
                                                            <div className="placeholder">
                                                                {item.hname}
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Date of Marriage</label>
                                                            <div className="placeholder">
                                                                {item.date && item.date.toDate().toLocaleString()}
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Place of Marriage</label>
                                                            <div className="placeholder">
                                                                {item.marriage}
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Complete name of requesting party</label>
                                                            <div className="placeholder">
                                                                {selectedRow.values.rname}
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Complete address of requesting party</label>
                                                            <div className="placeholder">
                                                                {item.address}
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Number of copies needed</label>
                                                            <div className="placeholder">
                                                                {item.copies}
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label>Purpose of the certification</label>
                                                            <div className="placeholder">
                                                                {item.purpose}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className="section">
                                                    <h3>Proof of Payment</h3>
                                                    <div className="proof">
                                                        {item.payment ? (
                                                            <img
                                                                src={item.payment}
                                                                alt="Proof of Payment"
                                                                className="proof-image"
                                                            />
                                                        ) : (
                                                            <p>No payment proof available</p>
                                                        )}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Status of Appointment</label>
                                                        <div className="placeholder">{item.status}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </form>
                            )}
                        </div>
                    </div>
                ) : (
                    // Render the table if the modal is not open
                    <table {...getTableProps()} style={{ border: "1px solid black" }}>
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map((column) => (
                                        <th
                                            {...column.getHeaderProps()}
                                            style={{ borderBottom: "1px solid black" }}
                                        >
                                            {column.render("Header")}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map((row) => {
                                prepareRow(row);
                                return (
                                    <tr
                                        {...row.getRowProps()}
                                        style={{ borderBottom: "1px solid black" }}
                                    >
                                        {row.cells.map((cell) => {
                                            return (
                                                <td
                                                    {...cell.getCellProps()}
                                                    style={{ padding: "8px", border: "1px solid black" }}
                                                >
                                                    {cell.render("Cell")}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: "center" }}>
                                            No matching records found.
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default App;