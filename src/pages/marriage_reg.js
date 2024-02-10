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
import jsPDF from "jspdf";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import useAuth from "../components/useAuth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsIqHHA8727cGeTjr0dUQQmttqJ2nW_IE",
  authDomain: "muniserve-4dc11.firebaseapp.com",
  projectId: "muniserve-4dc11",
  storageBucket: "muniserve-4dc11.appspot.com",
  messagingSenderId: "874813480248",
  appId: "1:874813480248:web:edd1ff1f128b5bb4a2b5cd",
  measurementId: "G-LS66HXR3GT",
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const snapshot = await collection(firestore, "marriage_reg");
      const querySnapshot = await getDocs(snapshot);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      console.log("Fetched Data:", items);  // Add this line
  
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
      setLoading(false);  // Add this line to indicate data loading is complete
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(error);
      setLoading(false);  // Add this line to indicate data loading is complete
    }
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  // PDF File
  const exportDataAsPDF = async () => {
    // Wait for data to be fetched
    await fetchData();

    const columns = [
      {
        Header: "No.", // Auto-numbering column
      },
      {
        Header: "Name",
        accessor: "userName",
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
      },
      {
        Header: "Status",
        accessor: "status",
      },
    ];

    const pdfDoc = new jsPDF({ orientation: "landscape" });

  const logoImg = new Image();
  logoImg.src = logo;
  pdfDoc.addImage(logoImg, "PNG", 95, 15, 20, 20);

  pdfDoc.setFontSize(12);
  let text = "Republic of the Philippines";
  let textWidth = pdfDoc.getStringUnitWidth(text) * 12 / pdfDoc.internal.scaleFactor; // Assuming font size 12
  let xPosition = (pdfDoc.internal.pageSize.getWidth() - textWidth) / 2;
  pdfDoc.text(text, xPosition, 20);
  
  text = "Province of Camarines Sur";
  textWidth = pdfDoc.getStringUnitWidth(text) * 12 / pdfDoc.internal.scaleFactor;
  xPosition = (pdfDoc.internal.pageSize.getWidth() - textWidth) / 2;
  pdfDoc.text(text, xPosition, 25);
  
  pdfDoc.setFontSize(14);
  text = "Municipality of Del Gallego";
  textWidth = pdfDoc.getStringUnitWidth(text) * 14 / pdfDoc.internal.scaleFactor;
  xPosition = (pdfDoc.internal.pageSize.getWidth() - textWidth) / 2;
  pdfDoc.text(text, xPosition, 30);
  
  const lineText = "-oo0oo-";
  const lineTextWidth = pdfDoc.getStringUnitWidth(lineText) * 12 / pdfDoc.internal.scaleFactor; // Assuming font size 12
  const lineXPosition = (pdfDoc.internal.pageSize.getWidth() - lineTextWidth) / 2;
  pdfDoc.text(lineText, lineXPosition, 35);
  
  pdfDoc.setDrawColor(255, 255, 0);
  pdfDoc.setLineWidth(0.2); 
  pdfDoc.line(14, 38, 280, 38);
  pdfDoc.setDrawColor(255, 255, 0);
  pdfDoc.setLineWidth(1); 
  pdfDoc.line(14, 39, 280, 39);

    // Calculate row numbers and add them to the data rows
    const dataRows = filteredData.map((item, index) => {
      const rowData = columns.map((column) => {
        // Format date as a string if it exists and the column is "createdAt"
        if (column.accessor === "createdAt" && item[column.accessor]) {
          const dateValue = item[column.accessor]?.toDate?.();
          return dateValue ? new Date(dateValue).toLocaleDateString() : "";
        }
        return item[column.accessor] || "";
      });

      // Add the row number as the first column
      rowData.unshift(index + 1);

      return rowData;
    });

    // Add header row to PDF as a table with fixed column width
    pdfDoc.autoTable({
      head: [columns.map((column) => column.Header)],
      startY: 43,
      styles: { fontSize: 10, cellPadding: 2 },
      columnWidth: { head: 100 }, // Set the width of header columns to 100px
    });

    // Add data rows to PDF as a table with fixed column width
    pdfDoc.autoTable({
      body: dataRows,
      startY: pdfDoc.autoTable.previous.finalY + 2,
      styles: { fontSize: 10, cellPadding: 2 },
      columnWidth: { body: 100 }, // Set the width of body columns to 100px
    });

    // Add footer to each page
    const pageCount = pdfDoc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdfDoc.setDrawColor(255, 255, 0);
        pdfDoc.setLineWidth(0.2); 
        pdfDoc.line(14, 191, 280, 191);
        pdfDoc.setDrawColor(255, 255, 0);
        pdfDoc.setLineWidth(1); 
        pdfDoc.line(14, 192, 280, 192);
        pdfDoc.setFontSize(11);
        pdfDoc.text("Service Cellphone Number: 0905 399 3015",25,197);
        pdfDoc.text("Email Address: delgallego1937@gmail.com",180,197);
        pdfDoc.setFontSize(9);
        pdfDoc.setPage(i);
        const footerText = `Page ${i} of  ${pageCount}`;
        const footerTextWidth = pdfDoc.getStringUnitWidth(footerText) * 12 / pdfDoc.internal.scaleFactor; // Assuming font size 12
        const footerXPosition = (pdfDoc.internal.pageSize.getWidth() - footerTextWidth) / 2;
        pdfDoc.text(footerText, footerXPosition, pdfDoc.internal.pageSize.getHeight() - 10); // Adjust Y position as needed
    }


    // Save the PDF
    pdfDoc.save("Marriage Registration Record.pdf");
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
        accessor: "createdAt",
        Cell: ({ value }) => {
          if (value) {
              const date = value.toDate ? value.toDate() : value;
              if (isValidDate(date)) {
                  return format(date, "MMMM d, yyyy");
              } else {
                  return "Invalid Date";
              }
          } else {
              return "N/A";
          }
      },
      },
      {
        Header: "Status",
        accessor: "status",
      },
      // ... other columns ...
    ];
  
    // Create CSV header row based on column headers
    let csvContent = columns.map((column) => `${column.Header || ""}`).join(",") + "\n";
  
    // Add data rows to CSV
    data.forEach((item) => {
      const row = columns
        .map((column) => {
          // Use accessor function if provided
          const cellValue = typeof column.accessor === 'function' ? column.accessor(item) : item[column.accessor];
  
          // Format date as a string if it exists
          let cellContent = cellValue || "";
  
          // Convert date to string if it exists
          if (column.accessor === "createdAt" && cellValue) {
            const date = cellValue.toDate ? cellValue.toDate() : cellValue;
            cellContent = isValidDate(date) ? date.toLocaleDateString() : "Invalid Date";
          }
  
          // Truncate cell content if it exceeds a certain length (adjust the length as needed)
          const maxLength = column.width || 100; // Use column width as max length
          if (cellContent.length > maxLength) {
            cellContent = cellContent.substring(0, maxLength - 100) + "...";
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
    link.download = "Birth Registration_Records.csv";
  
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

  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };

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
                const date = value.toDate ? value.toDate() : value;
                if (isValidDate(date)) {
                    return format(date, "MMMM d, yyyy");
                } else {
                    return "Invalid Date";
                }
            } else {
                return "N/A";
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

// Filtering Dataaa
const filteredData = data.filter((item) => {
  const childName = item.childname?.toLowerCase();
  const createdAt = item.createdAt?.toDate?.();
  const formattedDate = createdAt?.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })?.toLowerCase();
  const status = item.status?.toLowerCase();
  const userName = item.userName?.toLowerCase();

  const filterByName = !searchQuery || (childName && childName.includes(searchQuery.toLowerCase())) || (userName && userName.includes(searchQuery.toLowerCase()));
  const filterByYear = !selectedYearFilter || (createdAt && createdAt.getFullYear().toString() === selectedYearFilter);
  const filterByMonth = !selectedMonthFilter || (formattedDate && formattedDate.includes(selectedMonthFilter.toLowerCase()));
  const filterByDay = !selectedDayFilter || (formattedDate && formattedDate.includes(selectedDayFilter));
  const filterByStatus = !selectedStatusFilter || (status && status.includes(selectedStatusFilter.toLowerCase()));

  return filterByName && filterByYear && filterByMonth && filterByDay && filterByStatus;
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

  const handleYearFilterChange = (event) => {setSelectedYearFilter(event.target.value);
  };

  const handleMonthFilterChange = (event) => {setSelectedMonthFilter(event.target.value);
  };

  const handleDayFilterChange = (event) => {setSelectedDayFilter(event.target.value);
  };

  const handleStatusFilterChange = (event) => {setSelectedStatusFilter(event.target.value);
  };

  //Function for the account name
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserEmail = () => {
      if (user) {
        const email = user.email;
        const truncatedEmail =
          email.length > 9 ? `${email.substring(0, 9)}..` : email;
        setUserEmail(truncatedEmail);
      }
    };

    fetchUserEmail();
  }, [user]);

  return (
    <div>
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="container">
        <div className="headers">
          <div className="icons">
            <div style={{marginTop: "-20px"}}><h1>Transactions</h1></div>
            
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-names">
              <h2>{userEmail}</h2>
            </div>
          </div>
        </div>

        <div style={{textAlign: "center", marginTop: "90px"}}>
            <h1>Service Categories</h1>
          </div>

          <div className="screen">
          <div className="categories-container">
            <Link to="/birthreg" className="link">
              <button className="categories1">
                <h5>Certificate of Live Birth</h5>
              </button>
            </Link>

            <div className="dropdown">
              <button className="categories5">
                <h5>Certificate of Marriage</h5>
              </button>
              <div className="dropdown-content">
                <Link to="/marriage_reg">
                  <h5>Marriage Registration</h5>
                </Link>
                <Link to="/marriageCert">
                  <h5>Request Copy</h5>
                </Link>
              </div>
            </div>

            <div className="dropdown">
              <button className="categories4">
                <h5>Certificate of Death</h5>
              </button>
              <div className="dropdown-content">
                <Link to="/death_reg">
                  <h5>Death Registration</h5>
                </Link>
                <Link to="/deathCert">
                  <h5>Request Copy</h5>
                </Link>
              </div>
            </div>
            
            <Link to="/job" className="link">
              <button className="categories2">
                <h5>Job Application</h5>
              </button>
            </Link>
          </div>
        </div>

        <h6>________________________________________________________________________</h6>

        <div style={{textAlign: "center"}}>
          <h1>Marriage Registration</h1>
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
            <select value={selectedDayFilter} onChange={handleDayFilterChange} className="filter" >
              <option value="">Day</option>
              <option value="1">1</option>
              <option value="2">2</option>
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

            <select value={selectedStatusFilter} onChange={handleStatusFilterChange} className="filter" >
              <option value="">Status</option>
              <option value="Completed">Completed</option>
              <option value="On Process">On Process</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <DropdownButton handleExport={handleExport} />

        </div>

        {isModalOpen ? ( 
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
                        <p>
                          This registration form is requested by{" "}
                          {selectedRow.values.m_name}.
                        </p>

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
                                {selectedRow.values.c_birthdate
                                  ? formatTimestamp(
                                      selectedRow.values.c_birthdate
                                    )
                                  : "N/A"}
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
                              <div className="placeholder">{item.c_sex}</div>
                            </div>
                            <div className="form-group">
                              <label>Type of Birth</label>
                              <div className="placeholder">
                                {item.c_typeofbirth}
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Weight</label>
                              <div className="placeholder">{item.c_weight}</div>
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
                              <div className="placeholder">{item.m_age}</div>
                            </div>
                            <div className="form-group">
                              <label>Mother's Occupation</label>
                              <div className="placeholder">{item.m_occur}</div>
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
                              <div className="placeholder">{item.f_age}</div>
                            </div>
                            <div className="form-group">
                              <label>Father's Occupation</label>
                              <div className="placeholder">{item.f_occur}</div>
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
                              <img
                                src={item.payment}
                                alt="Proof of Payment"
                                style={{ width: "150px", height: "300px" }}
                              />
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