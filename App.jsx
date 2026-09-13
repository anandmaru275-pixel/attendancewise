import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./App.css";

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [students, setStudents] = useState([
    {
      id: 1,
      roll: "001",
      name: "Rahul Sharma",
      status: "Not Marked",
    },
    {
      id: 2,
      roll: "002",
      name: "Priya Verma",
      status: "Not Marked",
    },
    {
      id: 3,
      roll: "003",
      name: "Amit Patel",
      status: "Not Marked",
    },
  ]);

  const [newStudent, setNewStudent] = useState({
    name: "",
    roll: "",
  });

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [qrData, setQrData] = useState("");

  // QR Expiry - 30 Minutes
  const [qrExpiry, setQrExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [studentName, setStudentName] = useState("");
  const [studentRoll, setStudentRoll] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [scanning, setScanning] = useState(false);

  // Load saved user
  useEffect(() => {
    const savedUser = localStorage.getItem("attendancewise_user");

    if (savedUser) {
      setUserName(savedUser);
      setIsRegistered(true);
    }
  }, []);

  // QR Scanner
  useEffect(() => {
    if (activePage !== "QR Attendance" || !scanning) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        setScanning(false);

        scanner.clear().catch(() => {});
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [activePage, scanning]);

  // QR Countdown Timer
  useEffect(() => {
    if (!qrExpiry) return;

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((qrExpiry - Date.now()) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining <= 0) {
        setQrData("");
        setQrExpiry(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [qrExpiry]);

  // Register
  const handleRegister = (e) => {
    e.preventDefault();

    if (!userName || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem("attendancewise_user", userName);
    setIsRegistered(true);

    alert("Registration successful! Please login.");
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setIsLoggedIn(true);
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePage("Dashboard");
  };

  // Add Student
  const addStudent = (e) => {
    e.preventDefault();

    if (!newStudent.name || !newStudent.roll) {
      alert("Please enter student name and roll number");
      return;
    }

    const student = {
      id: Date.now(),
      roll: newStudent.roll,
      name: newStudent.name,
      status: "Not Marked",
    };

    setStudents((prev) => [...prev, student]);

    setNewStudent({
      name: "",
      roll: "",
    });

    alert("Student added successfully");
  };

  // Delete Student
  const deleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents((prev) =>
        prev.filter((student) => student.id !== id)
      );
    }
  };

  // Change Status
  const changeStatus = (id, status) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, status }
          : student
      )
    );
  };

  // Mark All Present
  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: "Present",
      }))
    );
  };

  // Mark All Absent
  const markAllAbsent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: "Absent",
      }))
    );
  };

  // Generate QR Code - Valid for 30 Minutes
  const generateQR = () => {
    if (!selectedSubject) {
      alert("Please select a subject");
      return;
    }

    const expiryTime = Date.now() + 30 * 60 * 1000;

    const data = {
      subject: selectedSubject,
      date: selectedDate || new Date().toLocaleDateString(),
      teacher: userName,
      sessionId: Date.now(),
      expiresAt: expiryTime,
    };

    setQrData(JSON.stringify(data));
    setQrExpiry(expiryTime);
    setTimeLeft(30 * 60);
    setScanResult("");
  };

  // Start Scanner
  const startScanner = () => {
    setScanResult("");
    setScanning(true);
  };

  // Mark Student Present From QR
  const markStudentFromQR = () => {
    if (!studentName || !studentRoll) {
      alert("Please enter student name and roll number");
      return;
    }

    setStudents((prev) => {
      const exists = prev.some(
        (student) => student.roll === studentRoll
      );

      if (exists) {
        return prev.map((student) =>
          student.roll === studentRoll
            ? { ...student, status: "Present" }
            : student
        );
      }

      return [
        ...prev,
        {
          id: Date.now(),
          roll: studentRoll,
          name: studentName,
          status: "Present",
        },
      ];
    });

    alert(`${studentName} marked Present successfully`);

    setStudentName("");
    setStudentRoll("");
  };

  // Save Attendance
  const saveAttendance = () => {
    const presentCount = students.filter(
      (student) => student.status === "Present"
    ).length;

    const absentCount = students.filter(
      (student) => student.status === "Absent"
    ).length;

    const record = {
      date: new Date().toLocaleDateString(),
      subject: selectedSubject || "General",
      present: presentCount,
      absent: absentCount,
      total: students.length,
    };

    setAttendanceHistory((prev) => [...prev, record]);

    alert("Attendance saved successfully");
  };

  // Get Scanned Data
  const getScannedData = () => {
    try {
      return JSON.parse(scanResult);
    } catch {
      return null;
    }
  };

  // Format Timer
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Registration Page
  if (!isRegistered) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo-section">
            <h1>AttendanceWise</h1>
            <p>Smart Attendance Management System</p>
          </div>

          <h2>Create Account</h2>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="primary-btn">
              Register
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <button
              className="link-btn"
              onClick={() => setIsRegistered(true)}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo-section">
            <h1>AttendanceWise</h1>
            <p>Welcome back</p>
          </div>

          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="primary-btn">
              Login
            </button>
          </form>

          <p className="auth-switch">
            New user?{" "}
            <button
              className="link-btn"
              onClick={() => setIsRegistered(false)}
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    );
  }

  const presentStudents = students.filter(
    (student) => student.status === "Present"
  ).length;

  const absentStudents = students.filter(
    (student) => student.status === "Absent"
  ).length;

  const notMarkedStudents = students.filter(
    (student) => student.status === "Not Marked"
  ).length;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>AttendanceWise</h2>
          <p>Smart Attendance</p>
        </div>

        <nav className="sidebar-nav">
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
              className={`nav-item ${
                activePage === page ? "active" : ""
              }`}
              onClick={() => setActivePage(page)}
            >
              <span>
                {page === "Dashboard" && "📊"}
                {page === "Students" && "👨‍🎓"}
                {page === "Attendance" && "📝"}
                {page === "QR Attendance" && "📱"}
                {page === "Voice Attendance" && "🎙️"}
                {page === "Reports" && "📈"}
                {page === "Settings" && "⚙️"}
              </span>

              <span>{page}</span>
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>Welcome back, {userName}</p>
          </div>

          <div className="profile-box">
            <div className="profile-avatar">
              {userName
                ? userName.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div>
              <strong>{userName || "Admin"}</strong>
              <small>Teacher / Admin</small>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        {activePage === "Dashboard" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👨‍🎓</div>
                <div>
                  <h3>{students.length}</h3>
                  <p>Total Students</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div>
                  <h3>{presentStudents}</h3>
                  <p>Present Today</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">❌</div>
                <div>
                  <h3>{absentStudents}</h3>
                  <p>Absent Today</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div>
                  <h3>{notMarkedStudents}</h3>
                  <p>Not Marked</p>
                </div>
              </div>
            </div>

            <div className="content-card">
              <h2>Quick Actions</h2>

              <p className="section-subtitle">
                Manage your classroom attendance easily.
              </p>

              <div className="quick-actions">
                <button
                  className="action-card"
                  onClick={() => setActivePage("Students")}
                >
                  <span>👨‍🎓</span>
                  <strong>Add Students</strong>
                  <small>Manage student list</small>
                </button>

                <button
                  className="action-card"
                  onClick={() => setActivePage("Attendance")}
                >
                  <span>📝</span>
                  <strong>Mark Attendance</strong>
                  <small>Mark daily attendance</small>
                </button>

                <button
                  className="action-card"
                  onClick={() => setActivePage("QR Attendance")}
                >
                  <span>📱</span>
                  <strong>Generate QR</strong>
                  <small>Quick attendance using QR</small>
                </button>

                <button
                  className="action-card"
                  onClick={() => setActivePage("Reports")}
                >
                  <span>📈</span>
                  <strong>View Reports</strong>
                  <small>Check attendance reports</small>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Students */}
        {activePage === "Students" && (
          <div className="content-card">
            <h2>Student Management</h2>

            <p className="section-subtitle">
              Add and manage students in your classroom.
            </p>

            <form
              className="add-student-form"
              onSubmit={addStudent}
            >
              <input
                type="text"
                placeholder="Student Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    name: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Roll Number"
                value={newStudent.roll}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    roll: e.target.value,
                  })
                }
              />

              <button type="submit" className="primary-btn">
                + Add Student
              </button>
            </form>

            <div className="table-responsive">
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
                      <td>{student.status}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteStudent(student.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance */}
        {activePage === "Attendance" && (
          <div className="content-card attendance-card">
            <div className="card-header">
              <div>
                <h2>Mark Attendance</h2>

                <p className="section-subtitle">
                  Select Present or Absent for each student.
                </p>
              </div>

              <div className="attendance-actions">
                <button
                  className="present-btn"
                  onClick={markAllPresent}
                >
                  Mark All Present
                </button>

                <button
                  className="absent-btn"
                  onClick={markAllAbsent}
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            <div className="attendance-table-wrapper">
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

                      <td>
                        <span
                          className={`attendance-status ${
                            student.status === "Present"
                              ? "status-present"
                              : student.status === "Absent"
                              ? "status-absent"
                              : "status-not-marked"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="present-btn"
                          onClick={() =>
                            changeStatus(
                              student.id,
                              "Present"
                            )
                          }
                        >
                          Present
                        </button>

                        <button
                          className="absent-btn"
                          onClick={() =>
                            changeStatus(
                              student.id,
                              "Absent"
                            )
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

            <button
              className="primary-btn save-attendance-btn"
              onClick={saveAttendance}
            >
              Save Attendance
            </button>
          </div>
        )}

        {/* QR Attendance */}
        {activePage === "QR Attendance" && (
          <div className="content-card">
            <h2>QR Code Attendance</h2>

            <p className="section-subtitle">
              Teacher QR generate करेगा और student scan करके
              attendance mark करेगा।
            </p>

            <div className="qr-form">
              <label>Select Subject</label>

              <select
                value={selectedSubject}
                onChange={(e) =>
                  setSelectedSubject(e.target.value)
                }
              >
                <option value="">Choose Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Computer Science">
                  Computer Science
                </option>
                <option value="English">English</option>
              </select>

              <label>Select Date</label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
              />

              <button
                className="primary-btn"
                onClick={generateQR}
              >
                Generate QR Code
              </button>
            </div>

            {qrData && (
              <div className="qr-result">
                <h3>Teacher Attendance QR Code</h3>

                <QRCodeCanvas
                  value={qrData}
                  size={220}
                  includeMargin={true}
                />

                <div className="qr-timer">
                  <h3>QR Valid For: {formatTime(timeLeft)}</h3>

                  <p>
                    QR Code 30 minutes बाद automatically expire हो जाएगा।
                  </p>
                </div>

                <p>
                  Student phone से इस QR code को scan कर सकता है।
                </p>

                <hr />

                <h3>Student QR Scanner</h3>

                <button
                  className="primary-btn"
                  onClick={startScanner}
                >
                  Start QR Scanner
                </button>

                {scanning && <div id="qr-reader"></div>}

                {scanResult && (
                  <div className="scan-result">
                    <h4>QR Scanned Successfully</h4>

                    {getScannedData() ? (
                      <>
                        <p>
                          Subject:{" "}
                          {getScannedData().subject}
                        </p>

                        <p>
                          Date: {getScannedData().date}
                        </p>

                        <p>
                          Teacher:{" "}
                          {getScannedData().teacher}
                        </p>

                        <input
                          type="text"
                          placeholder="Student Name"
                          value={studentName}
                          onChange={(e) =>
                            setStudentName(e.target.value)
                          }
                        />

                        <input
                          type="text"
                          placeholder="Roll Number"
                          value={studentRoll}
                          onChange={(e) =>
                            setStudentRoll(e.target.value)
                          }
                        />

                        <button
                          className="primary-btn"
                          onClick={markStudentFromQR}
                        >
                          Mark Attendance Present
                        </button>
                      </>
                    ) : (
                      <p>
                        Invalid QR Code. Please scan the AttendanceWise
                        QR Code.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Voice Attendance */}
        {activePage === "Voice Attendance" && (
          <div className="content-card">
            <h2>Voice Attendance</h2>

            <p className="section-subtitle">
              Future feature: Mark attendance using voice recognition.
            </p>

            <div className="voice-box">
              <div className="voice-icon">🎙️</div>

              <h3>Voice Attendance Coming Soon</h3>

              <p>
                This feature will allow teachers to call student names
                and mark attendance automatically.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  alert("Voice Attendance feature is coming soon!")
                }
              >
                Start Voice Attendance
              </button>
            </div>
          </div>
        )}

        {/* Reports */}
        {activePage === "Reports" && (
          <div className="content-card">
            <h2>Attendance Reports</h2>

            <p className="section-subtitle">
              View attendance summary and history.
            </p>

            <div className="report-summary">
              <div className="report-box">
                <h3>{students.length}</h3>
                <p>Total Students</p>
              </div>

              <div className="report-box">
                <h3>{presentStudents}</h3>
                <p>Present</p>
              </div>

              <div className="report-box">
                <h3>{absentStudents}</h3>
                <p>Absent</p>
              </div>

              <div className="report-box">
                <h3>
                  {students.length > 0
                    ? (
                        (presentStudents / students.length) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </h3>

                <p>Attendance Percentage</p>
              </div>
            </div>

            <h3>Attendance History</h3>

            {attendanceHistory.length === 0 ? (
              <p>No attendance records saved yet.</p>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendanceHistory.map((record, index) => (
                      <tr key={index}>
                        <td>{record.date}</td>
                        <td>{record.subject}</td>
                        <td>{record.present}</td>
                        <td>{record.absent}</td>
                        <td>{record.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activePage === "Settings" && (
          <div className="content-card">
            <h2>Settings</h2>

            <p className="section-subtitle">
              Manage your AttendanceWise account settings.
            </p>

            <div className="settings-box">
              <label>Teacher Name</label>

              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />

              <label>Email Address</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                className="primary-btn"
                onClick={() => {
                  localStorage.setItem(
                    "attendancewise_user",
                    userName
                  );

                  alert("Settings saved successfully");
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;