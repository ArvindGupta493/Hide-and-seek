import { useNavigate } from "react-router-dom";
import style from "./AboutUs.module.css";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className={style.aboutContainer}>
      <h1>About Us</h1>
      
      <p>
        Welcome to Hide and Seek , a platform designed to bring an engaging and interactive experience to users through our innovative **Hide & Seek** game.
      </p>

      <h2>Our Mission</h2>
      <p>
        Our goal is to create a fun, immersive, and competitive experience for players while ensuring a seamless and real-time gaming environment. We strive to blend technology with traditional games to deliver an enjoyable and user-friendly platform.
      </p>

      <h2>What We Offer</h2>
      <ul>
        <li>📍 **Real-Time Gameplay** – Engage in thrilling hide-and-seek matches with live tracking.</li>
        <li>👥 **Multiplayer Experience** – Play with friends or challenge opponents in your area.</li>
        <li>📊 **Game History & Analytics** – Track your progress, wins, and game history.</li>
        <li>🔔 **Instant Notifications** – Stay updated with game invites, status updates, and challenges.</li>
      </ul>

      <h2>Why Choose Us?</h2>
      <p>
        We are passionate about creating an interactive platform that blends real-world gaming with digital convenience. Our system is built with **real-time notifications, secure authentication, and dynamic location tracking** to ensure a smooth and exciting gameplay experience.
      </p>

      <h2>Contact Us</h2>
      <p>
        Have questions or feedback? Reach out to us at **support@Hide&Seek.com** or visit our <strong>Contact Us</strong> page.
      </p>

      <button className={style.backButton} onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
};

export default AboutUs;
