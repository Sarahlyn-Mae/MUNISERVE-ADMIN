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
import notification from '../assets/icons/Notification.png';
import logo from '../assets/logo.png';
import jsPDF from "jspdf";

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
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

    const fetchData = async () => {
        try {
            const snapshot = await collection(firestore, "birth_reg");
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
            items.sort((a, b) => {
                const aSeconds = a.createdAt?.seconds || 0;
                const bSeconds = b.createdAt?.seconds || 0;
                return bSeconds - aSeconds;
              });

            setData(items);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

  // PDF File
  const exportDataAsPDF = () => {
    const columns = [
        {
            Header: "Child Name",
            accessor: "childname",
        },
        {
            Header: "Birth Date",
            accessor: "c_birthdate",
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
            Header: "Residency",
            accessor: "userBarangay",
        },
        {
            Header: "Mobile No.",
            accessor: "userContact",
        },
        {
            Header: "Email",
            accessor: "userEmail",
        },
        {
            Header: "Name of Applicant",
            accessor: "userName",
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
      // ... other columns ...
    ];

    // Create a PDF document
    const pdfDoc = new jsPDF();

    // Set font size and style
    pdfDoc.setFontSize(12);
    pdfDoc.setFont("helvetica", "bold");

    // Add header row to PDF as a table
    pdfDoc.autoTable({
      head: [columns.map((column) => column.Header)],
      startY: 10,
      styles: { fontSize: 12, cellPadding: 2 },
    });

    // Add data rows to PDF as a table
    const dataRows = data.map((item) =>
      columns.map((column) => {
        // Format date as a string if it exists
        if (column.accessor === "date" && item[column.accessor]) {
          return item[column.accessor].toDate().toLocaleDateString() || "";
        }
        return item[column.accessor] || "";
      })
    );

    pdfDoc.autoTable({
      body: dataRows,
      startY: pdfDoc.autoTable.previous.finalY + 2,
      styles: { fontSize: 10, cellPadding: 2 },
    });

    // Save the PDF
    pdfDoc.save("BirthReg_Records.pdf");
  };

  // Function to export data as CSV
  const exportDataAsCSV = () => {
    const columns = [
        {
            Header: "Child Name",
            accessor: "childname",
        },
        {
            Header: "Birth Date",
            accessor: "c_birthdate",
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
            Header: "Residency",
            accessor: "userBarangay",
        },
        {
            Header: "Mobile No.",
            accessor: "userContact",
        },
        {
            Header: "Email",
            accessor: "userEmail",
        },
        {
            Header: "Name of Applicant",
            accessor: "userName",
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
      // ... other columns ...
    ];

    // Create CSV header row based on column headers and widths
    let csvContent =
      columns.map((column) => `${column.Header || ""}`).join(",") + "\n";
    csvContent +=
      columns.map((column) => `${column.width || ""}`).join(",") + "\n";

    // Add data rows to CSV
    data.forEach((item) => {
      const row =
        columns
          .map((column) => {
            // Format date as a string if it exists
            let cellContent = item[column.accessor] || "";

            // Truncate cell content if it exceeds a certain length (adjust the length as needed)
            const maxLength = column.width || 100; // Use column width as max length
            if (cellContent.length > maxLength) {
              cellContent = cellContent.substring(0, maxLength - 100) + "...";
            }

            if (column.accessor === "date" && item[column.accessor]) {
              return `${
                item[column.accessor].toDate().toLocaleDateString() || ""
              }`;
            }
            return `${cellContent}`;
          })
          .join(",") + "\n";

      csvContent += row;
    });

    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

    // Create a download link
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "BirthReg_Records.csv";

    // Append the link to the document
    document.body.appendChild(link);

    // Trigger a click event on the link to initiate the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
  };

  // Function to handle export based on type
  const handleExport = (exportType) => {
    if (exportType === "pdf") {
      exportDataAsPDF();
    } else if (exportType === "csv") {
      exportDataAsCSV();
    }
    // Add more conditions for other export types if needed
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
                Header: "Child Name",
                accessor: (row) => `${row.original.c_fname} ${row.original.c_mname} ${row.original.c_lname}`,
            },
            {
                Header: "Birth Date",
                accessor: "birthdate",
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
                Header: "Residency",
                accessor: "userBarangay",
            },
            {
                Header: "Mobile No.",
                accessor: "userContact",
            },
            {
                Header: "Email",
                accessor: "userEmail",
            },
            {
                Header: "Name of Applicant",
                accessor: "userName",
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
                    <button onClick={() => openModal(row)} className="view-btn">View</button>
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
            item.childname &&
            item.childname.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedYearFilter !== "" ? (item.c_birthdate && item.c_birthdate.toDate && typeof item.c_birthdate.toDate === 'function' && item.c_birthdate.toDate().getFullYear().toString() === selectedYearFilter) : true) &&
            (selectedMonthFilter !== "" ? (item.c_birthdate && item.c_birthdate.toDate && typeof item.c_birthdate.toDate === 'function' && getMonthName(item.c_birthdate.toDate().getMonth() + 1).toLowerCase() === selectedMonthFilter.toLowerCase()) : true) &&
            (selectedDayFilter !== "" ? (item.c_birthdate && item.c_birthdate.toDate && typeof item.c_birthdate.toDate === 'function' && item.c_birthdate.toDate().getDate().toString() === selectedDayFilter) : true) &&
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

            <div className='container'>
                <div className="header">
                    <div className='icons'>
                        <h1>Transactions</h1>
                        <img src={notification} alt="Notification.png" className='notif' />
                        <img src={logo} alt="logo" className='account-img' />
                        <div className='account-name'><h1>Admin</h1></div>
                    </div>
                </div>

                <div className='screen'>
                    <div className="categories-container">
                        <Link to="/birthreg" className="link">
                            <button className="categories1">
                                <h5>Certificate of Live Birth</h5>
                            </button>
                        </Link>

                        <Link to="/marriageCert" className="link">
                            <button className="categories1">
                                <h5>Certificate of Marriage </h5>
                            </button>
                        </Link>

                        <Link to="/deathCert" className="link">
                            <button className="categories1">
                                <h5>Certificate of Death</h5>
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

                <div>
                    <h1>Certificate of Live Birth</h1>
                </div>

                <div className="searches">
                    <FaSearch className="search-icons"></FaSearch>
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

        {/* DropdownButton component for export */}
        <DropdownButton handleExport={handleExport} />

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
                                                    <h6>Birth Registration</h6>
                                                    <span className="close" onClick={closeModal}>
                                                        &times;
                                                    </span>
                                                </div>
                                                <p>This registration form is requested by {selectedRow.values.m_name}.</p>

                                                {/* Child's Information */}
                                                <div className="section">
                                                    <h3>Child's Information</h3>
                                                    <div className="form-grid">
                                                        <div className="form-group">
                                                            <label>Name of Child</label>
                                                            <div className="placeholder">
                                                                {selectedRow.values.childname}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Birth date</label>
                                                            <div className="placeholder">
                                                                {selectedRow.values.c_birthdate ? formatTimestamp(selectedRow.values.c_birthdate) : 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Birth Place</label>
                                                            <div className="placeholder">
                                                                {selectedRow.values.c_birthplace}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Sex</label>
                                                            <div className="placeholder">
                                                                {item.c_sex}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Type of Birth</label>
                                                            <div className="placeholder">
                                                                {item.c_typeofbirth}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Weight</label>
                                                            <div className="placeholder">
                                                                {item.c_weight}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Birth Order</label>
                                                            <div className="placeholder">
                                                                {item.c_birthorder}
                                                            </div>
                                                        </div>

                                                        {/* Add more child fields here */}
                                                    </div>
                                                </div>

                                                {/* Mother's Information */}
                                                <div className="section">
                                                    <h3>Mother's Information</h3>
                                                    <div className="form-grid">
                                                        <div className="form-group">
                                                            <label>Mother's Name</label>
                                                            <div className="placeholder">
                                                                {selectedRow.values.m_name}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Mother's Age at the time of Birth</label>
                                                            <div className="placeholder">
                                                                {item.m_age}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Mother's Occupation</label>
                                                            <div className="placeholder">
                                                                {item.m_occur}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Mother's Citizenship</label>
                                                            <div className="placeholder">
                                                                {item.m_citizenship}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Mother's Religion</label>
                                                            <div className="placeholder">
                                                                {item.m_religion}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Total Children</label>
                                                            <div className="placeholder">
                                                                {item.m_totchild}
                                                            </div>
                                                        </div>
                                                        {/* Add more mother fields here */}
                                                    </div>
                                                </div>

                                                {/* Father's Information */}
                                                <div className="section">
                                                    <h3>Father's Information</h3>
                                                    <div className="form-grid">
                                                        <div className="form-group">
                                                            <label>Father's Name</label>
                                                            <div className="placeholder">
                                                                {selectedRow.values.f_name}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Father's Age at the time of Birth</label>
                                                            <div className="placeholder">
                                                                {item.f_age}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Father's Occupation</label>
                                                            <div className="placeholder">
                                                                {item.f_occur}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Father's Citizenship</label>
                                                            <div className="placeholder">
                                                                {item.f_citizenship}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Father's Religion</label>
                                                            <div className="placeholder">
                                                                {item.f_religion}
                                                            </div>
                                                        </div>
                                                        {/* Add more father fields here */}
                                                    </div>
                                                </div>

                                                {/* Other Information */}
                                                <div className="section">
                                                    <h3>Other Information</h3>
                                                    <div className="form-grid">
                                                        <div className="form-group">
                                                            <label>Place of Marriage</label>
                                                            <div className="placeholder">
                                                                {item.f_placemarried}
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Attendant</label>
                                                            <div className="placeholder">
                                                                {item.attendant}
                                                            </div>
                                                        </div>
                                                        {/* Add more other fields here */}
                                                    </div>
                                                </div>

                                                <div className="section">
                                                    <h3>Proof of Payment</h3>
                                                    <div className="proof">
                                                        {item.payment ? (
                                                            <img src={item.payment} alt="Proof of Payment" style={{ width: "150px", height: "300px" }} />
                                                        ) : (
                                                            <p>No payment proof available</p>
                                                        )}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Status of Appointment</label>
                                                        <div className="placeholder">
                                                            {selectedRow.values.status}
                                                        </div>
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
};

const DropdownButton = ({ handleExport }) => (
    <div className="dropdown">
      <button className="dropbtn">Export File</button>
      <div className="dropdown-content">
        <button onClick={() => handleExport("pdf")}>Export as PDF</button>
        <button onClick={() => handleExport("csv")}>Export as CSV</button>
        {/* Add more buttons for other export types */}
      </div>
    </div>
  );

export default App;