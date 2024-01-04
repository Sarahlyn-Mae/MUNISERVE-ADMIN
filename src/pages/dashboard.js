import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import "./dashboard.css";
import notification from "../assets/icons/Notification.png";
import logo from "../assets/logo.png";
import {
  BsClipboardCheckFill,
  BsClockHistory,
  BsCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs";
import useAuth from "../components/useAuth";
import "firebase/firestore";
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
  //Function for the graph of the total number of transaction per month
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    const currentYear = new Date().getFullYear(); // Get the current year
    const monthlyTransactions = await getMonthlyData(currentYear);
    setMonthlyData(monthlyTransactions);
  };
  
  const getMonthlyData = async (year) => {
    // Array of collection queries
    const collectionQueries = [
      query(
        collection(firestore, "birth_reg"),
        where("createdAt", ">", Timestamp.fromDate(new Date(`${year}-01-01`))),
        where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
      ),
      query(
        collection(firestore, "marriageCert"),
        where("createdAt", ">", Timestamp.fromDate(new Date(`${year}-01-01`))),
        where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
      ),
      query(
        collection(firestore, "businessPermit"),
        where("createdAt", ">", Timestamp.fromDate(new Date(`${year}-01-01`))),
        where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
      ),
      query(
        collection(firestore, "deathCert"),
        where("createdAt", ">", Timestamp.fromDate(new Date(`${year}-01-01`))),
        where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
      ),
      query(
        collection(firestore, "job"),
        where("createdAt", ">", Timestamp.fromDate(new Date(`${year}-01-01`))),
        where("createdAt", "<", Timestamp.fromDate(new Date(`${year}-12-31`)))
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
        const monthName = new Date(year, monthIndex, 1).toLocaleString("default", {
          month: "long",
        });
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
  
  //Function for the account name
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserEmail = () => {
      if (user) {
        const email = user.email;
        const truncatedEmail = email.length > 5 ? `${email.substring(0, 5)}...` : email;
        setUserEmail(truncatedEmail);
      }
    };

    fetchUserEmail();
  }, [user]);

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
        const businessPermitCollection = collection(
          firestore,
          "businessPermit"
        );

        const [
          appointmentsSnapshot,
          birthRegSnapshot,
          marriageCertSnapshot,
          deathCertSnapshot,
          jobSnapshot,
          businessPermitSnapshot,
        ] = await Promise.all([
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

  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    Completed: 0,
    Approved: 0,
    Disapproved: 0,
  });

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const collections = [
          "birth_reg",
          "marriageCert",
          "deathCert",
          "job",
          "businessPermit",
          "appointments",
        ];

        const getStatusCount = async (collectionName, status) => {
          const collectionRef = collection(firestore, collectionName);
          const querySnapshot = await getDocs(
            query(collectionRef, where("status", "==", status))
          );
          return querySnapshot.size;
        };

        const counts = await Promise.all(
          collections.map(async (collectionName) => {
            const pendingCount = await getStatusCount(collectionName, "Pending");
            const completedCount = await getStatusCount(
              collectionName,
              "Completed"
            );
            const approvedCount = await getStatusCount(
              collectionName,
              "Approved"
            );
            const disapprovedCount = await getStatusCount(
              collectionName,
              "Disapproved"
            );

            return {
              collectionName,
              pendingCount,
              completedCount,
              approvedCount,
              disapprovedCount,
            };
          })
        );

        // Sum up counts from different collections
        const totalStatusCounts = counts.reduce(
          (accumulator, currentCount) => {
            accumulator.pending += currentCount.pendingCount;
            accumulator.completed += currentCount.completedCount;
            accumulator.approved += currentCount.approvedCount;
            accumulator.disapproved += currentCount.disapprovedCount;
            return accumulator;
          },
          { pending: 0, completed: 0, approved: 0, disapproved: 0 }
        );

        console.log("Status Counts:", totalStatusCounts);

        setStatusCounts(totalStatusCounts);
      } catch (error) {
        console.error("Error fetching status counts from Firebase:", error);
        // Handle error here
      }
    };

    fetchStatusCounts();
  }, []);

  return (
    <main className="main-container">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="container">
        <div className="header">
          <div className="icons">
            <h1>Dashboard</h1>
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-name">
              <h1>{userEmail}</h1>
            </div>
          </div>
        </div>

        <div className="mainbox">
            <div className="total">
                <div class="card-inner">
              <h3>Total No. of Service Requests</h3>
              <BsClipboardCheckFill className="total_icon" />
              <p>{Object.values(recordCounts).reduce((acc, count) => acc + count, 0)}</p>
              </div>
          </div>

            <div className="pending">
              <div class="card-inner">
              <h3>Pending</h3>
              <BsClockHistory className="pending_icon" />
              <p>{statusCounts.pending}</p>
              </div>
          </div>

            <div className="complete">
            <div class="card-inner">
              <h3>Completed</h3>
              <BsCheckCircleFill className="complete_icon" />
              <p>{statusCounts.completed}</p>
              </div>
          </div>

            <div className="disapproved">
            <div class="card-inner">
              <h3>Disapproved</h3>
              <BsXCircleFill className="dis_icon" />
              <p>{statusCounts.disapproved}</p>
              </div>
          </div>

            <div className="approved">
            <div class="card-inner">
              <h3>Approved</h3>
              <BsCheckCircleFill className="app_icon" />
              <p>{statusCounts.approved}</p>
              </div>
            </div>
        </div>

        <div className="chart">
          {recordCounts && (
            <div className="charts">
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
                        categories: [
                          "Appointments",
                          "Birth Registration",
                          "Marriage Certificate",
                          "Death Certificate",
                          "Job Application",
                          "Business Permit",
                        ],
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
                    width={500}
                    height={400}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="monthly-chart">
          <div className="col-4">
            <h6>TOTAL TRANSACTION PER MONTH</h6>
            <ReactApexChart
              options={{
                colors: ["#8884d8"],
                chart: {
                  type: "bar",
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
        
        <footer className="footer">
          <h3>All rights reserved 2023.</h3>
        </footer>
      </div>
    </main>
  );
};

export default Dashboard;
