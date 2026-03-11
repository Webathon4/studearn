import { Link, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useState, useEffect } from "react";
import { Briefcase, LayoutDashboard, Gavel, BookOpen, ClipboardList, PenSquare, User, LogOut, Sun, Moon } from "lucide-react";
import logo from "../assets/images/studearn-logo.svg";
import NotificationBell from "./NotificationBell.jsx";
import WalletBalance from "./WalletBalance.jsx";

const NavBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : prefersDark ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    };

    loadUser();

    // Listen for custom login/logout events
    const handleUserLogin = () => {
      loadUser();
    };

    const handleUserLogout = () => {
      setUser(null);
    };

    window.addEventListener("userLogin", handleUserLogin);
    window.addEventListener("userLogout", handleUserLogout);

    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
      window.removeEventListener("userLogout", handleUserLogout);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("userLogout"));
    navigate("/login");
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to={user?.role === "client" ? "/client-dashboard" : "/dashboard"} className="nav-brand">
          <img src={logo} alt="StudEarn" className="nav-logo" />
        </Link>
      </div>
      <div className="nav-right">
        <button type="button" className="theme-toggle" onClick={handleToggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        {token && user && <WalletBalance showLabel={false} />}
        {token && user && <NotificationBell userId={user._id} />}
        {token && user ? (
          <>
            {user.role === "student" ? (
              <>
                <Link to="/tasks" className="nav-link">
                  <Briefcase size={16} />
                  Tasks
                </Link>
                <Link to="/dashboard" className="nav-link">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link to="/auctions" className="nav-link">
                  <Gavel size={16} />
                  Auctions
                </Link>
                <Link to="/learnhub" className="nav-link">
                  <BookOpen size={16} />
                  LearnHub
                </Link>
              </>
            ) : (
              <>
                <Link to="/client-dashboard" className="nav-link">
                  <ClipboardList size={16} />
                  My Tasks
                </Link>
                <Link to="/post" className="nav-link">
                  <PenSquare size={16} />
                  Post Task
                </Link>
              </>
            )}
            <Link to="/profile" className="nav-link">
              <User size={16} />
              Profile
            </Link>
            <button type="button" onClick={handleLogout}>
              <LogOut size={16} />
=======

const NavBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/tasks" className="nav-brand">
          Student Pocket Money
        </Link>
      </div>
      <div className="nav-right">
        {token ? (
          <>
            <Link to="/tasks">Tasks</Link>
            <Link to="/post">Post Task</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <button type="button" onClick={handleLogout}>
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
