import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";
<<<<<<< HEAD
import logo from "../assets/images/studearn-logo.svg";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
=======

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/api/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
<<<<<<< HEAD
      // Notify NavBar of login
      window.dispatchEvent(new Event("userLogin"));
      navigate(data.user.role === "client" ? "/client-dashboard" : "/dashboard");
=======
      navigate("/profile");
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
<<<<<<< HEAD
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="StudEarn" className="auth-logo" />
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join StudEarn and start learning & earning</p>
        {error && <p className="error alert alert-danger">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
          />
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
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="student">I'm a Student (Task Taker)</option>
            <option value="client">I'm a Client (Task Creator)</option>
          </select>
          <button type="submit">Create Account</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
=======
    <div className="card">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />
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
        <button type="submit">Create Account</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
>>>>>>> 88cd139a465b2dd0b173e63e6b7a239dc38e9768
    </div>
  );
};

export default Register;
