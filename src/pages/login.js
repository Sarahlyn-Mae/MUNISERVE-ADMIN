import logo from "../assets/logo.png";
import slider1 from "../assets/slider1.png";
import slider2 from "../assets/slider2.png";
import slider3 from "../assets/slider3.png";
import "../styles/style.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sign in the user with the provided email and password
      await signInWithEmailAndPassword(auth, email, password);

      // If successful, navigate to the dashboard
      history.push("/dashboard");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  const images = [slider1, slider2, slider3];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextImage = (currentImage + 1) % images.length;
      setCurrentImage(nextImage);
    }, 2000);

    return () => {
      clearInterval(timer);
    };
  }, [currentImage, images]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const usersRef = collection(firestore, "admin_users");
        const querySnapshot = await getDocs(usersRef);
        const users = querySnapshot.docs.map((doc) => doc.data());
        const userExists = users.some((user) => user.email === email);
        if (!userExists) {
          setError("Invalid email or password");
        }
      } catch (error) {
        console.error("Error checking user: ", error);
      }
    };

    if (email !== "") {
      checkUser();
    }
  }, [email, firestore]);

  return (
    <div className="App">
      <div className="App-slider">
        <img src={logo} className="App-logo" alt="logo" />

        <div className="auto-play-slider">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Image ${index + 1}`}
              className={`slide ${index === currentImage ? "active" : ""}`}
            />
          ))}
        </div>

        <h5>
          MuniServe ensures secure transaction<br></br> and great user
          experience.
        </h5>
      </div>

      <div className="Form">
        <h3>Welcome to MuniServe!</h3>
        <h6>Please login to continue.</h6>
        <div>
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="icon-input">
              <FaEnvelope className="input-icons" style={{ marginLeft: '3px'}}/>
              <input
                className="input-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="icon-input">
              <FaLock className="input-icons" style={{ marginLeft: '3px'}}/>
              <input
                className="input-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="error-popup">{error}</div>}

            <button type="submit" className="my-button">
              Login
            </button>
          </form>
          
          <div className="forgot-password">
            <Link to="/forgotpassword">Forgot Password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;