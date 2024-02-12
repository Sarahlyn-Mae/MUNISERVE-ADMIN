import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import ApexCharts from "react-apexcharts";
import useAuth from "../components/useAuth";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import "./settings.css";

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

const AdminSettings = () => {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserEmail = () => {
      if (user) {
        const email = user?.email;
        const truncatedEmail =
          email.length > 10 ? `${email.substring(0, 10)}...` : email;
        setUserEmail(truncatedEmail);
      }
    };

    fetchUserEmail();
  }, [user]);

  const [birthData, setBirthData] = useState({ series: [], options: {} });
  const [deathData, setDeathData] = useState({ series: [], options: {} });
  const [jobData, setJobData] = useState({ series: [], options: {} });
  const [selectedService, setSelectedService] = useState("Birth Registration");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dataCounts, setDataCounts] = useState({});

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
            selectedYear !== "" ? date.getFullYear() === parseInt(selectedYear) : true;
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

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div className="container">
      <div className="headers" style={{ marginLeft: "50px" }}>
        <div className="icons">
          <div style={{ marginTop: "-20px" }}>
            <h1>Settings</h1>
          </div>

          <img src={notification} alt="Notification.png" className="notif" />
          <img src={logo} alt="logo" className="account-img" />
          <div className="account-names">
            <h2>{userEmail}</h2>
          </div>
        </div>
      </div>

      <div className="headings">
        <h4>Registration Statistics</h4>
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
            onChange={handleYearChange}
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
        <h4 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "30px", marginTop: "30px" }}>
          Figure. Count per Sex based on {selectedService}
        </h4>
        <p style={{ textAlign: "center" }}>
          This pie chart illustrates the distribution of registrations based on gender for the selected service and month. 
          <br/> The chart visualizes the proportion of Male and Female registrations, providing insights into the gender demographics 
          of the registration data. <br/> Each slice of the pie represents a gender category, with the corresponding percentage 
          indicating the relative frequency of registrations for that gender. 
        </p>

      </div>
    </div>
  );
};

export default AdminSettings;