import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Import Firebase Storage related functions
import { useTable } from "react-table";
import { saveAs } from "file-saver"; // Import file-saver for downloading
import { FaSearch } from "react-icons/fa"; // Import icons
import "./appointment.css";
import Sidebar from "../components/sidebar";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import { Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import { Link, useLocation, useHistory } from "react-router-dom";
import useAuth from "../components/useAuth";

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
  const [selectedBarangayFilter, setSelectedBarangayFilter] = useState("");
  const [selectedServiceTypeFilter, setSelectedServiceTypeFilter] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("");

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

  const collectionTypeMap = {
    birth_reg: "Birth Registration",
    marriage_reg: "Marriage Registration",
    marriageCert: "Copy of Marriage Certificate",
    death_reg: "Death Registration",
    deathCert: "Copy of Death Certificate",
    appointments: "Appointments",
    job: "Job Application",
  };

  const fetchData = async () => {
    try {
      const collections = [
        "birth_reg",
        "marriageCert",
        "deathCert",
        "appointments",
        "job",
        "marriage_reg",
        "death_reg",
      ];
      let allData = [];

      for (const collectionName of collections) {
        const snapshot = await collection(firestore, collectionName);

        console.log(`Fetching data from ${collectionName}...`);
        const querySnapshot = await getDocs(snapshot);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          collectionType: collectionTypeMap[collectionName],
          createdAt: doc.data().createdAt || { seconds: 0 },
          ...doc.data(),
        }));

        // Fetch image URLs from Firebase Storage and add them to the data
        for (const item of items) {
          if (item.imagePath) {
            const imageUrl = await getDownloadURL(ref(storage, item.imagePath));
            item.imageUrl = imageUrl;
          }

          if (!item.createdAt) {
            console.error(
              `Missing createdAt field in document with id: ${item.id}`
            );
            continue;
          }
        }

        // Filter items based on selectedYearFilter
        if (selectedYearFilter !== "") {
          allData = allData.concat(
            items.filter((item) => {
              return (
                item.createdAt &&
                item.createdAt.toDate &&
                typeof item.createdAt.toDate === "function" &&
                item.createdAt.toDate().getFullYear().toString() ===
                  selectedYearFilter
              );
            })
          );
        } else {
          allData = allData.concat(items);
        }
      }

      // Sort the data based on createdAt timestamp in descending order
      allData.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      setData(allData);
    } catch (error) {
      console.error("Error fetching data: ", error);
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
        Header: "Service Type",
        accessor: "collectionType",
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
    pdfDoc.save("All Records.pdf");
  };

  // Function to export data as CSV
  const exportFilteredDataAsCSV = () => {
    const columns = [
      {
        Header: "Name of Applicant",
        accessor: "userName",
      },
      {
        Header: "Service Type",
        accessor: "collectionType", // New column for service or collection type
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
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => <button onClick={() => openModal(row)}>View</button>,
      },
      // ... other columns ...
    ];

    // Create CSV header row based on column headers and widths
    let csvContent =
      columns.map((column) => `${column.Header || ""}`).join(",") + "\n";
    csvContent +=
      columns.map((column) => `${column.width || ""}`).join(",") + "\n";

    // Add data rows to CSV
    filteredData.forEach((item) => {
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
    link.download = "All Records.csv";

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
      exportFilteredDataAsCSV();
    }
    // Add more conditions for other export types if needed
  };

  const openModal = async (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  const departmentAccessor = (row) => {
    // Check the service type and return the corresponding department
    if (
      row.collectionType === "Birth Registration" ||
      row.collectionType === "Marriage Registration" ||
      row.collectionType === "Death Registration" ||
      row.collectionType === "Copy of Marriage Certificate" ||
      row.collectionType === "Copy of Death Certificate"
    ) {
      return "Civil Registrar";
    } else if (row.collectionType === "Job Application" || row.collectionType === "Appointments") {
      return "HR Department";
    } else {
      return "Unknown";
    }
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
        Header: "Service Type",
        accessor: "collectionType", // New column for service or collection type
      },
      {
        Header: "Department",
        accessor: departmentAccessor, // Use the new accessor for Department
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

  // Add this function definition along with other filter change functions
  const handleDepartmentFilterChange = (event) => {
    setSelectedDepartmentFilter(event.target.value);
  };

  const handleBarangayFilterChange = (event) => {
    setSelectedBarangayFilter(event.target.value);
  };

  const handleServiceTypeFilterChange = (event) => {
    setSelectedServiceTypeFilter(event.target.value);
  };

  const filteredData = data.filter((item) => {
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

    const lowerCaseSearchQuery = searchQuery.toLowerCase();
    const lowerCaseStatusFilter = selectedStatusFilter.toLowerCase();
    const lowerCaseBarangayFilter = selectedBarangayFilter.toLowerCase();
    const lowerCaseServiceTypeFilter = selectedServiceTypeFilter.toLowerCase();

    return (
      item.userName &&
      item.userName.toLowerCase().includes(lowerCaseSearchQuery) &&
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
        ? item.status &&
          item.status.toLowerCase().includes(lowerCaseStatusFilter)
        : true) &&
      (selectedBarangayFilter !== ""
        ? item.userBarangay &&
          item.userBarangay.toLowerCase() === lowerCaseBarangayFilter
        : true) &&
      (selectedServiceTypeFilter !== ""
        ? item.collectionType &&
          item.collectionType.toLowerCase() === lowerCaseServiceTypeFilter
        : true) &&
      (selectedDepartmentFilter !== ""
        ? departmentAccessor(item) === selectedDepartmentFilter
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

  const handleMonthFilterChange = (event) => {
    setSelectedMonthFilter(event.target.value);
  };

  const handleDayFilterChange = (event) => {
    setSelectedDayFilter(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setSelectedStatusFilter(event.target.value);
  };

  const [isYearInputVisible, setIsYearInputVisible] = useState(false);
  const [customYear, setCustomYear] = useState("");

  // Function to toggle visibility of custom year input
  const handleToggleYearInput = () => {
    setIsYearInputVisible(!isYearInputVisible);
  };

  // Function to handle change in custom year input
  const handleCustomYearChange = (event) => {
    setCustomYear(event.target.value);
  };

  const storedYears = localStorage.getItem("availableYears");
  const defaultYears = ["2024", "2023"];
  const initialAvailableYears = storedYears
    ? JSON.parse(storedYears)
    : defaultYears;
  const [availableYears, setAvailableYears] = useState(initialAvailableYears);

  const handleAddCustomYear = () => {
    // You may want to perform validation here to ensure the input is a valid year
    const updatedYears = [...availableYears, customYear].sort(
      (a, b) => parseInt(b) - parseInt(a)
    );
    setAvailableYears(updatedYears);

    // Save the updated years to local storage
    localStorage.setItem("availableYears", JSON.stringify(updatedYears));

    setSelectedYearFilter(customYear);
    setIsYearInputVisible(false);
  };

  const handleYearFilterChange = (event) => {
    const value = event.target.value;
    setSelectedYearFilter(value);
    if (value === "addYear") {
      setIsYearInputVisible(true);
    }
  };

  return (
    <div>
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="container">
        <div className="headers">
          <div className="icons">
            <div style={{marginTop: "-20px"}}><h1>Reports</h1></div>
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-names">
              <h2>{userEmail}</h2>
            </div>
          </div>
        </div>


        <div className="title">
          <h1 style={{textAlign: "center"}}>All Records</h1>
        </div>

        <div className="searchess">
          <FaSearch className="search-iconn"></FaSearch>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-inputt"
          />
          <div className="filter-container" style={{marginLeft: "30px", marginRight: "-40px"}}>
          <label>Filter:</label>
          <select
            value={selectedYearFilter}
            onChange={handleYearFilterChange}
            className="filter"
          >
            <option value="">Year</option>
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

            <select
              value={selectedBarangayFilter}
              onChange={handleBarangayFilterChange}
              className="filter"
            >
              <option value="">Barangays</option>
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

            <select
              value={selectedServiceTypeFilter}
              onChange={handleServiceTypeFilterChange}
              className="filter"
            >
              <option value="">Service Type</option>
              <option value="Appointments">Appointments</option>
              <option value="Birth Registration">Birth Registration</option>
              <option value="Copy of Marriage Certificate">
                Copy of Marriage Certificate
              </option>
              <option value="Marriage Registration">
                Marriage Registration
              </option>
              <option value="Copy of Death Certificate">
                Copy of Death Certificate
              </option>
              <option value="Death Registration">Death Registration</option>
              <option value="Job Application">Job Application</option>
              {/* Add options for other service types */}
            </select>

            <select
              value={selectedDepartmentFilter}
              onChange={handleDepartmentFilterChange}
              className="filter"
            >
              <option value="">Department</option>
              <option value="Civil Registrar">Civil Registrar</option>
              <option value="HR Department">HR Department</option>
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
    </div>
  </div>
);

export default App;
