import { Link } from "react-router-dom";
import "./Navbar.scss";

export default function Navbar() {
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
        <Link to="/settings" className="nav-link">
          Settings
        </Link>
      </div>
      <div className="role">Landlord</div>
    </nav>
  );
}
