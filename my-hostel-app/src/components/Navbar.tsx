import { Link, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import { isLoggedIn, clearToken } from "../lib/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const logged = isLoggedIn();
  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">MyHostel</div>
        <Link to="/" className="nav-link">
          Dashboard
        </Link>
        <Link to="/rooms" className="nav-link">
          Rooms
        </Link>
        <Link to="/tenants" className="nav-link">
          Tenants
        </Link>
        <Link to="/payments" className="nav-link">
          Payments
        </Link>
        {logged && (
          <Link to="/settings" className="nav-link">
            Settings
          </Link>
        )}
      </div>
      <div className="role">
        {logged ? (
          <button onClick={logout}>Sign out</button>
        ) : (
          <Link to="/login" className="nav-link">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
