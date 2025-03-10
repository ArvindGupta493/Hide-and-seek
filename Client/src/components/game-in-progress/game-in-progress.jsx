import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import style from "./game-in-progress.module.css";
import { toast } from "react-toastify";
import { GoogleMap, Circle, LoadScript } from "@react-google-maps/api";
import axios from "axios";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "15px",
};

const CountdownPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State variables
  const [gameDuration, setGameDuration] = useState(() => {
    return parseInt(localStorage.getItem("gameDuration")) || null;
  });

  const [intervalDuration, setIntervalDuration] = useState(() => {
    return parseInt(localStorage.getItem("intervalDuration")) || 0;
  });

  const [remainingClicks, setRemainingClicks] = useState(0);
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });

  // Refs for timers
  const gameTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const isPausedRef = useRef(false); // Track if the timers are paused

  // Fetch game settings on mount
  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/duration-and-interval", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
  
        if (response.data.success) {
          const { duration, interval } = response.data.settings;
          setGameDuration((prev) => prev ?? duration * 60); // Only update if it's null
          setRemainingClicks(interval);
        } else {
          toast.error("Failed to fetch game settings.");
        }
      } catch (error) {
        toast.error("Error fetching game settings.");
        console.error("Error fetching game settings:", error);
      }
    };
  
    fetchGameSettings();
  }, []);
  

  // Save timer values to localStorage
  useEffect(() => {
    if (gameDuration !== null) {
      localStorage.setItem("gameDuration", gameDuration);
    }
    localStorage.setItem("intervalDuration", intervalDuration);
  }, [gameDuration, intervalDuration]);

  // Update user location
  useEffect(() => {
    const updateLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

          await fetch("http://localhost:5000/api/user/update-location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });
        });
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 30000);
    return () => clearInterval(interval);
  }, []);

  // Track live location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get live location.");
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Handle game countdown
  useEffect(() => {
    if (isPausedRef.current) return;

    if (gameDuration > 0) {
      gameTimerRef.current = setTimeout(() => setGameDuration((prev) => prev - 1), 1000);
    } else if (gameDuration === 0) {
      clearTimeout(gameTimerRef.current);
      toast.success("Game Over!");
      setTimeout(() => navigate("/won"), 2000);
    }

    return () => clearTimeout(gameTimerRef.current);
  }, [gameDuration, navigate]);

  // Handle interval countdown
  useEffect(() => {
    if (isPausedRef.current) return;

    if (intervalDuration > 0) {
      intervalRef.current = setTimeout(() => setIntervalDuration((prev) => prev - 1), 1000);
    }

    return () => clearTimeout(intervalRef.current);
  }, [intervalDuration]);

  // Handle pause when navigating to confirmation
  useEffect(() => {
    if (location.pathname === "/confirmation") {
      isPausedRef.current = true;
      clearTimeout(gameTimerRef.current);
      clearTimeout(intervalRef.current);
    } else {
      isPausedRef.current = false;
    }
  }, [location.pathname]);

  // Handle "END GAME" button
  const handleEndGame = () => {
    toast.info("Game Paused");
    clearTimeout(gameTimerRef.current);
    clearTimeout(intervalRef.current);
    navigate("/confirmation");
  };

  // Handle interval button click
  const handleIntervalClick = () => {
    if (remainingClicks > 0 && intervalDuration === 0) {
      setIntervalDuration(120);
      setRemainingClicks((prev) => prev - 1);
      toast.info(`You can start interval ${remainingClicks - 1} more time(s).`);
    }
  };

  return (
    <div className={style.countdownContainer}>
      <div className={style.header}>
        <p>
          Game Duration<br />
          <span>
            {gameDuration !== null
              ? `${Math.floor(gameDuration / 60)}:${(gameDuration % 60)
                  .toString()
                  .padStart(2, "0")} left`
              : "Loading..."}
          </span>
        </p>
        <p>
          Interval Duration {remainingClicks > 0 ? `(${remainingClicks} left)` : "(Disabled)"}<br />
          <span>
            {Math.floor(intervalDuration / 60)}:{(intervalDuration % 60).toString().padStart(2, "0")} left
          </span>
        </p>
      </div>

      {/* Google Map with Live Location */}
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={userLocation} zoom={15}>
          <Circle
            center={userLocation}
            radius={500}
            options={{ strokeColor: "#00ff00", fillColor: "#00ff0050" }}
          />
        </GoogleMap>
      </LoadScript>

      <div className={style.buttonArea}>
        <button className={style.endGameButton} onClick={handleEndGame}>
          END GAME
        </button>
        <button
          className={style.endGameButton}
          onClick={handleIntervalClick}
          disabled={remainingClicks === 0 || intervalDuration > 0}
        >
          Interval {remainingClicks > 0 }
          {/* Interval {remainingClicks > 0 ? `(${remainingClicks} left)` : "(Disabled)"} */}
        </button>
      </div>
    </div>
  );
};

export default CountdownPage;





















































  














































































































// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import style from "./game-in-progress.module.css";
// import { toast } from "react-toastify";
// import { GoogleMap, Circle, LoadScript } from "@react-google-maps/api";
// import axios from "axios";

// const mapContainerStyle = {
//   width: "100%",
//   height: "400px",
//   borderRadius: "15px",
// };

// const CountdownPage = () => {
//   const navigate = useNavigate();

//   // State variables
//   const [gameDuration, setGameDuration] = useState(0);
//   const [intervalDuration, setIntervalDuration] = useState( 0);
//   const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
//   // const [opponentLocation, setOpponentLocation] = useState(null);
//     const [remainingClicks, setRemainingClicks] = useState(0);
  
//   // Refs for timers
//   const gameTimerRef = useRef(null);
//   const intervalRef = useRef(null);


//   useEffect(() => {
//     let locationInterval;
  
//     const sendLocationToServer = async () => {
//       try {
//         await axios.post(
//           "http://localhost:5000/api/user/update-location",
//           { lat: userLocation.lat, lng: userLocation.lng },
//           { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//         );
//       } catch (error) {
//         console.error("Failed to send location:", error);
//       }
//     };
  
//     if (intervalDuration > 0) {
//       locationInterval = setInterval(() => {
//         sendLocationToServer();
//       }, 120000); // Send location every 2 minutes
//     }
  
//     return () => clearInterval(locationInterval);
//   }, [userLocation, intervalDuration]);
  
//   // Fetch opponent location every interval
//   // useEffect(() => {
//   //   const fetchOpponentLocation = async () => {
//   //     try {
//   //       const response = await axios.get("http://localhost:5000/api/user/get-user-location", {
//   //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   //       });
  
//   //       if (response.data.success) {
//   //         setOpponentLocation(response.data.location);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching opponent's location:", error);
//   //     }
//   //   };
  
//   //   const opponentInterval = setInterval(fetchOpponentLocation, intervalDuration * 1000); // Fetch at user-set interval
  
//   //   return () => clearInterval(opponentInterval);
//   // }, [intervalDuration]);
  
//   // Fetch game settings from server
//   useEffect(() => {
//     const fetchGameSettings = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/user/duration-and-interval", {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });

//         if (response.data.success) {
//           const { duration, interval } = response.data.settings;
//           setGameDuration(duration * 60);
//           setIntervalDuration(0); // Initially 0, set when the button is clicked
//           setRemainingClicks(interval); // Number of times the button can be clicked
//         } else {
//           toast.error("Failed to fetch game settings.");
//         }
//       } catch (error) {
//         toast.error("Error fetching game settings.");
//         console.error("Error fetching game settings:", error);
//       }
//     };

//     fetchGameSettings();
//   }, []);

//   // Track live location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       const watchId = navigator.geolocation.watchPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           toast.error("Failed to get live location.");
//         },
//         { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
//       );

//       return () => navigator.geolocation.clearWatch(watchId);
//     }
//   }, []);

//   // Handle game countdown

//   // useEffect(() => {
//   //   if (gameDuration > 0) {
//   //     gameTimerRef.current = setTimeout(() => setGameDuration((prev) => prev - 1), 1000);
//   //   } else if (gameDuration === 0 && gameDuration !== null) {
//   //     toast.success("Game Over!");
//   //     // navigate("/won");
//   //   }
//   //   return () => clearTimeout(gameTimerRef.current);
//   // }, [gameDuration, navigate]);


//   useEffect(() => {
//     if (gameDuration > 0) {
//       gameTimerRef.current = setTimeout(() => setGameDuration((prev) => prev - 1), 1000);
//     } else if (gameDuration === 0 && gameDuration !== null) {
//       if (gameTimerRef.current) {
//         clearTimeout(gameTimerRef.current); // Clear timeout before navigating
//       }
//       toast.success("Game Over!");
//       setTimeout(() => navigate("/won"), 10000); // Delay navigation slightly
//     }
  
//     return () => clearTimeout(gameTimerRef.current);
//   }, [gameDuration, navigate]);
  
// // it is still transfering the to the won page after 1 second directly before the gameduration hit 0 
//   // Handle interval countdown
//   useEffect(() => {
//     if (intervalDuration > 0) {
//       intervalRef.current = setTimeout(() => setIntervalDuration((prev) => prev - 1), 1000);
//     } else {
//       clearTimeout(intervalRef.current); // Stop the countdown at 00:00
//       toast.info("Interval Over! You can update your location now.");
//     }
  
//     return () => clearTimeout(intervalRef.current);
//   }, [intervalDuration]);
  
//   // Handle "END GAME" button
//   const handleEndGame = () => {
//     toast.info("Game Ended");
//     clearTimeout(gameTimerRef.current);
//     clearTimeout(intervalRef.current);
//     navigate("/confirmation");
//   };

//     const handleIntervalClick = () => {
//       if (remainingClicks > 0) {
//         setIntervalDuration(120); // Start 2-minute countdown
//         setRemainingClicks((prev) => prev - 1);
//         toast.info(`You can start interval ${remainingClicks - 1} more time(s).`);
//       }
//     };

//   return (
//     <div className={style.countdownContainer}>
//       <div className={style.header}>
//         <p>
//           Game Duration<br />
//           <span>
//             {Math.floor(gameDuration / 60)}:{(gameDuration % 60).toString().padStart(2, "0")} left
//           </span>
//         </p>
//         <p>
//           Interval Duration<br />
//           <span>
//             {Math.floor(intervalDuration / 60)}:{(intervalDuration % 60).toString().padStart(2, "0")} left
//           </span>
//         </p>
//       </div>

//       {/* Google Map with Live Location */}
//       <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
//       <GoogleMap mapContainerStyle={mapContainerStyle} center={userLocation} zoom={15}>
//        {/* User's Location */}
//       <Circle
//         center={userLocation}
//         radius={500}
//         options={{ strokeColor: "#00ff00", fillColor: "#00ff0050" }}
//       />

//        {/* Opponent's Location */}
//        {/* {opponentLocation && (
//       <Circle
//         center={opponentLocation}
//         radius={500}
//         options={{ strokeColor: "#ff0000", fillColor: "#ff000050" }}
//       />
//       )} */}
//       </GoogleMap>
//       </LoadScript>
//       <div className={style.buttonArea}>     
//           <button className={style.endGameButton} onClick={handleEndGame}>END GAME</button>
//           <button
//             className={style.endGameButton}
//             onClick={handleIntervalClick}
//             disabled={remainingClicks === 0}
//           >
//           Interval {remainingClicks > 0 }
//           </button>
//          </div>
//     </div>
//   );
// };

// export default CountdownPage;


// // why the gameDuration is not working properly and directly redirectly to the "/won" page 

// // when interval button is clicked it will start the interval duration of 2 minutes and can be clicked nuber of times interval was set by the user after it will became disable and after each click it toast how many time it has remain to again interval

// // update interval duration as it is showing the selected duration as minutes but instead selected interval are the time it is alowed to reset the 2 minutes time is allowed after that it will remain 00.00  


// // the google map is not working and showing the live location of the user need to check or replace with laflet