// BarangayTable.jsx
import React, { useEffect, useState } from "react";
import { Table, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

const BarangayTable = ({ selectedBarangay  }) => {
    const [tableData, setTableData] = useState([]);
  
    useEffect(() => {
        const fetchData = async () => {
          try {
            const q = query(collection(firestore, 'birth_reg'), where('userBarangay', '==', selectedBarangay));
            const snapshot = await getDocs(q);
    
            const data = snapshot.docs.map((doc) => doc.data());
            setTableData(data);
          } catch (error) {
            console.error('Error fetching data: ', error);
          }
        };
    
        if (selectedBarangay) {
          fetchData();
        }
      }, [firestore, selectedBarangay]);

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
        Header: "Barangay",
        accessor: "userBarangay",
      },
      {
        Header: "Date",
        accessor: "createdAt",
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <Table striped bordered hover>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.Header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, columnIndex) => (
                <td key={columnIndex}>{row[column.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination>
        {[...Array(Math.ceil(tableData.length / itemsPerPage)).keys()].map(
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
  );
};

export default BarangayTable;
