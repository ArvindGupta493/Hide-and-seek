import { Routes, Route } from "react-router-dom";

import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import LandingPage from "./components/LandingPage/LandingPage";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Forgetpassword from "./components/forgot-password/Forgetpassword";
import Verification from "./components/verification/verification";
import ResetPassword from "./components/reset-password/Resetpassword";
import Home from "./components/Home/Home";
import StartGame from "./components/start game/start-game";
import Gamestarted from "./components/Game-started/GameStarted";
import CountdownPage from "./components/countdown/countdown";
import GameInPRogress from "./components/game-in-progress/game-in-progress";
import Won from "./components/game-over-won/won";
import Confirmation from "./components/confirmation/confirmation";
import Lost from "./components/game-over-lost/lost";
import Cheater from "./components/cheater/cheater";
import Pause from "./components/pause/pause";
import Hamberger from "./components/hamberger/hamberger";
import AboutUs from "./components/AboutUs/AboutUs";
import ContactUs from "./components/ContactUs/ContactUs";
import MyProfile from "./components/myProfile/myProfile"; 
import GameHistory from "./components/gameHistroy/gameHistroy";
import Policies from "./components/policies/policies";

import AdminDashboard from "./admin/adminDashboard/AdminDashboard";
import Users from "./admin/users/Users";
import Dashboard from "./admin/Dashboard/Dashboard";
import Settings from "./admin/settings/Settings";
import Notifications from "./admin/notifications/Notifications";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forget-password" element={<Forgetpassword />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={<Home />} />
      {/* <Route path="/start-game" element={<StartGame />} /> */}
      <Route path="/game-started" element={<Gamestarted />} />
      <Route path="/countdown" element={<CountdownPage />} />
      <Route path="/game-in-progress" element={<GameInPRogress />} />
      <Route path="/win" element={<Won />} />
      <Route path="/loss" element={<Lost />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/cheater" element={<Cheater />} />
      <Route path="/pause" element={<Pause />} />
      <Route path="/hamberger" element={<Hamberger />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/my-account" element={<MyProfile />} />
      <Route path="/game-history" element={<GameHistory />} />
      <Route path="/privacy-policy" element={<Policies />} />

      <Route path="/start-game" element={<StartGame userId={localStorage.getItem("userId")} />} />
      <Route path="/adminDashboard/*" element={<AdminDashboard />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/settings" element={<Settings />} />
      <Route path="/admin/notifications" element={<Notifications />} />
    </Routes>
  );
};

export default App;