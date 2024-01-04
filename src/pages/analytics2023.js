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

    fetchMonthlyStatusData();

    fetchBarangayData();
    fetchYearlyDataForBarangay();
    fetchMonthlyDataForSelectedBarangay();
    fetchUserCount();
  }, [selectedBarangay, serviceTypeData]);

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

  const fetchMonthlyStatusData = async () => {
    const monthlyStatusData = await getMonthlyStatusData(selectedYear); // Pass selectedYear
    setMonthlyStatusData(monthlyStatusData);
  };

  const getMonthlyStatusData = async (year) => {
    try {
      // Create an array of queries for the specified date range
      const collectionQueries = [
        query(
          collection(db, "birth_reg"),
          where(
            "createdAt",
            ">",
            Timestamp.fromDate(new Date(`${year}-01-01`))
          ),
          where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
        ),
        query(
          collection(db, "marriageCert"),
          where(
            "createdAt",
            ">",
            Timestamp.fromDate(new Date(`${year}-01-01`))
          ),
          where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
        ),
        query(
          collection(db, "deathCert"),
          where(
            "createdAt",
            ">",
            Timestamp.fromDate(new Date(`${year}-01-01`))
          ),
          where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
        ),
        query(
          collection(db, "job"),
          where(
            "createdAt",
            ">",
            Timestamp.fromDate(new Date(`${year}-01-01`))
          ),
          where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
        ),
        query(
          collection(db, "businessPermit"),
          where(
            "createdAt",
            ">",
            Timestamp.fromDate(new Date(`${year}-01-01`))
          ),
          where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
        ),
      ];

      // Execute all queries concurrently
      const queryResults = await Promise.all(collectionQueries.map(getDocs));

      // Extract data from the query results
      const allData = queryResults.flatMap((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt.toDate();
          return { ...data, createdAt };
        })
      );

      // Calculate monthly count for each status
      const monthlyStatusCount = Array.from({ length: 12 }, (_, monthIndex) => {
        const monthName = new Date(year, monthIndex, 1).toLocaleString(
          "default",
          {
            month: "long",
          }
        );

        const countByStatus = (status) =>
          allData.filter((item) => {
            const itemMonth = item.createdAt.getMonth();
            return itemMonth === monthIndex && item.status === status;
          }).length;

        const statusCount = {
          month: monthName,
          pending: countByStatus("Pending"),
          onProcess: countByStatus("On Process"),
          completed: countByStatus("Completed"),
          rejected: countByStatus("Rejected"),
        };

        console.log(`${monthName} Status Count:`, statusCount);

        return statusCount;
      });

      console.log("Monthly Status Count:", monthlyStatusCount);

      return monthlyStatusCount;
    } catch (error) {
      console.error("Error fetching monthly status data:", error);
      return [];
    }
  };

  const fetchBarangayData = async () => {
    try {
      const barangayCollection = collection(db, "barangays");
      const barangaySnapshot = await getDocs(barangayCollection);
      const barangays = barangaySnapshot.docs.map((doc) => doc.data());
      setBarangayData(barangays);
    } catch (error) {
      console.error("Error fetching barangay data:", error);
    }
  };

  const fetchYearlyDataForBarangay = async () => {
    const yearlyData = await getYearlyDataForBarangay(selectedYear);
    setYearlyDataForBarangay(yearlyData);
  };

  const getYearlyDataForBarangay = async () => {
    const currentYear = new Date().getFullYear();

    const collectionQueries = [
      // Create queries for each collection and filter by year and userBarangay
      query(
        collection(db, "birth_reg"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-01-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-12-31`))
        )
      ),
      query(
        collection(db, "marriageCert"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-01-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-12-31`))
        )
      ),
      query(
        collection(db, "deathCert"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-01-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-12-31`))
        )
      ),
      query(
        collection(db, "job"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-01-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-12-31`))
        )
      ),
      query(
        collection(db, "businessPermit"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-01-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-12-31`))
        )
      ),
      // ... (similar queries for other collections)
    ];

    try {
      // Execute all queries concurrently
      const queryResults = await Promise.all(collectionQueries.map(getDocs));

      // Extract data from query results
      const collectionData = queryResults.map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return data.userBarangay; // Extract userBarangay
        })
      );

      // Flatten the array of arrays and count occurrences of each barangay
      const barangayCounts = collectionData.flat().reduce((acc, barangay) => {
        acc[barangay] = (acc[barangay] || 0) + 1;
        return acc;
      }, {});

      // Create an array with objects for each barangay and count
      const yearlyData = Object.keys(barangayCounts).map((barangay) => ({
        barangay,
        count: barangayCounts[barangay],
      }));

      return yearlyData;
    } catch (error) {
      console.error("Error fetching yearly data for barangay:", error);
      return [];
    }
  };

  const fetchMonthlyDataForSelectedBarangay = async () => {
    if (selectedBarangay) {
      const monthlyDataForBarangay = await getMonthlyDataForBarangay(
        selectedBarangay
      );
      setMonthlyDataForBarangay(monthlyDataForBarangay);
    }
  };

  // Fetch monthly data for the selected barangay
  const getMonthlyDataForBarangay = async (barangay) => {
    try {
      const collectionQueries = [
        query(
          collection(db, "birth_reg"),
          where("userBarangay", "==", barangay),
          where(
            "createdAt",
            ">=",
            Timestamp.fromDate(new Date(`${selectedYear}-01-01`))
          ),
          where(
            "createdAt",
            "<=",
            Timestamp.fromDate(new Date(`${selectedYear}-12-31`))
          )
        ),
        query(
          collection(db, "marriageCert"),
          where("userBarangay", "==", barangay),
          where(
            "createdAt",
            ">=",
            Timestamp.fromDate(new Date(`${selectedYear}-01-01`))
          ),
          where(
            "createdAt",
            "<=",
            Timestamp.fromDate(new Date(`${selectedYear}-12-31`))
          )
        ),
        query(
          collection(db, "deathCert"),
          where("userBarangay", "==", barangay),
          where(
            "createdAt",
            ">=",
            Timestamp.fromDate(new Date(`${selectedYear}-01-01`))
          ),
          where(
            "createdAt",
            "<=",
            Timestamp.fromDate(new Date(`${selectedYear}-12-31`))
          )
        ),
        query(
          collection(db, "job"),
          where("userBarangay", "==", barangay),
          where(
            "createdAt",
            ">=",
            Timestamp.fromDate(new Date(`${selectedYear}-01-01`))
          ),
          where(
            "createdAt",
            "<=",
            Timestamp.fromDate(new Date(`${selectedYear}-12-31`))
          )
        ),
        query(
          collection(db, "businessPermit"),
          where("userBarangay", "==", barangay),
          where(
            "createdAt",
            ">=",
            Timestamp.fromDate(new Date(`${selectedYear}-01-01`))
          ),
          where(
            "createdAt",
            "<=",
            Timestamp.fromDate(new Date(`${selectedYear}-12-31`))
          )
        ),
        query(
          collection(db, "appointments"),
          where("userBarangay", "==", barangay),
          where(
            "createdAt",
            ">=",
            Timestamp.fromDate(new Date(`${selectedYear}-01-01`))
          ),
          where(
            "createdAt",
            "<=",
            Timestamp.fromDate(new Date(`${selectedYear}-12-31`))
          )
        ),
      ];

      const queryResults = await Promise.all(collectionQueries.map(getDocs));

      const collectionData = queryResults.map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return data.createdAt.toDate().getMonth();
        })
      );

      const monthCounts = collectionData.flat().reduce((acc, month) => {
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const monthlyDataForBarangay = Array.from(
        { length: 12 },
        (_, monthIndex) => ({
          month: new Date(selectedYear, monthIndex, 1).toLocaleString(
            "default",
            {
              month: "long",
            }
          ),
          count: monthCounts[monthIndex] || 0,
        })
      );

      return monthlyDataForBarangay;
    } catch (error) {
      console.error("Error fetching monthly data for barangay:", error);
      return [];
    }
  };

  const handleBarangaySelection = (selectedBarangay) => {
    console.log(`Selected Barangay: ${selectedBarangay}`);
    setSelectedBarangay(selectedBarangay);
  };

  const getServiceTypeData = async () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
  
    const collectionQueries = [
      // Queries for each collection and service type
      query(
        collection(db, "birth_reg"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-31`))
        )
      ),
      query(
        collection(db, "marriageCert"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-31`))
        )
      ),
      query(
        collection(db, "deathCert"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-31`))
        )
      ),
      query(
        collection(db, "job"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-31`))
        )
      ),
      query(
        collection(db, "businessPermit"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-31`))
        )
      ),
      query(
        collection(db, "appointments"),
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-01`))
        ),
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(new Date(`${currentYear}-${currentMonth + 1}-31`))
        )
      ),
    ];
  
    try {
      // Execute all queries concurrently
      const queryResults = await Promise.all(collectionQueries.map(getDocs));
  
      // Extract data from the query results
      const serviceTypeData = queryResults.map((snapshot, index) => {
        const serviceTypeName = getServiceTypeName(index);
        return {
          name: serviceTypeName,
          data: snapshot.size, // Size gives the total count
        };
      });
  
      console.log("Service Type Data:", serviceTypeData);
  
      return serviceTypeData;
    } catch (error) {
      console.error("Error fetching service type data:", error);
      return [];
    }
  };
  
  const getServiceTypeName = (index) => {
    // Helper function to map index to service type name
    const serviceTypes = [
      "Birth Registration",
      "Marriage Certificate",
      "Death Certificate",
      "Job Application",
      "Business Permit",
      "Appointments",
    ];
    return serviceTypes[index];
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

        <div className="analytics">
          <div className="monthly-status-chart">
            <ReactApexChart
              options={{
                chart: {
                  type: "bar",
                },
                title: {
                  text: "Total Transactions per Month based on Status",
                  align: "center",
                  style: {
                    fontSize: "16px",
                    fontWeight: "bold",
                  },
                },
                xaxis: {
                  categories: monthlyStatusData.map((data) => data.month),
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: "95%", // Adjust this value to control the width of the bars
                    endingShape: "rounded",
                  },
                },
              }}
              series={[
                {
                  name: "Pending",
                  data: monthlyStatusData.map((data) => data.pending),
                },
                {
                  name: "On Process",
                  data: monthlyStatusData.map((data) => data.onProcess),
                },
                {
                  name: "Completed",
                  data: monthlyStatusData.map((data) => data.completed),
                },
                {
                  name: "Rejected",
                  data: monthlyStatusData.map((data) => data.rejected),
                },
              ]}
              type="bar"
              width={1000}
              height={400}
            />
          </div>
        </div>

        <div className="parts">
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

          <div className="polar-area-chart">
            <ReactApexChart
              options={{
                chart: {
                  type: "polarArea",
                },
                title: {
                  text: "Total Transactions by Service Type for this month",
                  align: "center",
                  style: {
                    fontSize: "16px",
                    fontWeight: "bold",
                  },
                },
                labels: serviceTypeData.map((data) => data.name),
                fill: {
                  opacity: 0.8,
                  colors: ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#FF7252", "#4B07C0"],
                },
                stroke: {
                  width: 1,
                  colors: undefined
                },
                yaxis: {
                  show: false
                },
                legend: {
                  position: 'bottom'
                },
                plotOptions: {
                  polarArea: {
                    rings: {
                      strokeWidth: 1
                    },
                    spokes: {
                      strokeWidth: 1
                    },
                  }
                },
              }}
              series={serviceTypeData.map((data) => data.data)}
              type="polarArea"
              width={500}
              height={400}
            />
          </div>
        </div>

        <div className="yearly-barangay-chart">
          <ReactApexChart
            options={{
              chart: {
                type: "bar",
                height: 400,
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                  distributed: true,
                  barHeight: "50%",
                  dataLabels: {
                    position: "bottom",
                  },
                },
              },
              title: {
                text: "Total Transactions per Barangays",
                align: "center",
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                },
              },
              xaxis: {
                type: "category",
                categories: yearlyDataForBarangay.map((data) => data.barangay),
                labels: {
                  show: true,
                  rotate: -45,
                },
              },
              // ... (other options)
            }}
            series={[
              {
                name: "Count",
                data: yearlyDataForBarangay.map((data) => data.count),
              },
            ]}
            type="bar"
            width={800}
            height={400}
            // Add a click event handler
            events={{
              dataPointSelection: function (event, chartContext, config) {
                const selectedBarangay =
                  yearlyDataForBarangay[config.dataPointIndex].barangay;
                handleBarangaySelection(selectedBarangay);
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
