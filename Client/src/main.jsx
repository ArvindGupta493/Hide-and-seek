import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ Import BrowserRouter
import App from './App';
import { ToastContainer } from 'react-toastify';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
      <App />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition:Bounce/>
    </BrowserRouter>
  </React.StrictMode>
);




// import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import './index.css';
// import App from './App.jsx';
// import { ThemeProvider } from './components/theme-context';
// import '@fortawesome/fontawesome-free/css/all.min.css';

// createRoot(document.getElementById('root')).render(
//     <ThemeProvider>
//     <BrowserRouter>
//         <App />
//         <ToastContainer
//         position="top-right"
//         autoClose={2000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored"
//         transition:Bounce/>
//     </BrowserRouter>
//     </ThemeProvider>
// )






