import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import notification from "../assets/icons/Notification.png";
import employee from "../assets/employee.png";
import admin from "../assets/admin.png";
import logo from "../assets/logo.png";
import { Link, useLocation, useHistory } from 'react-router-dom';
import {
  faEdit,
  faTrashAlt,
  faPlus,
  faFileAlt,
  faLock,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import "./settings.css";
import useAuth from "../components/useAuth";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AdminSettings = () => {
  const [newUser, setNewUser] = useState({ id: null, name: "", email: "" });
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");

  // Function for the account name
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserEmail = () => {
      if (user) {
        const email = user?.email; // Use optional chaining to prevent null access
        const truncatedEmail =
          email.length > 10 ? `${email.substring(0, 10)}...` : email;
        setUserEmail(truncatedEmail);
      }
    };

    fetchUserEmail();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "admin_users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    };

    fetchUsers();
  }, [db]);

  const openModal = (action, userId = null) => {
    setModalAction(action);
    if (action === "edit") {
      const userToEdit = users.find((user) => user.id === userId);
      setNewUser({ ...userToEdit });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalAction("");
    setNewUser({ name: "", email: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalAction === "add") {
      await addDoc(collection(db, "admin_users"), newUser);
    } else if (modalAction === "edit") {
      await updateDoc(doc(db, "admin_users", newUser.id), newUser);
    } else if (modalAction === "delete") {
      await deleteDoc(doc(db, "admin_users", newUser.id));
    }
    closeModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const addNewUser = async () => {
    try {
      await addDoc(collection(db, "admin_users"), newUser);
      closeModal();
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const editUser = async () => {
    try {
      await updateDoc(doc(db, "admin_users", newUser.id), newUser);
      closeModal();
    } catch (error) {
      console.error("Error editing user: ", error);
    }
  };

  const deleteUser = async () => {
    try {
      await deleteDoc(doc(db, "admin_users", newUser.id));
      closeModal();
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  return (
    <div className="container">
        <div className="headers" style={{marginLeft: "50px"}}>
          <div className="icons">
            <div style={{marginTop: "-20px"}}><h1>Settings</h1></div>
            
            <img src={notification} alt="Notification.png" className="notif" />
            <img src={logo} alt="logo" className="account-img" />
            <div className="account-names">
              <h2>{userEmail}</h2>
            </div>
          </div>
          </div>

      <div className="heading">
        <h4 style={{textAlign: "center"}}>Documentation to Maintain and Manage the Websites</h4>
      </div>

      <div className="terms">
        <img src={employee} alt="Employee Sitemap.png" className="employee" />
        <p style={{textAlign: "center", fontWeight: "bold", marginBottom: "60px", marginTop: "30px", fontSize:"22px"}}>Figure 1. MuniServe Employee Sitemap</p>
        <h6 style={{textAlign: "justify", textIndent: "40px", lineHeight: "30px", marginBottom: "70px", fontSize:"18px"}}>The “Employee” sitemap offers a comprehensive range of features and functionalities to facilitate various tasks within the system. Within the authentication section, employees can securely log in, reset passwords, and recover forgotten passwords, ensuring seamless access to their accounts. Once authenticated, the employee home page appears, displaying relevant information for the user. For services, the sitemap includes the pages "Services" with information about available services, the specific services pages for "Certification of Live Birth", "Marriage Certificate", "Death Certificate", and “Job Application”. </h6>
        <h6 style={{textAlign: "justify", textIndent: "40px", lineHeight: "30px", marginBottom: "70px", fontSize:"18px"}}>Within the services section of the employee sitemap, the "View," "Approved," "On Process," "Completed," "Rejected," and "Generate Form" functionalities. The "View" feature enables employees to access and review a diverse range of documents, applications, or information within the system, promoting transparency and easy retrieval of relevant data. The "Approved" category showcases validated documents or requests that have successfully met the necessary criteria.  the "On Process" section tracks items currently undergoing review or evaluation, providing visibility into ongoing tasks and enabling employees to monitor progress effectively. The "Completed" segment signifies finalized tasks or projects that have successfully passed through the review process, indicating readiness for further action. On the other hand, the "Rejected" category highlights items that did not meet the required standards and were declined, offering valuable insights for improvement. Lastly, the "Generate Form" functionality empowers employees to create new forms or documents within the system, streamlining data collection and ensuring consistency in information capture. The job application section provides transparency by allowing employees to track the status of their applications through stages like "On Process," "Completed," and "Rejected," facilitating effective communication and feedback.</h6> 
        <h6 style={{textAlign: "justify", textIndent: "40px", lineHeight: "30px", marginBottom: "70px", fontSize:"18px"}}>News management features enable employees to contribute to the dissemination of information by adding, editing, or deleting news articles, fostering a culture of transparency and engagement within the organization. Access to municipality information, including details about the municipality's background, mission, and contact information, promotes awareness and connectivity among employees. The settings section offers both general and account settings for employees within the system. In general settings, employees can access information about the system, FAQs for assistance, help resources, privacy policy details, and other essential guidelines. On the other hand, account settings enable employees to personalize their profiles by editing their profile picture, name, and email address. They can also change their password securely and access terms of service and cookie policy information. These settings empower employees to customize their experience, manage their information effectively, and stay informed about system policies and guidelines.   </h6>

        <img src={admin} alt="Admin Sitemap.png" className="employee" />
        <p style={{textAlign: "center", fontWeight: "bold", marginBottom: "60px", marginTop: "30px", fontSize:"22px"}}>Figure 2. MuniServe Admin Sitemap</p>
        <h6 style={{textAlign: "justify", textIndent: "40px", lineHeight: "30px", marginBottom: "70px", fontSize:"18px"}}>The “Admin” sitemap outlines a detailed structure of features and functionalities designed specifically for system administrators. It encompasses a diverse array of sections, each serving a specific purpose to facilitate efficient management of the system. The “Authentication” section is essential for login and password recovery. It allows administrators to reset the password for any user who may have forgotten it. The “Log In” prompts users to enter their credentials, whereas the “Forgot password” asks them to enter the email address associated with their account. The “Reset password” allows the user to create a new password after password verification. The admin “Dashboard” page gives a quick overview of the system's performance. It provides comprehensive analytics, including details of user activity, transactions, and reports. The “Transactions” page is dedicated to providing admins with details of the various services such as “Certificate of Live Birth," “Certificate of Marriage," “Certificate of Death,” and “Job Application” requested by users. It provides specific details, including the date of the service request, the user's name, contact number, and the status of the service requested. Administrators can process requests, verify information, generate official documents related to specific requests, and request a copy, ensuring accuracy and reliability in record-keeping. The “Appointments” page is where admins manage user appointments. It tracks upcoming appointments and displays them in a user-friendly format. Admins can export appointment data into various formats for analysis and future reference.  </h6>
        <h6 style={{textAlign: "justify", textIndent: "40px", lineHeight: "30px", marginBottom: "70px", fontSize:"18px"}}>On the “Users” page, “Mobile User” allows admins to view all the mobile users and provides an export feature so that admins can download all the mobile user data. This page provides critical insights that enable administrators to understand mobile users' behavior better. The “Web User” allows admins to add and edit web users. This page is crucial for managing Web users' access to the system. Admins can add new users, edit existing users, or delete users altogether. This page is valuable for ensuring the accuracy and completeness of user data. It enables administrators to manage web users effectively and helps prevent unauthorized access to the system. The “Reports” page provides detailed analytics about service requests, users, transactions, and many other aspects of the system's activity. Reports can be exported in various formats for analysis purposes. The “Analytics” page provides key insights into user activities within the system. The “Total Transactions Per Service” section offers insights into the most requested services and users' complete transactions for each service type. The “Number of Applications Per Service” offers information about the number of service applications received per service type. It helps administrators understand which services have the most significant impact on users and helps them allocate resources more effectively. The “Most Acquired Services Per Month” section provides information about the most frequently acquired services in a given month. The “Total Transactions Per Barangays and Total Transactions Per Barangays Based on Service Categories” offer insights into transaction activity in different barangays and how services are utilized in each barangay. The “Total Transactions Per Month Based on Status” provides insight into the usage of different types of transactions among users, whether they are pending, approved, or canceled. </h6> 
        <h6 style={{textAlign: "justify", textIndent: "40px", lineHeight: "30px", marginBottom: "70px", fontSize:"18px"}}>The “Settings” page in the admin sitemap allows users to manage system settings. Within the settings section of the sitemap, admins can access account settings, editables, help, terms and conditions, and privacy policies. Admins can create new accounts, modify existing accounts, and remove accounts as needed. The “Editables” enables admins to adjust system settings. Admins can modify settings and make changes to the system to optimize its performance and enhance the user experience. The “Help” page provides answers to frequently asked questions, general system guidelines, and best practices for working with the system. The “Terms and Conditions” sets out the ground rules and guidelines for system usage. The “Privacy Policy” outlines the system's policies and practices regarding data privacy and associated security concerns. The page sets out clear guidelines on how user data is handled, processed, and stored within the system. The "Log Out" function allows administrators to securely log out of the system, ensuring data security and privacy. By logging out, administrators can protect sensitive information and maintain the integrity of the system.</h6>

      </div>
    </div>
  );
};

export default AdminSettings;
