import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Lock, 
  UserCircle, 
  Mail, 
  Phone, 
  Briefcase,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();

    if (!token || role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "Doctor",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();

    if (!token || role !== "admin") {
      setMessage("❌ You must be an admin to register new users.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch("http://localhost:8001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage("Registration successful. Please log in.");

        setTimeout(() => {
          navigate("/");
        }, 1200);
      } else {
        setMessage(data.detail || data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "Admin", label: "Admin" },
    { value: "Receptionist", label: "Receptionist" },
    { value: "Doctor", label: "Doctor" },
  ];

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.orb1}></div>
      <div style={styles.orb2}></div>
      <div style={styles.orb3}></div>
      
      <div style={styles.overlay}></div>

      <div style={styles.card}>
        {/* Decorative header */}
        <div style={styles.headerDecoration}>
          <Sparkles size={20} color="#8b5cf6" />
          <span style={styles.badge}>Secure Registration</span>
        </div>

        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>
          Join our hospital management system
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <UserCircle size={18} style={styles.inputIcon} />
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <Briefcase size={18} style={styles.inputIcon} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.select}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <Phone size={18} style={styles.inputIcon} />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <span style={styles.loadingSpinner}>
                <span style={styles.spinner}></span>
                Registering...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {message && (
          <div
            style={{
              ...styles.message,
              ...(isSuccess ? styles.messageSuccess : styles.messageError),
            }}
          >
            {isSuccess ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message}</span>
          </div>
        )}

        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account?</span>
          <button 
            onClick={() => navigate("/")} 
            style={styles.loginButton}
          >
            <ArrowLeft size={16} />
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "20px",
  },

  orb1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)",
    top: "-100px",
    right: "-100px",
    animation: "float 8s ease-in-out infinite",
  },

  orb2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)",
    bottom: "-80px",
    left: "-80px",
    animation: "float 10s ease-in-out infinite reverse",
  },

  orb3: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    animation: "pulse 6s ease-in-out infinite",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(15, 12, 41, 0.6)",
    backdropFilter: "blur(2px)",
  },

  card: {
    position: "relative",
    zIndex: 2,
    width: "440px",
    padding: "40px",
    borderRadius: "32px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.5)",
    transition: "all 0.3s ease",
  },

  headerDecoration: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
  },

  badge: {
    background: "rgba(139, 92, 246, 0.2)",
    color: "#c4b5fd",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
    letterSpacing: "0.5px",
    border: "1px solid rgba(139, 92, 246, 0.2)",
  },

  title: {
    color: "#ffffff",
    textAlign: "center",
    marginBottom: "8px",
    fontSize: "34px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  subtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginBottom: "32px",
    fontSize: "14px",
    fontWeight: "400",
  },

  inputGroup: {
    marginBottom: "16px",
  },

  inputWrapper: {
    position: "relative",
  },

  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255, 255, 255, 0.3)",
    pointerEvents: "none",
    transition: "all 0.3s ease",
  },

  input: {
    width: "100%",
    padding: "14px 16px 14px 44px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    fontFamily: "'Inter', sans-serif",
  },

  select: {
    width: "100%",
    padding: "14px 16px 14px 44px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    appearance: "none",
    WebkitAppearance: "none",
    transition: "all 0.3s ease",
  },

  button: {
    width: "100%",
    padding: "16px",
    marginTop: "12px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.3px",
  },

  loadingSpinner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },

  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  message: {
    marginTop: "20px",
    padding: "14px 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: "500",
    backdropFilter: "blur(10px)",
  },

  messageSuccess: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.2)",
    color: "#4ade80",
  },

  messageError: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#f87171",
  },

  footer: {
    marginTop: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  footerText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: "14px",
  },

  loginButton: {
    background: "none",
    border: "none",
    color: "#8b5cf6",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', sans-serif",
  },

  // Add these keyframes to your global CSS or in a <style> tag
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-20px)" },
  },

  "@keyframes pulse": {
    "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
    "50%": { transform: "translate(-50%, -50%) scale(1.1)" },
  },

  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};

export default Register;