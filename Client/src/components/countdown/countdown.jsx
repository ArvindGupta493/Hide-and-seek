import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "./countdown.module.css";
import logo from "../../assets/logo.png";
import { toast } from "react-toastify";


const CountdownPage = () => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => navigate("/game-in-progress"), 1000);
      toast.success("Game start succcessfully");
      
    }
  }, [count, navigate]);

  return (
    <div className={style.countdownContainer}>
      {/* Semi-Circle Logo Container */}
      <div className={style.logoContainer}>
        <div className={style.logo}>
            <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
        </div>
      </div>

      <h2 className={style.subHeading}>It’s Hide & Seek Time</h2>
      <h1 className={style.mainHeading}>GAME STARTING</h1>
      <p className={style.count}>{count > 0 ? count : "GO"}</p>
    </div>
  );
};

export default CountdownPage;



