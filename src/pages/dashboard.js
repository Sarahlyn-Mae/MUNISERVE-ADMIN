import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import './dashboard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import notification from '../assets/icons/Notification.png';
import logo from '../assets/logo.png'
import { BsClipboardCheckFill, BsClockHistory, BsCheckCircleFill, BsXCircleFill }
  from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line }
  from 'recharts';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Chart from "react-apexcharts";
import { format, isValid } from 'date-fns';

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

const Dashboard = ({ count }) => {

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ... existing code
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const filteredData = querySnapshot.docs
          .filter((doc) => {
            const appointmentData = doc.data();
            const date = new Date(appointmentData.createdAt);
            return date >= startOfDay && date <= endOfDay;
          });

        // ... remaining code remains the same
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        // Handle error here
      }
    };

    fetchData();
  }, [selectedDate]);

  const [barChartData, setBarChartData] = useState({
    options: {
      colors: ["#8884d8", "#82ca9d", "#FF5733", "#1E88DC", "#FFCA51", "#BB6FD4"],
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [],
      },
    },
    series: [
      {
        name: "Pending",
        data: [],
      },
      {
        name: "Approved",
        data: [],
      },
      {
        name: "Disapproved",
        data: [],
      },
      {
        name: "Rejected",
        data: [],
      },
      {
        name: "Completed",
        data: [],
      },
      {
        name: "On Process",
        data: [],
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentCollection = collection(firestore, "appointments");
        const birthRegCollection = collection(firestore, "birth_reg");
        const marriageCertCollection = collection(firestore, "marriageCert");
        const deathCertCollection = collection(firestore, "deathCert");
        const jobCollection = collection(firestore, "job");
        const businessPermitCollection = collection(firestore, "businessPermit");

        const [appointmentSnapshot, birthRegSnapshot, marriageCertSnapshot, deathCertSnapshot, jobSnapshot, businessPermitSnapshot] =
          await Promise.all([
            getDocs(appointmentCollection),
            getDocs(birthRegCollection),
            getDocs(marriageCertCollection),
            getDocs(deathCertCollection),
            getDocs(jobCollection),
            getDocs(businessPermitCollection),
          ]);

        const counts = {
          pending: 0,
          approved: 0,
          disapproved: 0,
          completed: 0,
          rejected: 0,
          onProcess: 0,
        };

        const categories = [];

        const processCollectionData = (snapshot, statusField) => {
          snapshot.forEach((doc) => {
            const data = doc.data();

            if (data.status === "Pending") {
              counts.pending += 1;
            } else if (data.status === "Approved") {
              counts.approved += 1;
            } else if (data.status === "Disapproved") {
              counts.disapproved += 1;
            } else if (data.status === "Rejected") {
              counts.approved += 1;
            } else if (data.status === "Completed") {
              counts.disapproved += 1;
            } else if (data.status === "On Process") {
              counts.disapproved += 1;
            }

            // Assuming your data has a createdAt field for x-axis
            // Make sure createdAt is a valid date string or a timestamp
            const date = new Date(data.createdAt);
            categories.push(date.toLocaleDateString()); // Adjust the format if needed
          });
        };

        processCollectionData(appointmentSnapshot);
        processCollectionData(birthRegSnapshot);
        processCollectionData(marriageCertSnapshot);
        processCollectionData(deathCertSnapshot);
        processCollectionData(jobSnapshot, "status"); // Assuming job collection has a 'status' field
        processCollectionData(businessPermitSnapshot, "status"); // Assuming businessPermit collection has a 'status' field

        console.log("Fetched Data:", counts, categories);

        setBarChartData((prevData) => ({
          ...prevData,
          options: {
            ...prevData.options,
            xaxis: {
              ...prevData.options.xaxis,
              categories: categories,
            },
          },
          series: [
            {
              name: "Pending",
              data: [counts.pending],
            },
            {
              name: "Approved",
              data: [counts.approved],
            },
            {
              name: "Disapproved",
              data: [counts.disapproved],
            },
            {
              name: "Rejected",
              data: [counts.pending],
            },
            {
              name: "Completed",
              data: [counts.approved],
            },
            {
              name: "On Process",
              data: [counts.disapproved],
            },
            // Add more series for other status types (completed, rejected, onProcess, etc.)
          ],
        }));
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        // Handle error here
      }
    };

    fetchData();
  }, []);

  console.log("Rendering Data:", barChartData);

  const [recordCounts, setRecordCounts] = useState({
    appointments: 0,
    birthRegistration: 0,
    marriageCertificate: 0,
    deathCertificate: 0,
    jobApplication: 0,
    businessPermit: 0,
  });

  useEffect(() => {
    const fetchRecordCounts = async () => {
      try {
        const appointmentsCollection = collection(firestore, "appointments");
        const birthRegCollection = collection(firestore, "birth_reg");
        const marriageCertCollection = collection(firestore, "marriageCert");
        const deathCertCollection = collection(firestore, "deathCert");
        const jobCollection = collection(firestore, "job");
        const businessPermitCollection = collection(firestore, "businessPermit");

        const [appointmentsSnapshot, birthRegSnapshot, marriageCertSnapshot, deathCertSnapshot, jobSnapshot, businessPermitSnapshot] =
          await Promise.all([
            getDocs(appointmentsCollection),
            getDocs(birthRegCollection),
            getDocs(marriageCertCollection),
            getDocs(deathCertCollection),
            getDocs(jobCollection),
            getDocs(businessPermitCollection),
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
      } catch (error) {
        console.error("Error fetching record counts from Firebase:", error);
        // Handle error here
      }
    };

    fetchRecordCounts();
  }, []);

  console.log("Record Counts:", recordCounts);

  return (
    <main className='main-container'>
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className='container'>
        <div className="header">
          <div className='icons'>
            <h1>Dashboard</h1>
            <img src={notification} alt="Notification.png" className='notif' />
            <img src={logo} alt="logo" className='account-img' />
            <div className='account-name'><h1>Admin</h1></div>
          </div>
        </div>

        <div className='main-cards'>

          <div className='card'>
            <div className='card-inner'>
              <h3>Total No. of Service Requests</h3>
              <BsClipboardCheckFill className='card_icon' />
            </div>

          </div>

          <div className='card'>
            <div className='card-inner'>
              <h3>Pending</h3>
              <BsClockHistory className='card_icon' />
            </div>

          </div>

          <div className='card'>
            <div className='card-inner'>
              <h3>Completed</h3>
              <BsCheckCircleFill className='card_icon' />
            </div>

          </div>

          <div className='card'>
            <div className='card-inner'>
              <h3>Disapproved</h3>
              <BsXCircleFill className='card_icon' />
            </div>

          </div>

          <div className='card'>
            <div className='card-inner'>
              <h3>Approved</h3>
              <BsCheckCircleFill className='card_icon' />
            </div>

          </div>
        </div>

        {/* Date Picker */}
        <div className="date-picker">
          <label>Select Date: </label>
          <DatePicker selected={selectedDate} onChange={handleDateChange} />
        </div>

        <div className='chart'>
          {recordCounts && (
            <div className='charts'>
              <div className="row">
                <div className="col-4">
                  <h6>NO. OF APPLICATIONS PER SERVICES</h6>
                  <Chart
                    options={{
                      colors: ["#8884d8"],
                      chart: {
                        id: "record-bar",
                      },
                      xaxis: {
                        categories: ["Appointments", "Birth Registration", "Marriage Certificate", "Death Certificate", "Job Application", "Business Permit"],
                      },
                    }}
                    series={[
                      {
                        name: "Records",
                        data: [
                          recordCounts.appointments,
                          recordCounts.birthRegistration,
                          recordCounts.marriageCertificate,
                          recordCounts.deathCertificate,
                          recordCounts.jobApplication,
                          recordCounts.businessPermit,
                        ],
                      },
                    ]}
                    type="bar"
                    width="450"
                  />
                </div>
              </div>
            </div>
          )}

          {barChartData.options && barChartData.series && (
            <div className='charts'>
              <div className="row">
                <div className="col-4">
                  <Chart
                    options={barChartData.options}
                    series={barChartData.series}
                    type="bar"
                    width="450"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default Dashboard;