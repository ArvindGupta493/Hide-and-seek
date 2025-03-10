import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import style from "./Home.module.css";
import logo from "../../assets/logo.png"; 
import Hamberger from "../hamberger/hamberger";

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Player");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername); // ✅ Update username state
    }

    const token = localStorage.getItem("token");
    if (token) {
      toast.success("User Already Logged In");
    }
  }, []); 

  return (       
    <div className={style.wholePage}>   
      <Hamberger />
      <div className={style.home}>
        <div className={style.logoContainer}>
          <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
        </div>

        <div className={style.content}>
          <h2 className={style.welcomeText}>Welcome, {username}</h2>
          <p className={style.subText}>
            Invite your opponent and set up your game.
          </p>

          <button className={style.startButton} onClick={() => navigate("/start-game")}>
            START GAME
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
