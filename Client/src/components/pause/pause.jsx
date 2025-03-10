import { useNavigate } from "react-router-dom";
import style from "./Pause.module.css";
import logo from "../../assets/logo.png";

const Pause = () => {
  const navigate = useNavigate();

  return (
    <div className={style.wrapper}>
      <div className={style.logoContainer}>
        <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
      </div>

      <div className={style.container}>
        <h1 className={style.title}>Ummm......</h1>

        <div className={style.sentence}>   
            <p>Why stop then?</p>
        </div>

        <button
          className={style.resume}
          onClick={() => navigate("/start-game")}      //change the route to go back continue the game
        >
          RESUME GAME
        </button>

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

export default Pause;
