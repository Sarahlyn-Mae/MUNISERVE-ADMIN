import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Import Firebase Storage related functions
import { useTable } from "react-table";
import { saveAs } from "file-saver"; // Import file-saver for downloading
import { FaSearch } from "react-icons/fa"; // Import icons
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import "./transactions.css";
import Sidebar from "../components/sidebar";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import { Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

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
      const snapshot = await collection(firestore, "businessPermit");
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

  // PDF File
  const exportDataAsPDF = () => {
    const columns = [
      {
        Header: "Name of Applicant",
        accessor: (row) => `${row.userName} ${row.userLastName}`,
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
        Header: "Date of Application",
        accessor: (row) => {
          const date = row.createdAt.toDate ? row.createdAt.toDate() : row.createdAt;
          return date ? format(date, "MMMM d, yyyy", { locale: enUS }) : "";
      },
      Cell: ({ value }) => {
          if (value) {
              return value;
          } else {
              return "Invalid Date";
          }
      },
      },
      {
        Header: "Status",
        accessor: "status",
      },
      // ... other columns ...
    ];

    // Create a PDF document
    const pdfDoc = new jsPDF({ orientation: "landscape" });

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
            // Use accessor function if provided
            const cellValue = typeof column.accessor === 'function' ? column.accessor(item) : item[column.accessor];

            // Format date as a string if it exists
            if (Array.isArray(cellValue)) {
                return cellValue.join("-");
            } else if (column.accessor === "createdAt" && cellValue) {
                return cellValue.toDate().toLocaleDateString() || "";
            }

            // Return an empty string if the cell value is undefined or null
            return cellValue !== undefined && cellValue !== null ? cellValue : "";
        })
    );

    // Calculate the maximum width for each column based on content
    const columnWidths = columns.map((column, columnIndex) => {
        const headerWidth = pdfDoc.getStringUnitWidth(column.Header) * 12 / pdfDoc.internal.scaleFactor;
        const maxDataWidth = Math.max(...dataRows.map((row) => pdfDoc.getStringUnitWidth(String(row[columnIndex])) * 12 / pdfDoc.internal.scaleFactor));
        const totalWidth = Math.max(headerWidth, maxDataWidth) + 12; // Calculate total width with padding

        return totalWidth;
    });

    // Add data rows to PDF as a table with calculated column widths
    pdfDoc.autoTable({
        body: dataRows,
        startY: pdfDoc.autoTable.previous.finalY + 2,
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            // Apply calculated column widths
            ...columns.reduce((styles, column, index) => {
                styles[index] = { cellWidth: columnWidths[index] };
                return styles;
            }, {}),
        },
    });

    // Save the PDF
    pdfDoc.save("Business_Permit_Records.pdf");
};
  // Function to export data as CSV
  const exportDataAsCSV = () => {
    const columns = [
      {
        Header: "Name of Applicant",
        accessor: (row) => `${row.userName} ${row.userLastName}`,
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
        Header: "Date of Application",
        accessor: (row) => {
          const date = row.createdAt.toDate ? row.createdAt.toDate() : row.createdAt;
          return date ? format(date, "MMMM d, yyyy", { locale: enUS }) : "";
      },
      Cell: ({ value }) => {
          if (value) {
              return value;
          } else {
              return "Invalid Date";
          }
      },
      },
      {
        Header: "Status",
        accessor: "status",
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
    link.download = "Business_Permit_Records.csv";

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
    return "Invalid Date";
  };

  // Define table columns
  const columns = React.useMemo(
    () => [
      {
        Header: "No.", // Auto-numbering column
        accessor: (row, index) => index + 1, // Calculate row number
      },
      {
        Header: "Name of Applicant",
        accessor: (row) => `${row.userName} ${row.userLastName}`,
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
    ],
    []
  );

  const showAllData = true; // Set this to true to see all data without filtering

  const filteredData = showAllData
    ? data
    : data.filter((item) => {
        const getMonthName = (monthNumber) => {
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return monthNames[monthNumber - 1];
        };

        return (
          item.rname &&
          item.rname.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (selectedYearFilter !== ""
            ? item.createdAt &&
              item.createdAt.toDate &&
              typeof item.createdAt.toDate === "function" &&
              item.createdAt.toDate().getFullYear().toString() ===
                selectedYearFilter
            : true) &&
          (selectedMonthFilter !== ""
            ? item.createdAt &&
              item.createdAt.toDate &&
              typeof item.createdAt.toDate === "function" &&
              getMonthName(item.createdAt.toDate().getMonth() + 1).toLowerCase() ===
                selectedMonthFilter.toLowerCase()
            : true) &&
          (selectedDayFilter !== ""
            ? item.createdAt &&
              item.createdAt.toDate &&
              typeof item.createdAt.toDate === "function" &&
              item.createdAt.toDate().getDate().toString() === selectedDayFilter
            : true) &&
          (selectedStatusFilter !== ""
            ? item.status.toLowerCase().includes(selectedStatusFilter.toLowerCase())
            : true)
        );
      });

  // React Table configuration
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: filteredData,
    });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rows.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        <div className="header">
          <div className="icons">
            <h1>Transactions</h1>
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-name">
              <h1>Admin</h1>
            </div>
          </div>
        </div>

        <div className="screen">
          <div className="categories-container">
            <Link to="/birthreg" className="link">
              <button className="categories1">
                <h5>Certificate of Live Birth</h5>
              </button>
            </Link>

            <Link to="/marriageCert" className="link">
              <button className="categories1">
                <h5>Certificate of Marriage</h5>
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
          <h1>Business Permit</h1>
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
            <select
              value={selectedYearFilter}
              onChange={handleYearFilterChange}
              className="filter"
            >
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
            <select
              value={selectedMonthFilter}
              onChange={handleMonthFilterChange}
              className="filter"
            >
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
            <select
              value={selectedDayFilter}
              onChange={handleDayFilterChange}
              className="filter"
            >
              <option value="">Day</option>
              <option value="1">1</option>
              <option value="2">2</option>\<option value="3">3</option>
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

          <DropdownButton handleExport={handleExport} />
        </div>

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
                        <p>
                          This registration form is requested by{" "}
                          {selectedRow.values.m_name}.
                        </p>

                        <div className="section">
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Name of Wife</label>
                              <div className="placeholder">{item.wname}</div>
                            </div>

                            <div className="form-group">
                              <label>Name of Husband</label>
                              <div className="placeholder">{item.hname}</div>
                            </div>

                            <div className="form-group">
                              <label>Date of Marriage</label>
                              <div className="placeholder">
                                {item.date &&
                                  item.date.toDate().toLocaleString()}
                              </div>
                            </div>

                            <div className="form-group">
                              <label>Place of Marriage</label>
                              <div className="placeholder">{item.marriage}</div>
                            </div>

                            <div className="form-group">
                              <label>Complete name of requesting party</label>
                              <div className="placeholder">
                                {selectedRow.values.rname}
                              </div>
                            </div>

                            <div className="form-group">
                              <label>
                                Complete address of requesting party
                              </label>
                              <div className="placeholder">{item.address}</div>
                            </div>

                            <div className="form-group">
                              <label>Number of copies needed</label>
                              <div className="placeholder">{item.copies}</div>
                            </div>

                            <div className="form-group">
                              <label>Purpose of the certification</label>
                              <div className="placeholder">{item.purpose}</div>
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
          <Table
            striped
            bordered
            hover
            {...getTableProps()}
            className="custom-table"
          >
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {currentItems.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    ))}
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
          </Table>
        )}

        <Pagination>
          {[...Array(Math.ceil(rows.length / itemsPerPage)).keys()].map(
            (number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPage}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            )
          )}
        </Pagination>
      </div>
    </div>
  );
}

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
