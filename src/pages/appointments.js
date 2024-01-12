import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useTable } from "react-table";
import { FaSearch } from "react-icons/fa"; // Import icons
import { saveAs } from "file-saver"; // Import file-saver for downloading
import "./appointment.css";
import Sidebar from "../components/sidebar";
import jsPDF from "jspdf";
import "jspdf-autotable";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import folder from "../assets/icons/folder.png";
import { Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

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
  const [localData, setLocalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for the search query
  const [departmentFilter, setDepartmentFilter] = useState(""); // State for department filter
  const [dateFilter, setDateFilter] = useState(""); // State for date filter
  const [personnelFilter, setPersonnelFilter] = useState(""); // State for personnel filter
  const [statusFilter, setStatusFilter] = useState(""); // State for status filter

  // Function to fetch data from Firestore
  const fetchData = async () => {
    try {
      const snapshot = await collection(firestore, "appointments");
      const querySnapshot = await getDocs(snapshot);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(items);
      setLocalData(items); // Initialize localData with the fetched data
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();
  }, []);

  // PDF File
  const exportDataAsPDF = () => {
    const columns = [
      {
        Header: "No.",
        accessor: (row, index) => index + 1,
        width: 50,
      },
      {
        Header: "User Name",
        accessor: "name",
        width: 150,
      },
      {
        Header: "Department",
        accessor: "department",
        width: 100,
      },
      {
        Header: "Personnel",
        accessor: "personnel",
        width: 100,
      },
      {
        Header: "Date",
        accessor: "date",
        width: 100,
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
    pdfDoc.save("Transaction_Records.pdf");
  };

// Function to export data as CSV
const exportDataAsCSV = () => {
    const columns = [
      {
        Header: "No.",
        accessor: (row, index) => index + 1,
      },
      {
        Header: "User Name",
        accessor: "name",
      },
      {
        Header: "Department",
        accessor: "department",
      },
      {
        Header: "Personnel",
        accessor: "personnel",
      },
      {
        Header: "Date",
        accessor: "date",
      },
      // ... other columns ...
    ];
  
    // Create CSV header row based on column headers and widths
    let csvContent =
      columns.map((column) => `${column.Header || ''}`).join(",") + "\n";
    csvContent +=
      columns.map((column) => `${column.width || ''}`).join(",") + "\n";
  
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
              return `${item[column.accessor].toDate().toLocaleDateString() || ''}`;
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
    link.download = "Transaction_Records.csv";
  
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

  // Define table columns
  const columns = React.useMemo(
    () => [
      {
        Header: "No.", // Auto-numbering column
        accessor: (row, index) => index + 1, // Calculate row number
      },
      {
        Header: "User Name",
        accessor: "name",
      },
      {
        Header: "Department",
        accessor: "department",
      },
      {
        Header: "Personnel",
        accessor: "personnel",
      },
      {
        Header: "Reason",
        accessor: "reason",
      },
      {
        Header: "Date",
        accessor: "date",
        Cell: ({ value }) => {
          if (value) {
            const date = value.toDate();
            return date.toLocaleDateString();
          } else {
            return "N/A"; // Handle the case where value is null or undefined
          }
        },
      },
      {
        Header: "Status",
        accessor: "status",
      },
      // ... other columns ...
    ],
    []
  );

  useEffect(() => {
    setData(localData);
  }, [localData]);

  // Filter data based on the search query
  const filteredData = data.filter((item) => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Apply filters
  const applyFilters = () => {
    let filteredResult = filteredData;

    if (departmentFilter) {
      filteredResult = filteredResult.filter((item) =>
        item.department.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }
    if (dateFilter) {
      filteredResult = filteredResult.filter(
        (item) =>
          item.date &&
          item.date.toDate().toLocaleDateString().includes(dateFilter)
      );
    }
    if (personnelFilter) {
      filteredResult = filteredResult.filter((item) =>
        item.personnel.toLowerCase().includes(personnelFilter.toLowerCase())
      );
    }
    if (statusFilter) {
      filteredResult = filteredResult.filter((item) =>
        item.status.toLowerCase().includes(statusFilter.toLowerCase())
      );
    }

    return filteredResult;
  };

  // React Table configuration
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable({
      columns,
      data: applyFilters(),
    });

    // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rows.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="container">
        <div className="header">
          <div className="icons">
            <h1>Appointments</h1>
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-name">
              <h1>Admin</h1>
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="search-containers">
          <FaSearch className="search-iconss"></FaSearch>
          <input
            type="text"
            placeholder="Search by Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="filter-containers">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-selects"
            >
              <option value="">Filter by Offices</option>
              <option value="Municipal Mayor's Office">
                Municipal mayor's Office
              </option>
              <option value="Municipal Vice Mayor's Office">
                Municipal Vice Mayor's Office
              </option>
              <option value="Sangguniang Bayan Office">
                Sangguniang Bayan Office
              </option>
              <option value="Municipal Accountant's Office">
                Municipal Accountant's Office
              </option>
              <option value="Municipal Agricultural Office">
                Municipal Agricultural Office
              </option>
              <option value="Municipal Assessor's Office">
                Municipal Assessor's Office
              </option>
              <option value="Municipal Civil Registrar Office">
                Municipal Civil Registrar Office
              </option>
              <option value="Municipal Budget Office">
                Municipal Budget Office
              </option>
              <option value="Municipal Disaster Risk Reduction and Management Office">
                Municipal Disaster Risk Reduction and Management Office
              </option>
              <option value="Municipal Engineering Office">
                Municipal Engineering Office
              </option>
              <option value="Municipal Environment and Natural Resources Office">
                Municipal Environment and Natural Resources Office
              </option>
              <option value="Municipal Health Office">
                Municipal Health Office
              </option>
              <option value="Municipal Human Resource and Management Office">
                Municipal Human Resource and Management Office
              </option>
              <option value="Municipal Planning and Development Office">
                Municipal Planning and Development Office
              </option>
              <option value="Municipal Social Welfare and Development Office">
                Municipal Social Welfare and Development Office
              </option>
              <option value="Municipal Treasurer's Office">
                Municipal Treasurer's Office
              </option>
            </select>
            <input
              type="text"
              placeholder="Filter by Date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-inputs"
            />
            <select
              value={personnelFilter}
              onChange={(e) => setPersonnelFilter(e.target.value)}
              className="filter-selects"
            >
              <option value="">Filter by Personnel</option>
              <option value="Hon. Melanie Abarientos-Garcia">
                Hon. Melanie Abarientos-Garcia
              </option>
              <option value="Hon. Florencia G. Bargo">
                Hon. Florencia G. Bargo
              </option>
              <option value="Mr. Allan Ronquillo">Mr. Allan Ronquillo</option>
              <option value="Ms. Deta P. Gaspar, CPA">
                Ms. Deta P. Gaspar, CPA
              </option>
              <option value="Engr. Alex B. Idanan">Engr. Alex B. Idanan</option>
              <option value="Mr. Elberto R. Adulta">
                Mr. Elberto R. Adulta
              </option>
              <option value="Mr. Ceasar P. Manalo">Mr. Ceasar P. Manalo</option>
              <option value="Mrs. Maria Elinar N. Ilagan">
                Mrs. Maria Elinar N. Ilagan
              </option>
              <option value="Mr. Laurence V. Rojo">Mr. Laurence V. Rojo</option>
              <option value="Engr. Fernando P Lojo Jr.">
                Engr. Fernando P Lojo Jr.
              </option>
              <option value="Dr. Jeffrey James B. Motos">
                Dr. Jeffrey James B. Motos
              </option>
              <option value="Ms. Ma. Glaiza C. Bermudo">
                Ms. Ma. Glaiza C. Bermudo
              </option>
              <option value="Eng. Paz C. Caguimbal">
                Eng. Paz C. Caguimbal
              </option>
              <option value="Ms.Ana C. Mangubat, RSW">
                Ms.Ana C. Mangubat, RSW
              </option>
              <option value="Mr. Dante A. Cadag">Mr. Dante A. Cadag</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-selects"
            >
              <option value="">Filter by Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Disapproved">Disapproved</option>
              {/* Add more options as needed */}
            </select>
            
            <DropdownButton handleExport={handleExport} />

          </div>
        </div>

        {/* Bootstrap Table */}
        <Table striped bordered hover {...getTableProps()} className="custom-table">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
          </tbody>
        </Table>

        {/* Pagination */}
        <Pagination>
          {[...Array(Math.ceil(rows.length / itemsPerPage)).keys()].map((number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => paginate(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    </div>
  );
}

// DropdownButton component
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
