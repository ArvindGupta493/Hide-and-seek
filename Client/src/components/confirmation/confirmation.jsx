import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import style from "./confirmation.module.css";
import logo from "../../assets/logo.png";

const Confirmation = () => {
  const navigate = useNavigate();
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [error, setError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const sendChoice = async () => {
    if (!selectedChoice) {
      setError("Please select 'YES' or 'NO' to continue.");
      return;
    }

    try {
      const result = selectedChoice === "hide" ? "win" : "loss"; // Mapping choices
      const response = await fetch("http://localhost:5000/api/user/win-loss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ result }),
      });

      if (!response.ok) throw new Error("Failed to send your choice.");

      const data = await response.json();
      console.log("Choice submitted successfully:", data);

      setIsWaiting(true);

      if (result === "win") {
        navigate("/won", { state: data.stats }); // Redirect to win screen
      } else {
        navigate(-1); // Go back to previous page on loss
      }
    } catch (err) {
      setError(`Error sending choice: ${err.message}`);
    }
  };
 
  return (
    <div className={style.wrapper}>
      <div className={style.logoContainer}>
        <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
      </div>

      <div className={style.container}>
        <h1 className={style.title}>OH NO!</h1>
        <p>Did the server find you?</p>

        <div className={style.choiceContainer}>
          <button
            className={`${style.choiceButton} ${selectedChoice === "hide" ? style.selected : ""}`}
            onClick={() => setSelectedChoice("hide")}
          >
            YES 
          </button>

          <div className={style.box}>
            <p> </p>
          </div>

          <button
            className={`${style.choiceButtons} ${selectedChoice === "seek" ? style.selected : ""}`}
            onClick={() => setSelectedChoice("seek")}
          >
            NO
          </button>
        </div>

        {error && <p className={style.error}>{error}</p>}

        <button
          className={style.sendButton}
          onClick={sendChoice}
          disabled={isWaiting}
        >
          {isWaiting ? "WAITING FOR RESPONSE..." : "Send" }
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
