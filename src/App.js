import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import { Bar, Pie } from "react-chartjs-2";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import EnrollmentReport from "./pages/EnrollmentReport.js";
import EnrollmentSuccess from "./pages/EnrollmentSuccess.js";
import EnrollmentFailure from "./pages/EnrollmentFailure.js";
import VerificationReport from "./pages/VerificationReport.js";
import VerificationSuccess from "./pages/VerificationSuccess.js";
import VerificationFailure from "./pages/VerificationFailure.js";
import TransactionDetails from "./pages/TransactionDetails.js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [openMenu, setOpenMenu] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);


  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://kaizenvoiz.ai/dashboardwebapi/api/Dashboard/overall-full-report");
        const data = await response.json();
        console.log("Verification Report API data:", data);
        setReportData(data || []);
      } catch (error) {
        console.error("Error fetching verification report:", error);
      }
    };

    fetchData();
  }, []);




  useEffect(() => {
    fetch('https://kaizenvoiz.ai/dashboardwebapi/api/Dashboard/summary')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching API:", err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  const [todaySummary, setTodaySummary] = useState(null);

  useEffect(() => {
    fetch('https://kaizenvoiz.ai/dashboardwebapi/api/Dashboard/daily-summary')
      .then((res) => res.json())
      .then((data) => {
        setTodaySummary(data);
      })
      .catch((err) => console.error("Error fetching todays-summary:", err));
  }, []);

  if (loading) {
    return <h3 className="text-center mt-5">Loading Dashboard...</h3>;
  }
  if (error) {
    return <h3 className="text-center text-danger mt-5">{error}</h3>;
  }

  const data = {
    labels: ["Enrollment Success", "Enrollment Failure", "Verification Success", "Verification Failure"],
    datasets: [
      {
        label: "Report",
        data: [
          summary?.totalEnrollPass || 0,
          summary?.totalEnrollFail || 0,
          summary?.totalVerifyPass || 0,
          summary?.totalVerifyFail || 0
        ],
        backgroundColor: ["#28a745", "#dc3545", "#007bff", "#ffc107"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Report" },
    },
  };

  const pieData = {
    labels: ["CheckIn Success", "CheckIn Failure", "CheckOut Success", "CheckOut Failure"],
    datasets: [
      {
        data: [
          todaySummary?.checkIn || 0,
          todaySummary?.checkInfailed || 0,
          todaySummary?.checkOut || 0,
          todaySummary?.checkOutfailed || 0,
        ],
        backgroundColor: ["#28a745", "#dc3545", "#007bff", "#ffc107"],
        hoverOffset: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Today's Summary" },
    },
  };

  return (
    <Router>
      <div className="container-fluid p-0">
        <nav
          className="navbar navbar-expand-lg shadow-sm border-bottom d-flex align-items-center justify-content-between"
          style={{
            height: "95px",
            background:
              "linear-gradient(90deg, rgb(243, 249, 255) 0%, rgb(125 137 149) 100%)",
            borderBottom: "2px solid var(--bs-border-color)",
            borderRadius: 0,
            padding: "0 15px",
          }}
        >
          <button
            className="btn d-md-none"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <i className="bi bi-list fs-2"></i>
          </button>

          <a className="navbar-brand d-flex align-items-center d-none d-sm-flex" href="https://kaizenvoiz.com/">
            <img
              src={`${process.env.PUBLIC_URL}/logoo.png`}
              alt="Logo"
              className="img-fluid"
              style={{
                borderRadius: "50%",
                width: "150px",
                height: "83px",
              }}
            />
          </a>



          <div className="mx-auto d-none d-md-block">
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "700",
                color: "#2c3e50",
                letterSpacing: "2px",
                textTransform: "uppercase",
                textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
                margin: 0,
              }}
            >
              Dashboard
            </h2>
          </div>


          <div
            className="d-flex align-items-center flex-shrink-1"
            style={{
              backgroundColor: "#fff",
              borderRadius: "50px",
              border: "1px solid var(--bs-border-color)",
              cursor: "pointer",
              padding: "4px 10px", // reduce padding on mobile
              gap: "4px",           // reduce gap between icon & text
              fontSize: "0.9rem"
            }}
          >
            <i className="bi bi-person-circle fs-5 text-primary"></i>
            <span className="fw-medium">Admin</span>
          </div>



        </nav>

        <style>
          {`
            @media (max-width: 576px) {
              .navbar-brand img {
                width: 140px !important;
              }
            }
          `}
        </style>

        <div className="row g-0">
          {/* Sidebar */}
          <div

            className={`sidebar pt-4 shadow-sm d-flex flex-column
    ${showSidebar ? "show-sidebar" : ""}
  `}
            style={{
              backgroundColor: "#1c2b36",
              borderRight: "2px solid #162229",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {/* Menu Title */}
            <h6
              className="fw-bold text-light text-center mb-4"
              style={{ fontSize: "1.2rem", letterSpacing: "0.5px" }}
            >
              Menu
            </h6>

            {/* Main Nav */}
            <div className="flex-grow-1 overflow-auto">
              <ul
                className="nav flex-column px-2"
                style={{ gap: "20px", paddingBottom: "2rem" }}
              >
                {/* Home */}
                <li className="nav-item">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center fw-semibold px-2 py-2 rounded ${isActive ? "active-link" : ""
                      }`
                    }
                    style={({ isActive }) => ({
                      color: isActive ? "#ffffff" : "#b0bec5",
                      fontSize: "1rem",
                      transition: "0.3s",
                      textDecoration: "none",
                    })}
                    onClick={() => setShowSidebar(false)}
                  >
                    <i className="bi bi-house me-2 text-primary"></i> Home
                  </NavLink>
                </li>

                {/* Enrollment */}
                <li className="nav-item">
                  <div
                    className="d-flex justify-content-between align-items-center fw-semibold px-2 py-2 rounded"
                    style={{
                      fontSize: "1rem",
                      color: openMenu === "enrollment" ? "#1abc9c" : "#b0bec5",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                    onClick={() =>
                      setOpenMenu(openMenu === "enrollment" ? null : "enrollment")
                    }
                  >
                    <span>
                      <i className="bi bi-person-check me-2"></i> Enrollment
                    </span>
                    <i
                      className={`bi ${openMenu === "enrollment" ? "bi-chevron-up" : "bi-chevron-down"
                        }`}
                    ></i>
                  </div>

                  {openMenu === "enrollment" && (
                    <ul className="nav flex-column ms-3 mt-2" style={{ gap: "10px" }}>
                      <li>
                        <NavLink
                          to="/enrollment-report"
                          className="nav-link px-2 text-light rounded"
                          style={({ isActive }) => ({
                            backgroundColor: isActive ? "#2a3a47" : "transparent",
                            borderRadius: "6px",
                            transition: "0.3s",
                          })}
                          onClick={() => setShowSidebar(false)}
                        >
                          Enrollment Report
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/enrollment-success"
                          className="nav-link px-2 text-light rounded"
                          style={({ isActive }) => ({
                            backgroundColor: isActive ? "#2a3a47" : "transparent",
                            borderRadius: "6px",
                            transition: "0.3s",
                          })}
                          onClick={() => setShowSidebar(false)}
                        >
                          Success
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/enrollment-failure"
                          className="nav-link px-2 text-light rounded"
                          style={({ isActive }) => ({
                            backgroundColor: isActive ? "#2a3a47" : "transparent",
                            borderRadius: "6px",
                            transition: "0.3s",
                          })}
                          onClick={() => setShowSidebar(false)}
                        >
                          Failure
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Verification */}
                <li className="nav-item">
                  <div
                    className="d-flex justify-content-between align-items-center fw-semibold px-2 py-2 rounded"
                    style={{
                      fontSize: "1rem",
                      color: openMenu === "verification" ? "#e67e22" : "#b0bec5",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                    onClick={() =>
                      setOpenMenu(openMenu === "verification" ? null : "verification")
                    }
                  >
                    <span>
                      <i className="bi bi-shield-check me-2"></i> Verification
                    </span>
                    <i
                      className={`bi ${openMenu === "verification" ? "bi-chevron-up" : "bi-chevron-down"
                        }`}
                    ></i>
                  </div>

                  {openMenu === "verification" && (
                    <ul className="nav flex-column ms-3 mt-2" style={{ gap: "10px" }}>
                      <li>
                        <NavLink
                          to="/verification-report"
                          className="nav-link px-2 text-light rounded"
                          style={({ isActive }) => ({
                            backgroundColor: isActive ? "#2a3a47" : "transparent",
                            borderRadius: "6px",
                            transition: "0.3s",
                          })}
                          onClick={() => setShowSidebar(false)}
                        >
                          Verification Report
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/verification-success"
                          className="nav-link px-2 text-light rounded"
                          style={({ isActive }) => ({
                            backgroundColor: isActive ? "#2a3a47" : "transparent",
                            borderRadius: "6px",
                            transition: "0.3s",
                          })}
                          onClick={() => setShowSidebar(false)}
                        >
                          Success
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/verification-failure"
                          className="nav-link px-2 text-light rounded"
                          style={({ isActive }) => ({
                            backgroundColor: isActive ? "#2a3a47" : "transparent",
                            borderRadius: "6px",
                            transition: "0.3s",
                          })}
                          onClick={() => setShowSidebar(false)}
                        >
                          Failure
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Transaction Details */}
                <li className="nav-item">
                  <NavLink
                    to="/transaction-details"
                    end
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center fw-semibold px-2 py-2 rounded ${isActive ? "active-link" : ""
                      }`
                    }
                    style={({ isActive }) => ({
                      color: isActive ? "#ffffff" : "#b0bec5",
                      fontSize: "1rem",
                      transition: "0.3s",
                      textDecoration: "none",
                    })}
                    onClick={() => setShowSidebar(false)}
                  >
                    <i className="bi bi-journal-text me-2 text-info"></i> Transaction
                    Details
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-12 col-sm-9 col-md-10 p-3">


            <Routes>

              <Route
                index
                element={
                  <>

                    <div className="row g-4 mt-2">
                      <div className="col-md-3">
                        <div className="card shadow rounded-3 position-relative hover-bounce" style={{ backgroundColor: "#d4edda", color: "#155724" }}>
                          <span className="position-absolute top-0 start-0 mt-2 ms-2 badge bg-dark" style={{ fontSize: "0.8rem" }}>
                            Total
                          </span>
                          <div className="card-body text-center">
                            <h5>{summary.totalEnrollPass}</h5>
                            <p>Enrollment Success</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="card shadow rounded-3 position-relative hover-bounce" style={{ backgroundColor: "#f8d7da", color: "#721c24" }}>
                          <span className="position-absolute top-0 start-0 mt-2 ms-2 badge bg-dark" style={{ fontSize: "0.8rem" }}>
                            Total
                          </span>
                          <div className="card-body text-center">
                            <h5>{summary?.totalEnrollFail || 0}</h5>
                            <p>Enrollment Failure</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="card shadow rounded-3 position-relative hover-bounce" style={{ backgroundColor: "#d1ecf1", color: "#0c5460" }}>
                          <span className="position-absolute top-0 start-0 mt-2 ms-2 badge bg-dark" style={{ fontSize: "0.8rem" }}>
                            Total
                          </span>
                          <div className="card-body text-center">
                            <h5>{summary.totalVerifyPass}</h5>
                            <p>Verification Success</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="card shadow rounded-3 position-relative hover-bounce" style={{ backgroundColor: "#fff3cd", color: "#856404" }}>
                          <span className="position-absolute top-0 start-0 mt-2 ms-2 badge bg-dark" style={{ fontSize: "0.8rem" }}>
                            Total
                          </span>
                          <div className="card-body text-center">
                            <h5>{summary.totalVerifyFail}</h5>
                            <p>Verification Failure</p>
                          </div>
                        </div>
                      </div>
                    </div>


                    {todaySummary ? (
                      <div className="row g-4 mt-2">
                        <div className="col-md-3">
                          <div className="card shadow rounded-3 position-relative hover-bounce" style={{ backgroundColor: "#d4edda", color: "#155724" }}>
                            <span className="position-absolute top-0 start-0 mt-2 ms-2 badge bg-dark" style={{ fontSize: "0.8rem" }}>
                              Today
                            </span>
                            <div className="card-body text-center">
                              <h5>{todaySummary.checkIn}</h5>
                              <p>CheckIn Success</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="card shadow rounded-3 position-relative hover-bounce" style={{ backgroundColor: "#f8d7da", color: "#721c24" }}>
                            <span className="position-absolute top-0 start-0 mt-2 ms-2 badge bg-dark" style={{ fontSize: "0.8rem" }}>
                              Today
                            </span>
                            <div className="card-body text-center">
                              <h5>{todaySummary.checkInfailed}</h5>
                              <p>CheckIn Failure</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="card shadow rounded-3 position-relative hover-bounce" style={{ backgroundColor: "#d1ecf1", color: "#0c5460" }}>
                            <span className="position-absolute top-0 start-0 mt-2 ms-2 badge bg-dark" style={{ fontSize: "0.8rem" }}>
                              Today
                            </span>
                            <div className="card-body text-center">
                              <h5>{todaySummary.checkOut}</h5>
                              <p>CheckOut Success</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-3">
                          <div className="card shadow rounded-3 position-relative hover-bounce" style={{ backgroundColor: "#fff3cd", color: "#856404" }}>
                            <span className="position-absolute top-0 start-0 mt-2 ms-2 badge bg-dark" style={{ fontSize: "0.8rem" }}>
                              Today
                            </span>
                            <div className="card-body text-center">
                              <h5>{todaySummary.checkOutfailed}</h5>
                              <p>CheckOut Failure</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <h5 className="text-center mt-4">Loading Dashboard...</h5>
                    )}


                    <div className="mb-4 mt-4">
                      <Slider
                        dots={false}
                        infinite={true}
                        arrows={false}
                        speed={600}
                        slidesToShow={3}         // desktop
                        slidesToScroll={1}
                        autoplay={true}
                        autoplaySpeed={2500}
                        responsive={[
                          {
                            breakpoint: 992,     // tablets and small laptops
                            settings: {
                              slidesToShow: 2,   // <-- 2 cards for this size
                              slidesToScroll: 1,
                            },
                          },
                          {
                            breakpoint: 576,     // mobiles
                            settings: {
                              slidesToShow: 1,   // <-- 1 card on small screens
                              slidesToScroll: 1,
                            },
                          },
                        ]}
                      >
                        {reportData.map((row, index) => (
                          <div key={index} className="p-1">
                            <div
                              className="shadow-sm p-2 rounded text-center h-100"
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                background:
                                  row.checkIn === "Success"
                                    ? "#e6f9f0"
                                    : row.checkOut === "Success"
                                      ? "#fdecea"
                                      : "#fdecea",
                                border: `1.5px solid ${row.checkIn === "Success" || row.checkOut === "Success"
                                  ? "#28a745"
                                  : "#dc3545"
                                  }`,
                              }}
                            >
                              <h6 className="mb-1" style={{ fontSize: "0.9rem" }}>
                                {row.employerId}
                              </h6>
                              <p className="mb-1 small" style={{ fontSize: "0.8rem" }}>
                                {row.name}
                              </p>
                              <p
                                className={`fw-bold mb-1 ${row.checkIn === "Success" || row.checkOut === "Success"
                                  ? "text-success"
                                  : "text-danger"
                                  }`}
                                style={{ fontSize: "0.85rem" }}
                              >
                                {row.checkIn === "Success" ? "IN" : "OUT"}
                              </p>
                              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                {row.inDateTime
                                  ? new Date(row.inDateTime).toLocaleString()
                                  : row.outDateTime
                                    ? new Date(row.outDateTime).toLocaleString()
                                    : ""}
                              </small>
                            </div>
                          </div>
                        ))}
                      </Slider>
                    </div>







                    <div className="row mt-4">
                      <div className="col-12 col-md-6 mx-auto">
                        <div className="card shadow rounded-3 hover-bounce">
                          <div className="card-body">
                            <div
                              style={{
                                height: "300px",
                                display: "flex",
                                justifyContent: "center", // horizontal center
                                alignItems: "center" // vertical center
                              }}
                            >
                              <Bar data={data} options={options} />
                            </div>
                          </div>
                        </div>
                      </div>







                      <div className="col-md-6">
                        <div className="card shadow rounded-3 hover-bounce">
                          <div className="card-body d-flex justify-content-center align-items-center" style={{ height: "333px" }}>
                            <Pie data={pieData} options={pieOptions} />
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                }
              />



              <Route path="/" element={<></>} />
              <Route path="/enrollment-report" element={<EnrollmentReport />} />
              <Route path="/enrollment-success" element={<EnrollmentSuccess />} />
              <Route path="/enrollment-failure" element={<EnrollmentFailure />} />
              <Route path="/verification-report" element={<VerificationReport />} />
              <Route path="/verification-success" element={<VerificationSuccess />} />
              <Route path="/verification-failure" element={<VerificationFailure />} />
              <Route path="/transaction-details" element={<TransactionDetails />} />

            </Routes>
          </div>

        </div>
      </div>

    </Router >
  );
}

export default App;
