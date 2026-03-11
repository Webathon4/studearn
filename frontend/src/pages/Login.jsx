import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";
<<<<<<< HEAD
import logo from "../assets/images/studearn-logo.svg";
=======
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/api/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
<<<<<<< HEAD
      // Notify NavBar of login
      window.dispatchEvent(new Event("userLogin"));
      // Redirect based on role
      if (data.user.role === "client") {
        navigate("/client-dashboard");
      } else {
        navigate("/dashboard");
      }
=======
      navigate("/tasks");
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
<<<<<<< HEAD
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="StudEarn" className="auth-logo" />
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your StudEarn account</p>
        {error && <p className="error alert alert-danger">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Sign In</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
=======
    <div className="card">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    </div>
  );
};

export default Login;
