import { Routes, Route, Navigate } from "react-router-dom";
<<<<<<< HEAD
import { useEffect } from "react";
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import TaskFeed from "./pages/TaskFeed.jsx";
import PostTask from "./pages/PostTask.jsx";
<<<<<<< HEAD
import JobDetails from "./pages/JobDetails.jsx";
import EditTask from "./pages/EditTask.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ClientDashboard from "./pages/ClientDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Auctions from "./pages/Auctions.jsx";
import Chat from "./pages/Chat.jsx";
import AuctionSettlementChat from "./pages/AuctionSettlementChat.jsx";
import LearnHub from "./pages/LearnHub.jsx";
import LearnHubChat from "./pages/LearnHubChat.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NavBar from "./components/NavBar.jsx";
import { useToast } from "./components/Toast.jsx";
import { initSocket, getSocket, disconnectSocket } from "./services/socket.js";

const App = () => {
  const { toasts, showToast, closeToast, ToastContainer } = useToast();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      // Initialize socket connection
      const socket = initSocket(userData._id);

      // Listen for real-time notifications
      socket.on("newNotification", (notification) => {
        showToast(notification.message, notification.type, 4000);
        // Trigger a refetch of notifications in NotificationBell
        window.dispatchEvent(new Event("notificationReceived"));
      });
    }

    // Listen for logout events to disconnect socket
    const handleLogout = () => {
      disconnectSocket();
    };

    window.addEventListener("userLogout", handleLogout);

    return () => {
      window.removeEventListener("userLogout", handleLogout);
    };
  }, [showToast]);

  return (
    <div className="app">
      <NavBar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-dashboard"
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id/edit"
          element={
            <ProtectedRoute>
              <EditTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auctions"
          element={
            <ProtectedRoute>
              <Auctions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auction-settlement/:auctionId"
          element={
            <ProtectedRoute>
              <AuctionSettlementChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learnhub"
          element={
            <ProtectedRoute>
              <LearnHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learnhub-chat/:postId"
          element={
            <ProtectedRoute>
              <LearnHubChat />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
=======
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NavBar from "./components/NavBar.jsx";

const App = () => {
  return (
    <div className="app">
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TaskFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post"
            element={
              <ProtectedRoute>
                <PostTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </div>
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    </div>
  );
};

export default App;
