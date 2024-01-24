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
    case "Business Permit":
      return collection(db, "businessPermit");
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
  const [userCount, setUserCount] = useState(0);
  const [serviceTypeData, setServiceTypeData] = useState([]);
  const [serviceTypeMonthlyData, setServiceTypeMonthlyData] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [drillDownData, setDrillDownData] = useState([]);

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
    fetchMonthlyData();
    fetchYearlyDataForBarangay();
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
  }, [startDate, endDate, selectedServiceType, selectedBarangay, selectedYear, selectedFilter, selectedMonth]);

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
      "Business Permit",
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
    "deathCert",
    "businessPermit",
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

  const handleServiceChange = (e) => {
    setServiceFilter(e.target.value);
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
          collection(db, "businessPermit"),
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
            <h1>Analytics</h1>
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-name">
              <h1>Admin</h1>
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
                />
              </div>
              <div className="datepicker">
                <label>End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  dateFormat="MMMM d, yyyy"
                />
              </div>
            </div>
            <div>
              <Chart
                options={{
                  chart: {
                    type: "line",
                  },
                  title: {
                    text: "TOTAL TRANSACTIONS PER SERVICE",
                    align: "center",
                    style: {
                      fontSize: "17px",
                      fontWeight: "bold",
                      marginTop: "40px",
                    },
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
                      title: {
                        text: "NO. OF APPLICATIONS PER SERVICES",
                        align: "center",
                        style: {
                          fontSize: "16px",
                          fontWeight: "bold",
                        },
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
                        name: "Marriage Certificate",
                        data: [
                          {
                            x: "Marriage Certificate",
                            y: recordCounts.marriageCertificate,
                            color: "#ffc658",
                          },
                        ],
                      },
                      {
                        name: "Death Certificate",
                        data: [
                          {
                            x: "Death Certificate",
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
                      {
                        name: "Business Permit",
                        data: [
                          {
                            x: "Business Permit",
                            y: recordCounts.businessPermit,
                            color: "#d73a4a",
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
                  <div className="directions">
                  <h5
                    style={{
                      textAlign: "center",
                      marginTop: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    Figure 2.
                  </h5>
                    <h1>
                      The number of appointments for{" "}
                      {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      )}{" "}
                      is {recordCounts.appointments} applications, from all of
                      the{" "}
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
                    </h1>
                    <h1>
                      The number of Birth Registration for{" "}
                      {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      )}{" "}
                      is {recordCounts.birthRegistration} registrations, from
                      all of the{" "}
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
                    </h1>
                    <h1>
                      The number of Marriage Certificate for{" "} {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      )}{" "} is {recordCounts.marriageCertificate} registrations, from
                      all of the{" "} {Object.values(recordCounts).reduce(
                        (acc, count) => acc + count,
                        0
                      )}{" "} transactions with a corresponding percentage of{" "}
                      {(
                        (recordCounts.marriageCertificate /
                          Object.values(recordCounts).reduce(
                            (acc, count) => acc + count,
                            0
                          )) *
                        100
                      ).toFixed(2)}
                      %.
                    </h1>
                    <h1>
                      The number of Death Registration for{" "}
                      {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      )}{" "}
                      is {recordCounts.deathCertificate} registrations, from all
                      of the{" "}
                      {Object.values(recordCounts).reduce(
                        (acc, count) => acc + count,
                        0
                      )}{" "}
                      transactions with a corresponding percentage of{" "}
                      {(
                        (recordCounts.deathCertificate /
                          Object.values(recordCounts).reduce(
                            (acc, count) => acc + count,
                            0
                          )) *
                        100
                      ).toFixed(2)}
                      %.
                    </h1>
                    <h1>
                      The number of Job applications for{" "}
                      {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      )}{" "}
                      is {recordCounts.jobApplication} applications, from all of
                      the{" "}
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
                    </h1>
                    <h1>
                      The number of Business Permit for{" "}
                      {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      )}{" "}
                      is {recordCounts.businessPermit} registrations, from all
                      of the{" "}
                      {Object.values(recordCounts).reduce(
                        (acc, count) => acc + count,
                        0
                      )}{" "}
                      transactions with a corresponding percentage of{" "}
                      {(
                        (recordCounts.businessPermit /
                          Object.values(recordCounts).reduce(
                            (acc, count) => acc + count,
                            0
                          )) *
                        100
                      ).toFixed(2)}
                      %.
                    </h1>
                  </div>
                </div>
              </div>

              <div className="part">
                <div className="polar-area-chart">
                  <ReactApexChart
                    options={{
                      chart: {
                        type: "polarArea",
                      },
                      title: {
                        text:
                          "MOST ACQUIRED SERVICE FOR THE MONTH OF " +
                          currentMonthName.toUpperCase(),
                        align: "center",
                        style: {
                          fontSize: "16px",
                          fontWeight: "bold",
                        },
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
                    Figure 3.
                  </h5>
                  <h1>
                    The most acquired service for this month of{" "}
                    {currentMonthName} is {mostAcquiredService.name} <br /> with
                    a total of {mostAcquiredService.data} transactions or (
                    {mostAcquiredPercentage.toFixed(2)}%).
                  </h1>
                  <h1>
                    The least acquired service for this month of{" "}
                    {currentMonthName} is {leastAcquiredService.name} <br />{" "}
                    with a total of {leastAcquiredService.data} transactions or
                    ({leastAcquiredPercentage.toFixed(2)}%).
                  </h1>
                </div>
              </div>
            </div>
          )}
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
                  horizontal: false,
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
            }}
            series={[
              {
                name: "Count",
                data: yearlyDataForBarangay.map((data) => data.count),
              },
            ]}
            type="bar"
            width={700}
            height={600}
          />
          <div className="filterss">
          <label>Year:</label>
          <select
            value={selectedFilter.year}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            {/* Add options for years */}
            {Array.from(
              { length: 10 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
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
                  horizontal: false,
                  stacked: true,
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
            }}
            series={serviceCollections.map((service) => ({
              name: service,
              data: yearlyDataForBarangay.map((data) => data[service] || 0),
            }))}
            type="bar"
            width={700}
            height={500}
          />
        </div>
        </div>

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
              height={600}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
