import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import style from "./won.module.css";
import logo from "../../assets/logo.png"; 
import star from "../../assets/stars.png"; 
import won from "../../assets/You Won!.png"; 

const Won = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      toast.success("User Already Logged In");
    }
  }, []);

  return (
    <div className={style.home}>
      <div className={style.logoContainer}>
        <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
      </div>

      <div className={style.content}>
        <h2 className={style.welcomeText}>GAME OVER!</h2>
        <p className={style.subText}>Time is up.......</p>

        <div className={style.wonstar}>
          <img src={star} alt="Stars Background" className={style.starsImage} />
          <img src={won} alt="You Won!" className={style.wonImage} />
        </div>
        
        <button className={style.startButton} onClick={() => navigate("/start-game")}>
          START NEW GAME
        </button>
      </div>
    </div>
  );
};

export default Won;
