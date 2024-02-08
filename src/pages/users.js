import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  doc,
  where,
} from "firebase/firestore";
import { Table, Pagination, Button, Modal, Form } from "react-bootstrap";
import { useTable } from "react-table";
import { FaSearch } from "react-icons/fa"; // Import icons
import { saveAs } from "file-saver"; // Import file-saver for downloading
import "./transactions.css";
import Sidebar from "../components/sidebar";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [newYear, setNewYear] = useState("");

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
    const matchesSearch = item.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesBarangay =
      !selectedBarangayFilter || item.barangay === selectedBarangayFilter;

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

  // State for web users
  const [webUserData, setWebUserData] = useState([]);
  const [webUserSearchQuery, setWebUserSearchQuery] = useState("");
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    department: "",
    storedPassword: "",
  });

  useEffect(() => {
    fetchWebUserData();
  }, []);

  // Define localWebUserData state
  const [localWebUserData, setLocalWebUserData] = useState([]);

  // Function to fetch web users data from Firestore
  const fetchWebUserData = async () => {
    try {
      const snapshot = await collection(firestore, "web_users");
      const querySnapshot = await getDocs(snapshot);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWebUserData(items);
      setLocalWebUserData(items); // Initialize localWebUserData with the fetched data
    } catch (error) {
      console.error("Error fetching web users data: ", error);
    }
  };

  // Function to handle office filter change for web users
  const handleWebUsersOfficeFilterChange = (e) => {
    const value = e.target.value;
    setSelectedOfficeFilter(value);
    if (value === "") {
      // If no office filter selected, reset to original data
      setWebUserData(localWebUserData);
    } else {
      filterWebUserData(webUserSearchQuery, value); // Filter data based on search query and selected office
    }
  };

  // Function to handle search for web users
  const handleWebUsersSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setWebUserSearchQuery(value);
    if (value === "") {
      // If search query is empty, reset to original data
      setWebUserData(localWebUserData);
    } else {
      filterWebUserData(value, selectedOfficeFilter); // Filter data based on search query and selected office
    }
  };

  // Filter web users data based on search query and office filter
  const filterWebUserData = (searchQuery, officeFilter) => {
    const filteredData = webUserData.filter((item) => {
      const matchesSearch =
        item.email.toLowerCase().includes(searchQuery) ||
        item.firstName.toLowerCase().includes(searchQuery) ||
        item.lastName.toLowerCase().includes(searchQuery);
      const matchesOffice = !officeFilter || item.department === officeFilter;
      return matchesSearch && matchesOffice;
    });
    setWebUserData(filteredData);
  };

  const handleAddUser = async () => {
    if (!isValidEmail(newUser.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const docRef = await addDoc(collection(firestore, "web_users"), newUser);
      const newUserWithId = { id: docRef.id, ...newUser };

      setLocalData((prevData) => [...prevData, newUserWithId]);

      const storedPassword = generatePassword();
      sendPassword(newUser.email, storedPassword);

      setShowModal(false);
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const generatePassword = () => {
    const length = 8;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let storedPassword = "";
    for (let i = 0; i < length; i++) {
      storedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return storedPassword;
  };

  const sendPassword = async (email, storedPassword) => {
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, storedPassword);
      // Send email with password
      alert(`Password generated and sent to ${email}.`);
    } catch (error) {
      console.error("Error sending password: ", error);
      alert("Failed to send password. Please try again later.");
    }
  };

  const handleDeleteUser = async (email) => {
    setUserToDelete(email);
    setShowConfirmationModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const userSnapshot = await getDocs(
        query(
          collection(firestore, "web_users"),
          where("email", "==", userToDelete)
        )
      );

      if (!userSnapshot.empty) {
        await deleteDoc(doc(firestore, "web_users", userSnapshot.docs[0].id));
        setWebUserData((prevUsers) =>
          prevUsers.filter((user) => user.email !== userToDelete)
        );
        setShowConfirmationModal(false);
      }
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  const openAddYearModal = () => {
    setIsAddYearModalOpen(true);
  };

  const closeAddYearModal = () => {
    setIsAddYearModalOpen(false);
    setNewYear(""); // Clear input field when modal is closed
  };

  const handleNewYearChange = (event) => {
    setNewYear(event.target.value);
  };

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

        <div style={{ marginTop: "90px" }}>
          <h2>Mobile Users</h2>
        </div>

        <div className="search-contain">
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

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter First Name"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                  className="form-control"
                />
              </Form.Group>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Last name"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="department">
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Department Office"
                  value={newUser.department}
                  onChange={(e) =>
                    setNewUser({ ...newUser, department: e.target.value })
                  }
                  className="form-control"
                />
              </Form.Group>
              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={newUser.storedPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser, storedPassword: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button className="modal-btn" variant="secondary" onClick={() => setShowModal(false)} >
              Cancel
            </Button>
            <Button className="modal-btn" variant="primary" onClick={handleAddUser}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showConfirmationModal}
          onHide={() => setShowConfirmationModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete the user with email: {userToDelete}?
          </Modal.Body>
          <Modal.Footer>
            <Button className="modal-btn"
              variant="secondary"
              onClick={() => setShowConfirmationModal(false)}
            >
              Cancel
            </Button>
            <Button className="modal-btn" variant="danger" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Web User Table */}
        <div className="mt-4">
          <h2>Web Users</h2>

          <div className="search-contain">
            <FaSearch className="search-iconss"></FaSearch>
            <input
              type="text"
              placeholder="Search by Name"
              value={webUserSearchQuery}
              onChange={handleWebUsersSearch}
              className="search-input"
            />

            <div className="filter-containers">
              <select
                value={selectedOfficeFilter}
                onChange={handleWebUsersOfficeFilterChange}
                className="filter-selects"
              >
                <option value="">Filter Offices</option>
                <option value="HR Department">HR Department</option>
                <option value="Civil Registrar">Civil Registrar</option>
              </select>
            </div>

            <Button
              className="add"
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              Add User
            </Button>
          </div>

          <Table striped bordered hover className="custom-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Email</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webUserData.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No matching records found.
                  </td>
                </tr>
              )}
              {webUserData.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.email}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.department}</td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(user.email)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
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