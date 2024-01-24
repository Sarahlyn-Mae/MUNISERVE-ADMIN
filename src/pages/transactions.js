import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import Chart from "react-apexcharts";
import ReactApexChart from "react-apexcharts";
import "apexcharts";
import "./transactions.css";
import Sidebar from "../components/sidebar";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import "react-datepicker/dist/react-datepicker.css";
import useAuth from "../components/useAuth";
import axios from "axios";
import ApexCharts from "react-apexcharts";

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
const db = getFirestore(app);

const serviceCollections = [
  "birth_reg",
  "marriageCert",
  "deathCert",
  "job",
  "businessPermit",
  "appointments",
  "marriage_reg",
  "death_reg",
];

function App() {
  const [dayTransactions, setDayTransactions] = useState(0);
  const [weekTransactions, setWeekTransactions] = useState(0);
  const [monthTransactions, setMonthTransactions] = useState(0);
  const [yearTransactions, setYearTransactions] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyStatusData, setMonthlyStatusData] = useState([]);
  const [barangayData, setBarangayData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlyDataForBarangay, setYearlyDataForBarangay] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [monthlyDataForBarangay, setMonthlyDataForBarangay] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [webUsersCount, setWebUsersCount] = useState(0);
  const [serviceTypeData, setServiceTypeData] = useState([]);
  const [recordCounts, setRecordCounts] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [noRecordsMessage, setNoRecordsMessage] = useState("");
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");

  const [selectedFilter, setSelectedFilter] = useState({
    barangay: null,
    year: new Date().getFullYear(),
    serviceType: null,
  });

  useEffect(() => {
    const fetchUserEmail = () => {
      if (user) {
        const email = user.email;
        const truncatedEmail =
          email.length > 7 ? `${email.substring(0, 7)}...` : email;
        setUserEmail(truncatedEmail);
      }
    };

    fetchUserEmail();
  }, [user]);

  useEffect(() => {
    // Fetch and count transactions for the day
    fetchTransactions("day");

    // Fetch and count transactions for the week
    fetchTransactions("week");

    // Fetch and count transactions for the month
    fetchTransactions("month");

    // Fetch and count transactions for the year
    fetchTransactions("year");
    fetchUserCount();
    fetchYearlyDataForBarangay();
    fetchRecordCounts();
  }, [selectedBarangay, serviceTypeData, selectedYear, selectedFilter, selectedMonth]);

  const fetchUserCount = async () => {
    try {
      // Assuming you have both 'web_users' and 'users' collections in your Firebase database
      const webUsersQuery = query(collection(db, "web_users"));
      const usersQuery = query(collection(db, "users"));

      const [webUsersSnapshot, usersSnapshot] = await Promise.all([
        getDocs(webUsersQuery),
        getDocs(usersQuery),
      ]);

      const webUsersCount = webUsersSnapshot.size;
      const usersCount = usersSnapshot.size;

      setWebUsersCount(webUsersCount);
      setUsersCount(usersCount);
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  const fetchTransactions = async (timeInterval, customDate) => {
    const currentDate = customDate || new Date();
    let startDate;
    let count; // Declare count variable

    switch (timeInterval) {
      case "day":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );
        break;
      case "week":
        startDate = getStartOfWeek(currentDate);
        break;
      case "month":
        startDate = getStartOfMonth(currentDate);
        break;
      case "year":
        startDate = getStartOfYear(currentDate);
        break;
      default:
        startDate = currentDate;
    }

    const transactions = await getTransactions(startDate, currentDate);
    count = transactions.length; // Assign a value to count
    updateTransactionCount(timeInterval, count);
  };

  const getStartOfWeek = (date) => {
    const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - dayOfWeek); // Move to the start of the current week
    return startDate;
  };

  const getStartOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getStartOfYear = (date) => {
    return new Date(date.getFullYear(), 0, 1);
  };

  const getTransactions = async (startDate, endDate) => {
    const birthRegQuery = query(
      collection(db, "birth_reg"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    );
    const marriageCertQuery = query(
      collection(db, "marriageCert"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    );
    const deathCertQuery = query(
      collection(db, "deathCert"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    );
    const jobQuery = query(
      collection(db, "job"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    );
    const businessPermitQuery = query(
      collection(db, "businessPermit"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    );
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    );

    const birthRegSnapshot = await getDocs(birthRegQuery);
    const marriageCertSnapshot = await getDocs(marriageCertQuery);
    const deathCertSnapshot = await getDocs(deathCertQuery);
    const jobSnapshot = await getDocs(jobQuery);
    const businessPermitSnapshot = await getDocs(businessPermitQuery);
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    const birthRegTransactions = birthRegSnapshot.docs.map((doc) => doc.data());
    const marriageCertTransactions = marriageCertSnapshot.docs.map((doc) =>
      doc.data()
    );
    const deathCertTransactions = deathCertSnapshot.docs.map((doc) =>
      doc.data()
    );
    const jobTransactions = jobSnapshot.docs.map((doc) => doc.data());
    const businessPermitTransactions = businessPermitSnapshot.docs.map((doc) =>
      doc.data()
    );
    const appointmentsTransaction = appointmentsSnapshot.docs.map((doc) =>
      doc.data()
    );

    const allTransactions = [
      ...birthRegTransactions,
      ...marriageCertTransactions,
      ...deathCertTransactions,
      ...jobTransactions,
      ...businessPermitTransactions,
      ...appointmentsTransaction,
    ];

    return allTransactions;
  };

  const updateTransactionCount = (timeInterval, count) => {
    switch (timeInterval) {
      case "day":
        setDayTransactions(count);
        break;
      case "week":
        setWeekTransactions(count);
        break;
      case "month":
        setMonthTransactions(count);
        break;
      case "year":
        setYearTransactions(count);
        break;
      default:
        break;
    }
  };

  const chartData = {
    day: {
      series: [dayTransactions],
      options: {
        chart: {
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 360,
            hollow: {
              margin: 5,
              size: "50%",
              background: "transparent",
              image: undefined,
              imageOffsetX: 0,
              imageOffsetY: 0,
              position: "front",
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: "10px",
                fontWeight: "light",
                color: "#000",
                offsetY: -5,
              },
              value: {
                show: true,
                offsetY: 5,
                color: "blue",
                fontSize: "25px",
                fontWeight: "bold",
                formatter: function (val) {
                  return val;
                },
              },
            },
          },
        },
        fill: {
          colors: ["#F2233B"],
        },
        labels: ["Today"],
      },
    },
    week: {
      series: [weekTransactions],
      options: {
        chart: {
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 360,
            hollow: {
              margin: 5,
              size: "50%",
              background: "transparent",
              image: undefined,
              imageOffsetX: 0,
              imageOffsetY: 0,
              position: "front",
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: "10px",
                fontWeight: "light",
                color: "#000",
                offsetY: -5,
              },
              value: {
                show: true,
                offsetY: 5,
                color: "blue",
                fontSize: "25px",
                fontWeight: "bold",
                formatter: function (val) {
                  return val;
                },
              },
            },
          },
        },
        fill: {
          colors: ["#4B07C0"],
        },
        labels: ["This Week"],
      },
    },
    month: {
      series: [monthTransactions],
      options: {
        chart: {
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 360,
            hollow: {
              margin: 5,
              size: "50%",
              background: "transparent",
              image: undefined,
              imageOffsetX: 0,
              imageOffsetY: 0,
              position: "front",
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: "10px",
                fontWeight: "light",
                color: "#000",
                offsetY: -5,
              },
              value: {
                show: true,
                offsetY: 5,
                color: "blue",
                fontSize: "25px",
                fontWeight: "bold",
                formatter: function (val) {
                  return val;
                },
              },
            },
          },
        },
        fill: {
          colors: ["#FF7247"], // Change the color of the radial bar
        },
        labels: ["This Month"],
      },
    },
    year: {
      series: [yearTransactions],
      options: {
        chart: {
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 360,
            hollow: {
              margin: 5,
              size: "50%",
              background: "transparent",
              image: undefined,
              imageOffsetX: 0,
              imageOffsetY: 0,
              position: "front",
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: "10px",
                fontWeight: "light",
                color: "#000",
                offsetY: -5,
              },
              value: {
                show: true,
                offsetY: 5,
                color: "blue",
                fontSize: "25px",
                fontWeight: "bold",
                formatter: function (val) {
                  return val;
                },
              },
            },
          },
        },
        fill: {
          colors: ["#00C853"], // Change the color of the radial bar for the year
        },
        labels: ["This Year"],
      },
    },
    selectedDate: {
      series: [], // Fetch the transactions for the selected date and get the count
      options: {
        // Radial bar options for the selected date
      },
    },
    users: {
      series: [usersCount],
      options: {
        chart: {
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 360,
            hollow: {
              margin: 5,
              size: "50%",
              background: "transparent",
              image: undefined,
              imageOffsetX: 0,
              imageOffsetY: 0,
              position: "front",
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: "10px",
                fontWeight: "light",
                color: "#000",
                offsetY: -5,
              },
              value: {
                show: true,
                offsetY: 5,
                color: "blue",
                fontSize: "25px",
                fontWeight: "bold",
                formatter: function (val) {
                  return val;
                },
              },
            },
          },
        },
        fill: {
          colors: ["#2196F3"],
        },
        labels: ["Residents"],
      },
    },
    webUsers: {
      series: [webUsersCount],
      options: {
        chart: {
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 360,
            hollow: {
              margin: 5,
              size: "50%",
              background: "transparent",
              image: undefined,
              imageOffsetX: 0,
              imageOffsetY: 0,
              position: "front",
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: "10px",
                fontWeight: "light",
                color: "#000",
                offsetY: -5,
              },
              value: {
                show: true,
                offsetY: 5,
                color: "blue",
                fontSize: "25px",
                fontWeight: "bold",
                formatter: function (val) {
                  return val;
                },
              },
            },
          },
        },
        fill: {
          colors: ["#2196F3"],
        },
        labels: ["Web Users"],
      },
    },
  };

  const fetchYearlyDataForBarangay = async () => {
    const yearlyData = await getYearlyDataForBarangay(
      selectedFilter.year,
      selectedFilter.barangay
    );
    setYearlyDataForBarangay(yearlyData);
  };

  const getYearlyDataForBarangay = async (selectedYear, selectedBarangay) => {
    const currentYear = new Date().getFullYear();

    const barangayQuery = selectedBarangay
      ? where("userBarangay", "==", selectedBarangay)
      : [];

    const collectionQueries = serviceCollections.map((service) =>
      query(
        collection(db, service),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${selectedYear}-01-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${selectedYear}-12-31`))
        ),
        ...barangayQuery
      )
    );

    try {
      // Execute all queries concurrently
      const queryResults = await Promise.all(collectionQueries.map(getDocs));

      // Extract data from query results
      const serviceData = queryResults.map((snapshot, index) =>
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            userBarangay: data.userBarangay,
            serviceType: serviceCollections[index],
          };
        })
      );

      // Flatten the array of arrays and count occurrences of each combination of barangay and service type
      const barangayServiceCounts = serviceData.flat().reduce((acc, item) => {
        const key = `${item.userBarangay}_${item.serviceType}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Create an array with objects for each barangay and counts for each service type
      const yearlyData = Object.keys(barangayServiceCounts).reduce(
        (acc, key) => {
          const [barangay, serviceType] = key.split("_");
          const existingData = acc.find((item) => item.barangay === barangay);
          if (existingData) {
            existingData[serviceType] = barangayServiceCounts[key];
          } else {
            const newData = {
              barangay,
              [serviceType]: barangayServiceCounts[key],
            };
            acc.push(newData);
          }
          return acc;
        },
        []
      );

      return yearlyData;
    } catch (error) {
      console.error("Error fetching yearly data for barangay:", error);
      return [];
    }
  };

  const handleBarangayChange = (selectedBarangay) => {
    setSelectedFilter((prevFilter) => ({
      ...prevFilter,
      barangay: selectedBarangay,
    }));
  };

  const handleYearChange = (selectedYear) => {
    setSelectedFilter((prevFilter) => ({
      ...prevFilter,
      year: selectedYear,
    }));
  };

  const handleServiceTypeChange = (selectedServiceType) => {
    setSelectedFilter((prevFilter) => ({
      ...prevFilter,
      serviceType: selectedServiceType,
    }));
  };

  const fetchRecordCounts = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const startOfMonth = new Date(`${currentYear}-${selectedMonth}-01`);
      const endOfMonth = new Date(
        currentYear,
        selectedMonth,
        0,
        23,
        59,
        59,
        999
      );

      const appointmentsCollection = collection(db, "appointments");
      const birthRegCollection = collection(db, "birth_reg");
      const marriageCertCollection = collection(db, "marriageCert");
      const deathCertCollection = collection(db, "deathCert");
      const jobCollection = collection(db, "job");
      const businessPermitCollection = collection(db, "businessPermit");

      const [
        appointmentsSnapshot,
        birthRegSnapshot,
        marriageCertSnapshot,
        deathCertSnapshot,
        jobSnapshot,
        businessPermitSnapshot,
      ] = await Promise.all([
        getDocs(
          query(
            appointmentsCollection,
            where("createdAt", ">=", startOfMonth),
            where("createdAt", "<=", endOfMonth)
          )
        ),
        getDocs(
          query(
            birthRegCollection,
            where("createdAt", ">=", startOfMonth),
            where("createdAt", "<=", endOfMonth)
          )
        ),
        getDocs(
          query(
            marriageCertCollection,
            where("createdAt", ">=", startOfMonth),
            where("createdAt", "<=", endOfMonth)
          )
        ),
        getDocs(
          query(
            deathCertCollection,
            where("createdAt", ">=", startOfMonth),
            where("createdAt", "<=", endOfMonth)
          )
        ),
        getDocs(
          query(
            jobCollection,
            where("createdAt", ">=", startOfMonth),
            where("createdAt", "<=", endOfMonth)
          )
        ),
        getDocs(
          query(
            businessPermitCollection,
            where("createdAt", ">=", startOfMonth),
            where("createdAt", "<=", endOfMonth)
          )
        ),
      ]);

      const counts = {
        appointments: appointmentsSnapshot.size,
        birthRegistration: birthRegSnapshot.size,
        marriageCertificate: marriageCertSnapshot.size,
        deathCertificate: deathCertSnapshot.size,
        jobApplication: jobSnapshot.size,
        businessPermit: businessPermitSnapshot.size,
      };

      console.log("Record Counts:", counts);

      setRecordCounts(counts);
      setNoRecordsMessage(""); // Reset the message when records are fetched

    } catch (error) {
      console.error("Error fetching record counts from Firebase:", error);
      setNoRecordsMessage("No records found for this month."); // Set the message when an error occurs or no records are found
      // Handle error here
    }
  };

  useEffect(() => {
    fetchRecordCounts();
  }, [selectedMonth]);

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
            <Link to="/birthReg" className="link">
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

        <div className="reports">
          <div className="report">
            <div className="day">
              <Chart
                options={chartData.day.options}
                series={chartData.day.series}
                type="radialBar"
                height="200"
              />
            </div>
            <div className="week">
              <Chart
                options={chartData.week.options}
                series={chartData.week.series}
                type="radialBar"
                height="200"
              />
            </div>
            <div className="month">
              <Chart
                options={chartData.month.options}
                series={chartData.month.series}
                type="radialBar"
                height="200"
              />
            </div>
            <div className="year">
              <Chart
                options={chartData.year.options}
                series={chartData.year.series}
                type="radialBar"
                height="200"
              />
            </div>
            <div className="users-chart">
              <Chart
                options={chartData.users.options}
                series={chartData.users.series}
                type="radialBar"
                height="200"
              />
            </div>
            <div className="users-chart">
              <Chart
                options={chartData.webUsers.options}
                series={chartData.webUsers.series}
                type="radialBar"
                height="200"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;