import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useTable } from "react-table";
import { FaSearch } from "react-icons/fa"; // Import icons
import { saveAs } from "file-saver"; // Import file-saver for downloading
import "./transactions.css";
import Sidebar from "../components/sidebar";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import { Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";

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
  const [selectedBarangayFilter, setSelectedBarangayFilter] = useState("");

  // Function to fetch data from Firestore
  const fetchData = async () => {
    try {
      const snapshot = await collection(firestore, "users");
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

  const handleBarangayFilterChange = (e) => {
    setSelectedBarangayFilter(e.target.value);
  };

  // PDF File
  const exportDataAsPDF = () => {
    const columns = [
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "First Name",
        accessor: "firstName",
      },
      {
        Header: "Last Name",
        accessor: "lastName",
      },
      {
        Header: "Barangay",
        accessor: "barangay",
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
    pdfDoc.save("Users_Records.pdf");
  };

  // Function to export data as CSV
  const exportDataAsCSV = () => {
    const columns = [
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "First Name",
        accessor: "firstName",
      },
      {
        Header: "Last Name",
        accessor: "lastName",
      },
      {
        Header: "Barangay",
        accessor: "barangay",
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
    link.download = "Users_Records.csv";

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
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "First Name",
        accessor: "firstName",
      },
      {
        Header: "Last Name",
        accessor: "lastName",
      },
      {
        Header: "Barangay",
        accessor: "barangay",
      },
    ],
    []
  );

  useEffect(() => {
    setData(localData);
  }, [localData]);

  // Filter data based on the search query
  const filteredData = data.filter((item) => {
    const matchesSearch = item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBarangay = !selectedBarangayFilter || item.barangay === selectedBarangayFilter;
    
    return matchesSearch && matchesBarangay;
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

  return (
    <div>
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="container">
        <div className="header">
          <div className="icons">
            <h1>Users</h1>
            <img src={notification} alt="Notification.png" className="notifs" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-name">
              <h1>Admin</h1>
            </div>
          </div>
        </div>

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
          {/* Filter dropdown for Barangay */}
          <select
            value={selectedBarangayFilter}
            onChange={handleBarangayFilterChange}
            className="filter-selects"
          >
            <option value="">Filter Barangays</option>
            <option value="Bagong Silang">Bagong Silang</option>
            <option value="Bucal">Bucal</option>
            <option value="Cabasag">Cabasag</option>
            <option value="Comadaycaday">Comadaycaday</option>
            <option value="Comadogcadog">Comadogcadog</option>
            <option value="Domagondong">Domagondong</option>
            <option value="Kinalangan">Kinalangan</option>
            <option value="Mabini">Mabini</option>
            <option value="Magais 1">Magais 1</option>
            <option value="Magais 2">Magais 2</option>
            <option value="Mansalaya">Mansalaya</option>
            <option value="Nagkalit">Nagkalit</option>
            <option value="Palaspas">Palaspas</option>
            <option value="Pamplona">Pamplona</option>
            <option value="Pasay">Pasay</option>
            <option value="Peñafrancia">Peñafrancia</option>
            <option value="Pinagdapian">Pinagdapian</option>
            <option value="Pinugusan">Pinugusan</option>
            <option value="Pob. Zone 1">Pob. Zone 1</option>
            <option value="Pob. Zone 2">Pob. Zone 2</option>
            <option value="Pob. Zone 3">Pob. Zone 3</option>
            <option value="Sabang">Sabang</option>
            <option value="Salvaciom">Salvacion</option>
            <option value="San Juan">San Juan</option>
            <option value="San Pablo">San Pablo</option>
            <option value="Sinuknipan 1">Sinuknipan 1</option>
            <option value="Sinuknipan 2">Sinuknipan 2</option>
            <option value="Sta. Rita 1">Sta. Rita 1</option>
            <option value="Sta. Rita 2">Sta. Rita 2</option>
            <option value="Sugsugin">Sugsugin</option>
            <option value="Tabion">Tabion</option>
            <option value="Tomagoktok">Tomagoktok</option>
            {/* Add more options for other barangays */}
          </select>
          </div>

          {/* DropdownButton component for export */}
          <DropdownButton handleExport={handleExport} />
        </div>

        {/* Bootstrap Table */}
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

        {/* Pagination */}
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
