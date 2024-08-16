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
import ApexCharts from "react-apexcharts";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getServiceTypeCollection(serviceType) {
  switch (serviceType) {
    case "Birth Registration":
      return collection(db, "birth_reg");
    case "Marriage Certificate":
      return collection(db, "marriageCert");
    case "Death Certificate":
      return collection(db, "deathCert");
    case "Job Application":
      return collection(db, "job");
    case "Appointments":
      return collection(db, "appointments");
    default:
      return null;
  }
}

const serviceCollections = [
  "birth_reg",
  "marriageCert",
  "deathCert",
  "job",
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
  const [yearlyDataBarangay, setYearlyDataBarangay] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [monthlyDataForBarangay, setMonthlyDataForBarangay] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [serviceTypeData, setServiceTypeData] = useState([]);
  const [serviceTypeMonthlyData, setServiceTypeMonthlyData] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  const [dailyServiceData, setDailyServiceData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [barangayFilter, setBarangayFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  const [recordCounts, setRecordCounts] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [noRecordsMessage, setNoRecordsMessage] = useState("");

  const [selectedFilter, setSelectedFilter] = useState({
    barangay: null,
    year: new Date().getFullYear(),
    serviceType: null,
  });

  useEffect(() => {
    fetchMonthlyData();
    fetchYearlyDataForBarangay();
    fetchYearlyDataBarangay();
    fetchMonthlyDataForSelectedBarangay();
    fetchUserCount();
    fetchMonthlyStatusData();
    // Fetch service type data and update state
    const fetchServiceTypeData = async () => {
      const data = await getServiceTypeData();
      setServiceTypeData(data);
    };

    fetchServiceTypeData();

    fetchServiceData(selectedDate);
    fetchDailyData(startDate, endDate);
  }, [
    startDate,
    endDate,
    selectedServiceType,
    selectedBarangay,
    selectedYear,
    selectedFilter,
    selectedMonth,
  ]);

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
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate)
    );

    const birthRegSnapshot = await getDocs(birthRegQuery);
    const marriageCertSnapshot = await getDocs(marriageCertQuery);
    const deathCertSnapshot = await getDocs(deathCertQuery);
    const jobSnapshot = await getDocs(jobQuery);
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    const birthRegTransactions = birthRegSnapshot.docs.map((doc) => doc.data());
    const marriageCertTransactions = marriageCertSnapshot.docs.map((doc) =>
      doc.data()
    );
    const deathCertTransactions = deathCertSnapshot.docs.map((doc) =>
      doc.data()
    );
    const jobTransactions = jobSnapshot.docs.map((doc) => doc.data());
    const appointmentsTransaction = appointmentsSnapshot.docs.map((doc) =>
      doc.data()
    );

    const allTransactions = [
      ...birthRegTransactions,
      ...marriageCertTransactions,
      ...deathCertTransactions,
      ...jobTransactions,
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
        collection(db, "marriage_reg"),
        where("createdAt", ">", Timestamp.fromDate(new Date("2023-01-01"))),
        where("createdAt", "<", Timestamp.fromDate(new Date("2023-12-31")))
      ),
      query(
        collection(db, "death_reg"),
        where("createdAt", ">", Timestamp.fromDate(new Date("2023-01-01"))),
        where("createdAt", "<", Timestamp.fromDate(new Date("2023-12-31")))
      ),
      query(
        collection(db, "marriageCert"),
        where("createdAt", ">", Timestamp.fromDate(new Date("2023-01-01"))),
        where("createdAt", "<", Timestamp.fromDate(new Date("2023-12-31")))
      ),
      query(
        collection(db, "appointments"),
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
        collection(db, "appointments"),
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
        collection(db, "marriage_reg"),
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
        collection(db, "death_reg"),
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

      const collectionData = queryResults.map((snapshot, index) =>
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            serviceType: getServiceTypeName(index),
            createdAt: data.createdAt.toDate(),
          };
        })
      );

      const monthlyDataForBarangay = collectionData.flat();

      // Set service type monthly data
      setServiceTypeMonthlyData(monthlyDataForBarangay);

      const monthCounts = monthlyDataForBarangay.reduce((acc, item) => {
        const monthIndex = item.createdAt.getMonth();
        acc[monthIndex] = (acc[monthIndex] || 0) + 1;
        return acc;
      }, {});

      const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => ({
        month: new Date(selectedYear, monthIndex, 1).toLocaleString("default", {
          month: "long",
        }),
        count: monthCounts[monthIndex] || 0,
      }));

      return monthlyData;
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
      query(
        collection(db, "marriage_reg"),
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
        collection(db, "death_reg"),
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
      "Marriage Registration",
      "Death Registration",
      "Job Application",
      "Appointments",
      "Request Copy of Marriage Certificate",
      "Request Copy of Death Certificate",
    ];
    return serviceTypes[index];
  };

  const findMostAndLeastAcquiredServices = () => {
    // Check if monthlyData is defined, if not return default values
    if (!monthlyData || monthlyData.length === 0) {
      return {
        mostAcquiredService: {},
        leastAcquiredService: {},
        mostAcquiredPercentage: 0,
        leastAcquiredPercentage: 0,
      };
    }

    const sortedData = [...serviceTypeData].sort((a, b) => b.data - a.data);

    const mostAcquiredService = sortedData[0];
    const leastAcquiredService = sortedData[sortedData.length - 1];

    const mostAcquiredPercentage =
      (mostAcquiredService.data / monthlyData.length) * 100;
    const leastAcquiredPercentage =
      (leastAcquiredService.data / monthlyData.length) * 100;

    return {
      mostAcquiredService,
      leastAcquiredService,
      mostAcquiredPercentage,
      leastAcquiredPercentage,
    };
  };

  const {
    mostAcquiredService,
    leastAcquiredService,
    mostAcquiredPercentage,
    leastAcquiredPercentage,
  } = findMostAndLeastAcquiredServices();

  const currentMonthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(new Date());

  const fetchDailyData = async (start, end) => {
    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    const promises = serviceTypes.map(async (serviceType) => {
      try {
        const q = query(
          collection(db, serviceType),
          where("createdAt", ">=", startOfDay),
          where("createdAt", "<=", endOfDay)
        );

        const snapshot = await getDocs(q);
        const dataPoints = Array.from(
          { length: calculateDateDifference(start, end) + 1 },
          (_, index) => {
            const currentDate = new Date(start);
            currentDate.setDate(currentDate.getDate() + index);

            const filteredDocs = snapshot.docs.filter((doc) => {
              const createdAt = doc.data().createdAt.toDate();
              return (
                createdAt.getDate() === currentDate.getDate() &&
                createdAt.getMonth() === currentDate.getMonth() &&
                createdAt.getFullYear() === currentDate.getFullYear()
              );
            });

            return {
              date: currentDate,
              count: filteredDocs.length,
            };
          }
        );

        return { serviceType, dataPoints };
      } catch (error) {
        console.error(`Error fetching ${serviceType} data:`, error);
        return { serviceType, dataPoints: [] }; // Assuming empty array on error
      }
    });

    try {
      const results = await Promise.all(promises);
      setDailyData(results);
    } catch (error) {
      console.error("Error fetching daily data:", error);
    }
  };

  const calculateDateDifference = (startDate, endDate) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const diffDays = Math.round(
      Math.abs((new Date(startDate) - new Date(endDate)) / oneDay)
    );
    return diffDays;
  };

  const serviceTypes = [
    "birth_reg",
    "appointments",
    "marriageCert",
    "marriage_reg",
    "death_reg",
    "deathCert",
    "job",
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

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleBarangayChange = (e) => {
    setBarangayFilter(e.target.value);
  };

  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
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
          collection(db, "marriage_reg"),
          where(
            "createdAt",
            ">",
            Timestamp.fromDate(new Date(`${year}-01-01`))
          ),
          where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
        ),
        query(
          collection(db, "death_reg"),
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
          collection(db, "appointments"),
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
          approved: countByStatus("Approved"),
          disapproved: countByStatus("Disapproved"),
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
      const marriageRegCollection = collection(db, "marriage_reg");
      const deathRegCollection = collection(db, "death_reg");
      const marriageCertCollection = collection(db, "marriageCert");
      const deathCertCollection = collection(db, "deathCert");
      const jobCollection = collection(db, "job");

      const [
        appointmentsSnapshot,
        birthRegSnapshot,
        marriageRegSnapshot,
        deathRegSnapshot,
        marriageCertSnapshot,
        deathCertSnapshot,
        jobSnapshot,
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
            marriageRegCollection,
            where("createdAt", ">=", startOfMonth),
            where("createdAt", "<=", endOfMonth)
          )
        ),
        getDocs(
          query(
            deathRegCollection,
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
      ]);

      const counts = {
        appointments: appointmentsSnapshot.size,
        birthRegistration: birthRegSnapshot.size,
        marriageRegistration: marriageRegSnapshot.size,
        deathRegistration: deathRegSnapshot.size,
        marriageCertificate: marriageCertSnapshot.size,
        deathCertificate: deathCertSnapshot.size,
        jobApplication: jobSnapshot.size,
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

  const fetchYearlyDataBarangay = async () => {
    const yearlyData = await getYearlyDataBarangay(
      selectedFilter.year,
      selectedFilter.barangay
    );
    setYearlyDataBarangay(yearlyData);
  };

  const getYearlyDataBarangay = async (selectedYear, selectedBarangay) => {
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

  // State variables to store highest and lowest transaction data
  const [highestTransaction, setHighestTransaction] = useState(null);
  const [lowestTransaction, setLowestTransaction] = useState(null);

  // Function to find the highest and lowest transactions
  const findHighestAndLowestTransactions = () => {
    if (yearlyDataForBarangay.length > 0) {
      let highest = yearlyDataForBarangay[0];
      let lowest = yearlyDataForBarangay[0];

      yearlyDataForBarangay.forEach((data) => {
        if (data.count > highest.count) {
          highest = data;
        }
        if (data.count < lowest.count) {
          lowest = data;
        }
      });

      setHighestTransaction(highest);
      setLowestTransaction(lowest);
    }
  };

  // useEffect hook to call the function once component mounts
  useEffect(() => {
    findHighestAndLowestTransactions();
  }, [yearlyDataForBarangay]);

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

  const [birthData, setBirthData] = useState({ series: [], options: {} });
  const [deathData, setDeathData] = useState({ series: [], options: {} });
  const [jobData, setJobData] = useState({ series: [], options: {} });
  const [selectedService, setSelectedService] = useState("Birth Registration");
  const [selectedMonths, setSelectedMonths] = useState("");
  const [selectedYears, setSelectedYears] = useState("");

  useEffect(() => {
    const fetchData = async (collectionName, setData) => {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        let dataCounts = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.createdAt.toDate()); // Convert timestamp to Date
          const monthMatch =
            selectedMonth !== "" ? date.getMonth() + 1 === selectedMonth : true;
          const yearMatch =
            selectedYear !== ""
              ? date.getFullYear() === parseInt(selectedYear)
              : true;
          if (monthMatch && yearMatch) {
            if (data.gender) {
              dataCounts[data.gender] = (dataCounts[data.gender] || 0) + 1;
            } else if (data.sex) {
              dataCounts[data.sex.toLowerCase()] =
                (dataCounts[data.sex.toLowerCase()] || 0) + 1;
            }
          }
        });
        const series = Object.values(dataCounts);
        const options = {
          chart: {
            type: "pie",
            height: 300,
          },
          labels: Object.keys(dataCounts),
          colors: ["#89B9AD", "#0D9276"],
          legend: {
            position: "bottom",
          },
        };
        setData({ series, options });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData("birth_reg", setBirthData);
    fetchData("death_reg", setDeathData);
    fetchData("job_application", setJobData);
  }, [db, selectedMonth, selectedYear]);

  const handleServiceChange = (event) => {
    setSelectedService(event.target.value);
  };

  const handleMonthChange = (event) => {
    const month = event.target.value;
    // Create a map to convert month names to their numerical representation
    const monthMap = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };
    // Set the selected month to its numerical representation
    setSelectedMonth(monthMap[month]);
  };

  const handleYearChanges = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div>
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="container">
        <div className="headers">
          <div className="icons">
            <div style={{ marginTop: "-20px" }}>
              <h1>Analytics</h1>
            </div>

            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-names">
              <h2>{userEmail}</h2>
            </div>
          </div>
        </div>

        <div className="parts">
          <div className="line-graph">
            <div className="date">
              <div className="datepicker">
                <label>Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  dateFormat="MMMM d, yyyy"
                  className="year"
                />
              </div>
              <div className="datepicker">
                <label>End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  dateFormat="MMMM d, yyyy"
                  className="year"
                />
              </div>
            </div>
            <div>
              <Chart
                options={{
                  chart: {
                    type: "line",
                  },
                  xaxis: {
                    categories: Array.from(
                      {
                        length: calculateDateDifference(startDate, endDate) + 1,
                      },
                      (_, index) => {
                        const day = new Date(startDate);
                        day.setDate(day.getDate() + index);
                        return day.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }
                    ),
                  },
                }}
                series={dailyData.map((serviceData) => ({
                  name: serviceData.serviceType,
                  data: Array.from(
                    { length: calculateDateDifference(startDate, endDate) + 1 },
                    (_, index) => {
                      const currentDate = new Date(startDate);
                      currentDate.setDate(currentDate.getDate() + index);
                      const dataPoint = serviceData.dataPoints.find(
                        (item) =>
                          item.date.getDate() === currentDate.getDate() &&
                          item.date.getMonth() === currentDate.getMonth() &&
                          item.date.getFullYear() === currentDate.getFullYear()
                      );
                      return dataPoint ? dataPoint.count : 0;
                    }
                  ),
                }))}
                type="line"
                width={1250}
                height={550}
              />
            </div>
            <div className="description">
              <h5
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  fontWeight: "bold",
                }}
              >
                Figure 1. TOTAL TRANSACTIONS PER SERVICES
              </h5>
              <p style={{ textAlign: "center", marginTop: "16px" }}>
                Figure 1 illustrates the distribution of transactions across
                various services including birth registration, marriage
                registration, death registration, job application, and
                appointments within the selected time frame. It offers insights
                into the volume of activity associated with each service, aiding
                in the assessment of service utilization and demand patterns.
                The graph enables a comparative analysis of transaction volumes
                across these service categories, offering valuable insights into
                the distribution and utilization of administrative services
                based on the selected date range.
              </p>
            </div>
          </div>
        </div>

        <div className="partt">
          {recordCounts && (
            <div className="chart">
              <div className="rows">
                <div className="cols-4">
                  <select
                    value={selectedMonth}
                    className="dates"
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                  {noRecordsMessage && <p>{noRecordsMessage}</p>}
                  <Chart
                    options={{
                      chart: {
                        id: "record-bar",
                      },
                    }}
                    series={[
                      {
                        name: "Appointments",
                        data: [
                          {
                            x: "Appointments",
                            y: recordCounts.appointments,
                            color: "#8884d8",
                          },
                        ],
                      },
                      {
                        name: "Birth Registration",
                        data: [
                          {
                            x: "Birth Registration",
                            y: recordCounts.birthRegistration,
                            color: "#82ca9d",
                          },
                        ],
                      },
                      {
                        name: "Marriage Registration",
                        data: [
                          {
                            x: "Marriage Registration",
                            y: recordCounts.marriageRegistration,
                            color: "#82ca9d",
                          },
                        ],
                      },
                      {
                        name: "Copy of Marriage Certificate",
                        data: [
                          {
                            x: "Copy of Marriage Certificate",
                            y: recordCounts.marriageCertificate,
                            color: "#ffc658",
                          },
                        ],
                      },
                      {
                        name: "Death Registration",
                        data: [
                          {
                            x: "Death Registration",
                            y: recordCounts.deathRegistration,
                            color: "#82ca9d",
                          },
                        ],
                      },
                      {
                        name: "Copy of Death Certificate",
                        data: [
                          {
                            x: "Copy of Death Certificate",
                            y: recordCounts.deathCertificate,
                            color: "#ff7300",
                          },
                        ],
                      },
                      {
                        name: "Job Application",
                        data: [
                          {
                            x: "Job Application",
                            y: recordCounts.jobApplication,
                            color: "#0088fe",
                          },
                        ],
                      },
                    ]}
                    type="bar"
                    width={700}
                    height={500}
                  />
                </div>
                <div>
                  <h5
                    style={{
                      textAlign: "center",
                      marginTop: "20px",
                      fontWeight: "bold",
                      marginBottom: "20px",
                    }}
                  >
                    Figure 2. NUMBER OF APPLICATIONS PER SERVICES
                  </h5>
                </div>
              </div>
              <div style={{ marginLeft: "-80px" }}>
                <div className="directions">
                  <p>This Figure 2. presents the following:</p>
                  <p style={{ textAlign: "justify", fontSize: "16px" }}>
                    • The number of appointments for{" "}
                    {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    is {recordCounts.appointments} applications, <br /> from all
                    of the{" "}
                    {Object.values(recordCounts).reduce(
                      (acc, count) => acc + count,
                      0
                    )}{" "}
                    transactions with a corresponding percentage of{" "}
                    {(
                      (recordCounts.appointments /
                        Object.values(recordCounts).reduce(
                          (acc, count) => acc + count,
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %.
                  </p>
                  <p style={{ textAlign: "justify", fontSize: "16px" }}>
                    • The number of Birth Registration for{" "}
                    {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    is {recordCounts.birthRegistration} registrations, <br />{" "}
                    from all of the{" "}
                    {Object.values(recordCounts).reduce(
                      (acc, count) => acc + count,
                      0
                    )}{" "}
                    transactions with a corresponding percentage of{" "}
                    {(
                      (recordCounts.birthRegistration /
                        Object.values(recordCounts).reduce(
                          (acc, count) => acc + count,
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %.
                  </p>
                  <p style={{ textAlign: "justify", fontSize: "16px" }}>
                    • The number of Marriage Registration for{" "}
                    {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    is {recordCounts.marriageRegistration} registrations, <br />{" "}
                    from all of the{" "}
                    {Object.values(recordCounts).reduce(
                      (acc, count) => acc + count,
                      0
                    )}{" "}
                    transactions with a corresponding percentage of{" "}
                    {(
                      (recordCounts.marriageRegistration /
                        Object.values(recordCounts).reduce(
                          (acc, count) => acc + count,
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %.
                  </p>
                  <p style={{ textAlign: "justify", fontSize: "16px" }}>
                    • The number of Requested Copy of Marriage Certificate for{" "}
                    {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    is {recordCounts.marriageCertificate} <br /> registrations,
                    from all of the{" "}
                    {Object.values(recordCounts).reduce(
                      (acc, count) => acc + count,
                      0
                    )}{" "}
                    transactions with a corresponding <br /> percentage of{" "}
                    {(
                      (recordCounts.marriageCertificate /
                        Object.values(recordCounts).reduce(
                          (acc, count) => acc + count,
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %.
                  </p>
                  <p style={{ textAlign: "justify", fontSize: "16px" }}>
                    • The number of Death Registration for{" "}
                    {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    is {recordCounts.deathRegistration} registrations, <br />{" "}
                    from all of the{" "}
                    {Object.values(recordCounts).reduce(
                      (acc, count) => acc + count,
                      0
                    )}{" "}
                    transactions with a corresponding percentage of{" "}
                    {(
                      (recordCounts.deathRegistration /
                        Object.values(recordCounts).reduce(
                          (acc, count) => acc + count,
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %.
                  </p>
                  <p style={{ textAlign: "justify", fontSize: "16px" }}>
                    • The number of Requested Copy of Death Certificate for{" "}
                    {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    is {recordCounts.deathCertificate} <br /> registrations,
                    from all of the{" "}
                    {Object.values(recordCounts).reduce(
                      (acc, count) => acc + count,
                      0
                    )}{" "}
                    transactions with a corresponding <br /> percentage of{" "}
                    {(
                      (recordCounts.deathCertificate /
                        Object.values(recordCounts).reduce(
                          (acc, count) => acc + count,
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %.
                  </p>
                  <p style={{ textAlign: "justify", fontSize: "16px" }}>
                    • The number of Job applications for{" "}
                    {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    is {recordCounts.jobApplication} applications, <br /> from
                    all of the{" "}
                    {Object.values(recordCounts).reduce(
                      (acc, count) => acc + count,
                      0
                    )}{" "}
                    transactions with a corresponding percentage of{" "}
                    {(
                      (recordCounts.jobApplication /
                        Object.values(recordCounts).reduce(
                          (acc, count) => acc + count,
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="part">
          <div>
            <div className="polar-area-chart">
              <ReactApexChart
                options={{
                  chart: {
                    type: "polarArea",
                  },
                  labels: serviceTypeData.map((data) => data.name),
                  fill: {
                    opacity: 0.8,
                    colors: [
                      "#4285F4",
                      "#34A853",
                      "#FBBC05",
                      "#EA4335",
                      "#FF7252",
                      "#4B07C0",
                      "#008A63",
                      "#AD0040",
                    ],
                  },
                  stroke: {
                    width: 1,
                    colors: undefined,
                  },
                  yaxis: {
                    show: false,
                  },
                  legend: {
                    position: "bottom",
                  },
                  plotOptions: {
                    polarArea: {
                      rings: {
                        strokeWidth: 1,
                      },
                      spokes: {
                        strokeWidth: 1,
                      },
                    },
                  },
                  dataLabels: {
                    enabled: true,
                    formatter: function (val, opts) {
                      return opts.w.globals.series[opts.seriesIndex];
                    },
                    background: {
                      enabled: false,
                    },
                  },
                }}
                series={serviceTypeData.map((data) => data.data)}
                type="polarArea"
                width={700}
                height={500}
              />
            </div>
            <div className="directions">
              <h5
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  fontWeight: "bold",
                }}
              >
                Figure 3. MOST ACQUIRED SERVICE FOR THE <br /> MONTH OF{" "}
                {currentMonthName.toUpperCase()}
              </h5>
              <p
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  fontSize: "16px",
                }}
              >
                The most acquired service for this month of {currentMonthName}{" "}
                <br /> is {mostAcquiredService.name} with a total of{" "}
                {mostAcquiredService.data} transactions or (
                {mostAcquiredPercentage.toFixed(2)}%).
              </p>
              <p
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  fontSize: "16px",
                }}
              >
                The least acquired service for this month of {currentMonthName}{" "}
                <br /> is {leastAcquiredService.name} with a total of{" "}
                {leastAcquiredService.data} transactions or (
                {leastAcquiredPercentage.toFixed(2)}%).
              </p>
            </div>
          </div>

          <div>
            <div className="headings">
              <div className="filterss">
                <select value={selectedService} onChange={handleServiceChange}>
                  <option value="Birth Registration">Birth Registration</option>
                  <option value="Death Registration">Death Registration</option>
                  <option value="Job Application">Job Application</option>
                </select>
                <select value={selectedMonth} onChange={handleMonthChange}>
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
                <input
                  type="text"
                  placeholder="Enter year"
                  value={selectedYear}
                  onChange={handleYearChanges}
                  className="year"
                />
              </div>
            </div>
            <div>
              <ApexCharts
                options={
                  selectedService === "Birth Registration"
                    ? birthData.options
                    : selectedService === "Death Registration"
                    ? deathData.options
                    : jobData.options
                }
                series={
                  selectedService === "Birth Registration"
                    ? birthData.series
                    : selectedService === "Death Registration"
                    ? deathData.series
                    : jobData.series
                }
                type="pie"
                height={400}
              />
              <h5
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: "30px",
                  marginTop: "30px",
                }}
              >
                Figure 4. Count per Sex based on {selectedService}
              </h5>
              <p style={{ textAlign: "center" }}>
                This pie chart illustrates the distribution of registrations
                based on gender for the selected service and month.
                The chart visualizes the proportion of Male and Female
                registrations, providing insights into the gender demographics
                of the registration data. Each slice of the pie
                represents a gender category, with the corresponding percentage
                indicating the relative frequency of registrations for that
                gender.
              </p>
            </div>
          </div>
        </div>

        <div className="yearly-barangay-chart">
          <ReactApexChart
            options={{
              chart: {
                type: "line",
                height: 400,
              },
              colors: ["#1e7566"],
              plotOptions: {
                bar: {
                  horizontal: false,
                  distributed: true,
                  barHeight: "50%",
                  dataLabels: {
                    position: "bottom",
                  },
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
            }}
            series={[
              {
                name: "Count",
                data: yearlyDataForBarangay.map((data) => data.count),
              },
            ]}
            type="line"
            width={1300}
            height={600}
          />
          <div className="description">
            <h5
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontWeight: "bold",
              }}
            >
              Figure 5. TOTAL TRANSACTIONS PER BARANGAYS
            </h5>
            <p
              style={{
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "normal",
              }}
            >
              Figure 4 illustrates the total number of transactions recorded for
              each barangay within a year. Transactions are categorized by
              barangay, providing a comprehensive overview of activity
              distribution across different areas. The chart highlights the
              varying levels of transaction activity across barangays, with some
              areas showing higher transaction volumes compared to others.
              <br /> <br />
              The Barangay/s of{" "}
              {highestTransaction && highestTransaction.barangay} emerges as a
              significant contributor to the total transaction count, indicating
              a concentration of economic or social activity in this region.
              This heightened level of transactional engagement may signify
              various factors such as a larger population, increased demand for
              services, or perhaps centralized administrative functions that
              attract more interactions.
              <br /> <br />
              On the other hand, barangay/s like{" "}
              {lowestTransaction && lowestTransaction.barangay} exhibit lower
              transaction counts, suggesting potential areas for further
              analysis or exploration. The lower activity levels could stem from
              several factors, including smaller population size, limited access
              to services, or specific socioeconomic dynamics unique to these
              regions. Understanding the underlying reasons for these lower
              transaction counts is crucial for identifying areas of
              improvement, addressing potential disparities in service access,
              and ensuring equitable service delivery across all barangays.
            </p>
          </div>
        </div>


        <div className="analytics">
          <div className="monthly-status-chart">
            <ReactApexChart
              options={{
                chart: {
                  type: "bar",
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
                {
                  name: "Approved",
                  data: monthlyStatusData.map((data) => data.approved),
                },
                {
                  name: "Disapproved",
                  data: monthlyStatusData.map((data) => data.disapproved),
                },
              ]}
              type="bar"
              width={1300}
              height={700}
            />
            <div className="description">
              <h5
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  fontWeight: "bold",
                }}
              >
                Figure 6. TOTAL TRANSACTIONS PER MONTH BASED ON STATUS
              </h5>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  fontWeight: "normal",
                }}
              >
                The chart visually represents the distribution of total
                transactions across various status categories, providing an
                insightful overview of the current transaction landscape. Each
                segment of the chart corresponds to a distinct status category,
                namely "Pending," "Approved," "Disapproved," "On Process," and
                "Rejected." The height or size of each segment is proportional
                to the total number of transactions falling under that specific
                status. This provides a visual comparison of the distribution of
                transactions across these statuses, enabling stakeholders to
                assess the overall status distribution and identify any
                potential bottlenecks, trends, or areas of improvement within
                the transactional workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
