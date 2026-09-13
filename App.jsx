import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  const [userName, setUserName] = useState("Admin");

  const [students, setStudents] = useState([
    { id: 1, name: "Rahul Sharma", roll: "101", status: "Present" },
    { id: 2, name: "Priya Verma", roll: "102", status: "Present" },
    { id: 3, name: "Amit Patel", roll: "103", status: "Absent" },
  ]);

  const [newStudent, setNewStudent] = useState("");

  // QR Attendance
  const [showQR, setShowQR] = useState(false);
  const [qrSession, setQrSession] = useState("");
  const [qrTimeLeft, setQrTimeLeft] = useState(0);

  const addStudent = () => {
    if (newStudent.trim() === "") return;

    setStudents([
      ...students,
      {
        id: Date.now(),
        name: newStudent,
        roll: students.length + 101,
        status: "Present",
      },
    ]);

    setNewStudent("");
  };

  const deleteStudent = (id) => {
    setStudents(students.filter((student) => student.id !== id));
  };

  const changeStatus = (id, status) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, status } : student
      )
    );
  };

  const generateQR = () => {
    const session = `AttendanceWise-${Date.now()}`;
    setQrSession(session);
    setQrTimeLeft(30 * 60);
    setShowQR(true);
  };

  useEffect(() => {
    if (!showQR || qrTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setQrTimeLeft((time) => time - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showQR, qrTimeLeft]);

  useEffect(() => {
    if (qrTimeLeft === 0 && showQR) {
      setShowQR(false);
    }
  }, [qrTimeLeft, showQR]);

  const presentCount = students.filter(
    (student) => student.status === "Present"
  ).length;

  const absentCount = students.filter(
    (student) => student.status === "Absent"
  ).length;

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo-box">AW</div>

          <h1>AttendanceWise</h1>
          <p className="subtitle">
            Smart Attendance Management System
          </p>

          {!showRegister ? (
            <>
              <h2>Welcome Back!</h2>
              <p className="form-text">
                Login to manage your attendance.
              </p>

              <input type="email" placeholder="Enter your email" />
              <input type="password" placeholder="Enter your password" />

              <button onClick={() => setIsLoggedIn(true)}>
                Login
              </button>

              <p className="bottom-text">
                Don't have an account?{" "}
                <span onClick={() => setShowRegister(true)}>
                  Create Account
                </span>
              </p>
            </>
          ) : (
            <>
              <h2>Create Account</h2>
              <p className="form-text">
                Create your AttendanceWise account.
              </p>

              <input
                type="text"
                placeholder="Full Name"
                onChange={(e) => setUserName(e.target.value)}
              />

              <input type="email" placeholder="Enter your email" />
              <input type="password" placeholder="Create password" />

              <button onClick={() => setShowRegister(false)}>
                Create Account
              </button>

              <p className="bottom-text">
                Already have an account?{" "}
                <span onClick={() => setShowRegister(false)}>
                  Login
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="small-logo">AW</div>
          <span>AttendanceWise</span>
        </div>

        <nav>
          {[
            "Dashboard",
            "Students",
            "Attendance",
            "QR Attendance",
            "Voice Attendance",
            "Reports",
            "Settings",
          ].map((page) => (
            <button
              key={page}
              className={
                activePage === page ? "active-menu" : ""
              }
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <button
          className="logout-btn"
          onClick={() => setIsLoggedIn(false)}
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOPBAR */}
        <div className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Smart attendance management made simple.</p>
          </div>

          <div className="profile">
            {userName || "Admin"}
          </div>
        </div>

        {/* DASHBOARD */}
        {activePage === "Dashboard" && (
          <>
            <div className="stats-grid">

              <div className="stat-card">
                <h3>Total Students</h3>
                <strong>{students.length}</strong>
              </div>

              <div className="stat-card">
                <h3>Present Today</h3>
                <strong>{presentCount}</strong>
              </div>

              <div className="stat-card">
                <h3>Absent Today</h3>
                <strong>{absentCount}</strong>
              </div>

              <div className="stat-card">
                <h3>Attendance Rate</h3>
                <strong>
                  {students.length
                    ? Math.round(
                        (presentCount / students.length) * 100
                      )
                    : 0}
                  %
                </strong>
              </div>

            </div>

            <div className="welcome-box">
              <h2>Welcome to AttendanceWise</h2>
              <p>
                Manage students, mark attendance, and view reports
                from one simple dashboard.
              </p>
            </div>
          </>
        )}

        {/* STUDENTS */}
        {activePage === "Students" && (
          <div className="content-card">

            <div className="card-header">
              <h2>Student Management</h2>

              <div className="add-student">
                <input
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  placeholder="Enter student name"
                />

                <button onClick={addStudent}>
                  Add Student
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.roll}</td>
                    <td>{student.name}</td>
                    <td>
                      <span className="status">
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteStudent(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

        {/* ATTENDANCE */}
        {activePage === "Attendance" && (
          <div className="content-card">

            <h2>Mark Attendance</h2>
            <p className="section-subtitle">
              Select Present or Absent for each student.
            </p>

            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Current Status</th>
                  <th>Mark Attendance</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.roll}</td>
                    <td>{student.name}</td>
                    <td>{student.status}</td>
                    <td>
                      <button
                        className="present-btn"
                        onClick={() =>
                          changeStatus(student.id, "Present")
                        }
                      >
                        Present
                      </button>

                      <button
                        className="absent-btn"
                        onClick={() =>
                          changeStatus(student.id, "Absent")
                        }
                      >
                        Absent
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

        {/* QR ATTENDANCE */}
        {activePage === "QR Attendance" && (
          <div className="content-card qr-section">

            <h2>QR Code Attendance</h2>

            <p className="section-subtitle">
              Generate a QR code for students to scan and mark attendance.
            </p>

            {!showQR ? (
              <button onClick={generateQR}>
                Generate QR Code
              </button>
            ) : (
              <div className="qr-box">

                <h3>Scan this QR Code</h3>

                <QRCodeCanvas
                  value={qrSession}
                  size={250}
                  level="H"
                />

                <p className="qr-session">
                  Session ID: {qrSession}
                </p>

                <h3>
                  Time Remaining:{" "}
                  {Math.floor(qrTimeLeft / 60)}:
                  {(qrTimeLeft % 60)
                    .toString()
                    .padStart(2, "0")}
                </h3>

                <p className="expiry-text">
                  QR code will expire after 30 minutes.
                </p>

                <button onClick={() => setShowQR(false)}>
                  Close QR
                </button>

              </div>
            )}

          </div>
        )}

        {/* VOICE ATTENDANCE */}
        {activePage === "Voice Attendance" && (
          <div className="empty-card">
            <div className="feature-icon">🎙️</div>
            <h2>Voice Attendance</h2>
            <p>
              Voice-based attendance feature will be integrated here.
            </p>
            <button>Start Voice Attendance</button>
          </div>
        )}

        {/* REPORTS */}
        {activePage === "Reports" && (
          <div className="empty-card">
            <div className="feature-icon">📊</div>
            <h2>Attendance Reports</h2>
            <p>
              View daily, weekly, and monthly attendance reports.
            </p>
            <button>Generate Report</button>
          </div>
        )}

        {/* SETTINGS */}
        {activePage === "Settings" && (
          <div className="empty-card">
            <div className="feature-icon">⚙️</div>
            <h2>Settings</h2>
            <p>
              Manage your profile and application settings.
            </p>
            <button>Save Settings</button>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;