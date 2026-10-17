import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold">MyHostel</div>
        <Link to="/" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/rooms" className="hover:underline">
          Rooms
        </Link>
        <Link to="/tenants" className="hover:underline">
          Tenants
        </Link>
        <Link to="/payments" className="hover:underline">
          Payments
        </Link>
        <Link to="/settings" className="hover:underline">
          Settings
        </Link>
      </div>
      <div>
        <span className="text-sm opacity-80">Landlord</span>
      </div>
    </nav>
  );
}
