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
import axios from 'axios';
import ApexCharts from 'react-apexcharts';

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
  const [userCount, setUserCount] = useState(0);
  const [serviceTypeData, setServiceTypeData] = useState([]);

  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");

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
  }, [selectedBarangay, serviceTypeData, selectedYear]);

  const fetchUserCount = async () => {
    try {
      // Assuming you have a 'users' collection in your Firebase database
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      const usersCount = usersSnapshot.size; // Get the number of documents in the collection
      setUserCount(usersCount);
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
      series: [userCount],
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
        labels: ["Total Users"],
      },
    },
  };

  // State variables
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [years, setYears] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');

  const fetchBarangayData = async () => {
    try {
      const barangayDataQuery = query(
        collection(db, "birth_reg"), // Replace 'your_collection' with the actual collection name
        where("userBarangay", "==", selectedBarangay)
      );

      const barangayDataSnapshot = await getDocs(barangayDataQuery);
      const barangayData = barangayDataSnapshot.docs.map((doc) => doc.data());
      setBarangayData(barangayData);
    } catch (error) {
      console.error("Error fetching barangay data:", error);
    }
  };

  useEffect(() => {
    let filtered = data;
    if (selectedBarangay) {
      filtered = filtered.filter(item => item.userBarangay === selectedBarangay);
    }
    if (selectedYear) {
      filtered = filtered.filter(item => new Date(item.transactionDate).getFullYear().toString() === selectedYear);
    }
    if (selectedService) {
      filtered = filtered.filter(item => item.serviceType === selectedService);
    }
    setFilteredData(filtered);
  }, [selectedBarangay, selectedYear, selectedService, data]);

  const chartOptions = {
    chart: {
      type: "line",
    },
    xaxis: {
      categories: filteredData.map(item => item.transactionDate),
    },
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
          </div>
        </div>

        <div>
      {/* Filter dropdowns */}
      <label>Barangay:
        <select onChange={(e) => setSelectedBarangay(e.target.value)}>
          <option value="">All</option>
          {barangays.map(barangay => (
            <option key={barangay} value={barangay}>{barangay}</option>
          ))}
        </select>
      </label>

      <label>Year:
        <select onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">All</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </label>

      <label>Service:
        <select onChange={(e) => setSelectedService(e.target.value)}>
          <option value="">All</option>
          {services.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
      </label>

      <ApexCharts
        options={chartOptions}
        series={[{ name: 'Total Transactions', data: filteredData.map(item => item.transactionCount) }]}
        type="line"
        height={400}
      />
      </div>
        
      </div>
    </div>
  );
}

export default App;
