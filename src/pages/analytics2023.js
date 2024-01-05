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
import { Bar, PieChart, Pie, Cell, Tooltip } from "recharts";
import Chart from "react-apexcharts";
import ReactApexChart from "react-apexcharts";
import "apexcharts";
import "./transactions.css";
import Sidebar from "../components/sidebar";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const [dailyData, setDailyData] = useState([]);
  const [dailyServiceData, setDailyServiceData] = useState([]);

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

    fetchMonthlyData();

    fetchUserCount();
    fetchDailyData(selectedDate);
    fetchServiceData(selectedDate);
  }, [selectedDate]);

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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchTransactions("custom", date);
  };

  const fetchMonthlyData = async () => {
    const monthlyTransactions = await getMonthlyData();
    setMonthlyData(monthlyTransactions);
  };

  const getMonthlyData = async () => {
    const collectionQueries = [
      query(
        collection(db, "birth_reg"),
        where("createdAt", ">", Timestamp.fromDate(new Date("2023-01-01"))),
        where("createdAt", "<", Timestamp.fromDate(new Date("2023-12-31")))
      ),
      query(
        collection(db, "marriageCert"),
        where("createdAt", ">", Timestamp.fromDate(new Date("2023-01-01"))),
        where("createdAt", "<", Timestamp.fromDate(new Date("2023-12-31")))
      ),
      query(
        collection(db, "businessPermit"),
        where("createdAt", ">", Timestamp.fromDate(new Date("2023-01-01"))),
        where("createdAt", "<", Timestamp.fromDate(new Date("2023-12-31")))
      ),
      query(
        collection(db, "deathCert"),
        where("createdAt", ">", Timestamp.fromDate(new Date("2023-01-01"))),
        where("createdAt", "<", Timestamp.fromDate(new Date("2023-12-31")))
      ),
      query(
        collection(db, "job"),
        where("createdAt", ">", Timestamp.fromDate(new Date("2023-01-01"))),
        where("createdAt", "<", Timestamp.fromDate(new Date("2023-12-31")))
      ),
    ];

    try {
      // Execute all queries concurrently
      const queryResults = await Promise.all(collectionQueries.map(getDocs));

      // Extract data from query results
      const collectionData = queryResults.map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data();
          // Convert Firebase Timestamp to JavaScript Date object
          const createdAt = data.createdAt.toDate();
          return { ...data, createdAt };
        })
      );

      // Combine data from different collections
      const allData = [].concat(...collectionData);

      // Calculate monthly count
      const monthlyCount = Array.from({ length: 12 }, (_, monthIndex) => {
        const monthName = new Date(2023, monthIndex, 1).toLocaleString(
          "default",
          {
            month: "long",
          }
        );
        const count = allData.filter((item) => {
          const itemMonth = item.createdAt.getMonth();
          return itemMonth === monthIndex;
        }).length;
        return { month: monthName, count };
      });

      return monthlyCount;
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      return [];
    }
  };

  const fetchDailyData = async (date) => {
    const endDate = new Date(date);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 29); // 30 days before the current date

    const collections = [
      "birth_reg",
      "appointments",
      "marriageCert",
      "deathCert",
      "businessPermit",
      "job",
    ];

    const promises = collections.map(async (collectionName) => {
      const q = query(
        collection(db, collectionName),
        where("createdAt", ">=", startDate),
        where("createdAt", "<=", endDate)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    });

    try {
      const results = await Promise.all(promises);

      const newData = results.map((count, index) => ({
        date: new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + index
        ),
        count,
      }));

      setDailyData(newData);
    } catch (error) {
      console.error("Error fetching daily data:", error);
    }
  };

  const serviceTypes = [
    "Birth Registration",
    "Appointments",
    "Marriage Certificate",
    "Death Certificate",
    "Business Permit",
    "Job",
  ];  

  const fetchServiceData = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    const promises = serviceTypes.map(async (serviceType) => {
      try {
        const q = query(
          collection(db, serviceType),
          where("createdAt", ">=", startOfDay),
          where("createdAt", "<=", endOfDay)
        );
  
        const snapshot = await getDocs(q);
        const count = snapshot.size;
  
        console.log(`Service Type: ${serviceType}, Count: ${count}`);
        return { serviceType, count };
      } catch (error) {
        console.error(`Error fetching ${serviceType} data:`, error);
        return { serviceType, count: 0 }; // Assuming 0 count on error
      }
    });
  
    try {
      const results = await Promise.all(promises);
      console.log("Results from Firebase:", results);
      setDailyServiceData(results);
    } catch (error) {
      console.error("Error fetching daily service data:", error);
    }
  };
  
  
  return (
    <div>
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="container">
        <div className="header">
          <div className="icons">
            <h1>Reports</h1>
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-name">
              <h1>Admin</h1>
            </div>
          </div>
        </div>

        <h1>Analytics for 2023</h1>

        <div className="parts">
          <div className="datepicker">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
            />
          </div>

          <div>
            <Chart
              options={{
                chart: {
                  type: "line",
                },
                xaxis: {
                  categories: Array.from({ length: 30 }, (_, index) => {
                    const day = new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate() - 30 + index
                    );
                    return day.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }),
                },
              }}
              series={serviceTypes.map((serviceType) => ({
                name: serviceType,
                data: Array.from({ length: 30 }, (_, index) => {
                  const currentDate = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate() - 30 + index
                  );
                  const dataPoint = dailyData.find(
                    (item) =>
                      item.date.getDate() === currentDate.getDate() &&
                      item.date.getMonth() === currentDate.getMonth() &&
                      item.date.getFullYear() === currentDate.getFullYear()
                  );
                  return dataPoint ? dataPoint.count : 0;
                }),
              }))}
              type="line"
              width={800}
              height={400}
            />
          </div>
        </div>

        <div className="monthly-chart">
          <ReactApexChart
            options={{
              chart: {
                type: "bar",
              },
              title: {
                text: "Total Transactions per Month",
                align: "center",
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                },
              },
              xaxis: {
                categories: monthlyData.map((data) => data.month),
              },
            }}
            series={[
              { name: "Count", data: monthlyData.map((data) => data.count) },
            ]}
            type="bar"
            width={500}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}

export default App;