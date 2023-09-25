import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Import Firebase Storage related functions
import { useTable } from "react-table";
import { saveAs } from 'file-saver'; // Import file-saver for downloading
import { FaSearch } from 'react-icons/fa'; // Import icons
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


    // Define table columns
    const columns = React.useMemo(
        () => [
            {
                Header: "No.", // Auto-numbering column
                accessor: (row, index) => index + 1, // Calculate row number
            },
            {
                Header: "Childname",
                accessor: "childname",
            },
            {
                Header: "Birthdate",
                accessor: "c_birthdate",
            },
            {
                Header: "Birth Place",
                accessor: "c_birthplace",
            },
            {
                Header: "Sex",
                accessor: "c_sex",
            },
            {
                Header: "Type of Birth",
                accessor: "c_typeofbirth",
            },
            {
                Header: "Weight",
                accessor: "c_weight",
            },
            {
                Header: "Birth Order",
                accessor: "c_birthorder",
            },
            {
                Header: "Mother's Name",
                accessor: "m_name",
            },
            {
                Header: "Mother's Age",
                accessor: "m_age",
            },
            {
                Header: "Mother's Occupation",
                accessor: "m_occur",
            },
            {
                Header: "Mother's Citizenship",
                accessor: "m_citizenship",
            },
            {
                Header: "Mother's Religion",
                accessor: "m_religion",
            },
            {
                Header: "Mother's Total Childern",
                accessor: "m_totchild",
            },
            {
                Header: "Father's Name",
                accessor: "f_name",
            },
            {
                Header: "Father's Age",
                accessor: "f_age",
            },
            {
                Header: "Father's Occupation",
                accessor: "f_occur",
            },
            {
                Header: "Father's Citizenship",
                accessor: "f_citizenship",
            },
            {
                Header: "Father's Religion",
                accessor: "f_religion",
            },
            {
                Header: "Place of Marriage",
                accessor: "f_placemarried",
            },
            {
                Header: "Birth Attendant",
                accessor: "attendant",
            },
            {
                Header: "Proof of Payment",
                accessor: "payment", // Use the property that holds the image URL
                Cell: ({ value }) => (
                    <img src={value} alt="Image" style={{ width: "150px", height: "auto" }} />
                ),
            },
            {
                Header: "Status",
                accessor: "status",
            },
        ],
        []
    );

    // Filter data based on the search query
    const filteredData = data.filter((item) => {
        return item.childname.toLowerCase().includes(searchQuery.toLowerCase());
    });


    // React Table configuration
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data: filteredData, // Use the filtered data
    });

    return (
        <div>
            <div className="sidebar">
                <Sidebar />
            </div>
            <div className="container">
                <h1>Transaction Records</h1>
                {/* Search input */}
                <div className="search-container">
                    <FaSearch className="search-icon"></FaSearch>
                    <input
                        type="text"
                        placeholder="Search by Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                <button className="btn" onClick={exportDataAsCSV}>Export as CSV</button>

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
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;