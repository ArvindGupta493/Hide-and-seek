// GameStarted.jsx

import { useNavigate } from "react-router-dom";

import style from "./cheater.module.css";
import logo from "../../assets/logo.png";

const Cheater = () => {
  const navigate = useNavigate();

  return (
    <div className={style.wrapper}>
      <div className={style.logoContainer}>
        <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
      </div>

      <div className={style.container}>
        <h1 className={style.title}>Ummm......</h1>

        <div className={style.sentence}>   
            <p>Cheater Alert!</p>
            <p>One of you is lying..</p>
            <p>We hope none of you are crying!</p>
        </div>

        <button
          className={style.sendButton}
          onClick={() => navigate("/start-game")}
        >
          START NEW GAME
        </button>
      </div>
    </div>
  );
};

export default Cheater;
