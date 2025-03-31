// GameStarted.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "./GameStarted.module.css";
import logo from "../../assets/logo.png";

const GameStarted = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [error, setError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => setError(`Location access denied: ${err.message}`),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported in this browser.");
    }
  }, []);

  const sendChoice = async () => {
    if (!selectedChoice) {
      setError("Please select 'Hide' or 'Seek' to continue.");
      return;
    }

    if (!location) {
      setError("Location data is not available.");
      return;
    }

    try {
      setIsWaiting(true);
      const response = await fetch("http://localhost:5000/api/user/choice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          choice: selectedChoice,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      if (!response.ok) throw new Error("Failed to send your choice.");

      const data = await response.json();
      console.log("Choice submitted successfully:", data);
      await waitForOpponent();
    } catch (err) {
      setError(`Error sending choice: ${err.message}`);
      setIsWaiting(false);
    }
  };

  const waitForOpponent = async () => {
    try {
      const checkAcceptance = async () => {
        const response = await fetch("http://localhost:5000/api/user/game-start-now", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ choice: selectedChoice }),
        });

        if (response.ok) {
          const gameData = await response.json();
          navigate("/countdown", { state: gameData });
        } else {
          setTimeout(checkAcceptance, 5000);
        }
      };

      await checkAcceptance();
    } catch (err) {
      setError(`Error starting the game: ${err.message}`);
      setIsWaiting(false);
    }
  };

  return (
    <div className={style.wrapper}>
      <div className={style.logoContainer}>
        <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
      </div>

      <div className={style.container}>
        <h1 className={style.title}>DO YOU WANT TO</h1>

        <div className={style.choiceContainer}>
          <button className={`${style.choiceButton} ${selectedChoice === "hide" ? style.selected : ""}`}
            onClick={() => setSelectedChoice("hide")}>
            HIDE
          </button>
          
          <div className={style.box}>
            <p>    </p>
          </div>
          
          <button className={`${style.choiceButtons} ${selectedChoice === "seek" ? style.selected : ""}`}
            onClick={() => setSelectedChoice("seek")}>
            SEEK
          </button>
        </div>

        <div className={style.sentence}>   
            <p>Send an invitation to your opponent.</p>
            <p>Once accepted, the game will start.</p>
            <p className={style.highlight}>Enjoy your time in the city!</p>
        </div>

        {error && <p className={style.error}>{error}</p>}

        <button
          className={style.sendButton}
          onClick={sendChoice}
          disabled={isWaiting}
        >
          {isWaiting ? "WAITING FOR OPPONENT..." : "SEND"}
        </button>
      </div>
    </div>
  );
};

export default GameStarted;



























































// // GameStarted.jsx
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// import style from "./GameStarted.module.css";
// import logo from "../../assets/logo.png";

// const GameStarted = () => {
//   const navigate = useNavigate();
//   const [location, setLocation] = useState(null);
//   const [selectedChoice, setSelectedChoice] = useState(null);
//   const [error, setError] = useState("");
//   const [isWaiting, setIsWaiting] = useState(false);

//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(() => setError(""), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [error]);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       const watchId = navigator.geolocation.watchPosition(
//         (position) => {
//           setLocation({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           });
//         },
//         (err) => setError(`Location access denied: ${err.message}`),
//         { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
//       );

//       return () => navigator.geolocation.clearWatch(watchId);
//     } else {
//       setError("Geolocation is not supported in this browser.");
//     }
//   }, []);

//   const sendChoice = async () => {
//     if (!selectedChoice) {
//       setError("Please select 'Hide' or 'Seek' to continue.");
//       return;
//     }

//     if (!location) {
//       setError("Location data is not available.");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/user/choice", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           choice: selectedChoice,
//           latitude: location.latitude,
//           longitude: location.longitude,
//         }),
//       });
//       navigate("/countdown");           // this line need to be remove for corrtly usage     

//       if (!response.ok) throw new Error("Failed to send your choice.");

//       const data = await response.json();
//       console.log("Choice submitted successfully:", data);
//       setIsWaiting(true);
//       await waitForOpponent();
//     } catch (err) {
//       setError(`Error sending choice: ${err.message}`);
//     }
//   };

//   const waitForOpponent = async () => {
//     try {
//       const checkAcceptance = async () => {
//         const response = await fetch(" http://localhost:5000/api/user/game-start-now", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({ choice: selectedChoice }),
//         });

//         if (response.ok) {
//           const gameData = await response.json();
//           navigate("/countdown", { state: gameData });
//         } else {
//           setTimeout(checkAcceptance, 5000);
//         }
//       };

//       await checkAcceptance();
//     } catch (err) {
//       setError(`Error starting the game: ${err.message}`);
//     }
//   };

//   return (
//     <div className={style.wrapper}>
//       <div className={style.logoContainer}>
//         <img src={logo} alt="Hide & Seek Logo" className={style.logo} />
//       </div>

//       <div className={style.container}>
//         <h1 className={style.title}>DO YOU WANT TO</h1>

//         <div className={style.choiceContainer}>
//           <button  className={`${style.choiceButton} ${  selectedChoice === "hide" ? style.selected : ""  }`}
//             onClick={() => setSelectedChoice("hide")} >
//             HIDE
//           </button>
          

//           <div className={style.box}>
//             <p>    </p>
//           </div>
          
          
//           <button className={`${style.choiceButtons} ${ selectedChoice === "seek" ? style.selected : "" }`}
//             onClick={() => setSelectedChoice("seek")} >
//             SEEK
//           </button>
//         </div>

//         <div className={style.sentence}>   
//             <p>Send an invitation to your opponent.</p>
//             <p>Once accepted, the game will start.</p>
//             <p className={style.highlight}>Enjoy your time in the city!</p>
//         </div>

//         {error && <p className={style.error}>{error}</p>}

//         <button
//           className={style.sendButton}
//           onClick={sendChoice}
//           disabled={isWaiting}
//         >
//           {isWaiting ? "WAITING FOR OPPONENT..." : "SEND"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GameStarted;
