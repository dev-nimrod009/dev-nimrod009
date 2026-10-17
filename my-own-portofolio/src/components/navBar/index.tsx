import { Link } from "react-router-dom";
import "./styles.scss";

export default function NavBar() {
  const lists = [
    {
      name: " Home",
      path: "/",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Skills",
      path: "/skills",
    },
    {
      name: "Contact Me",
      path: "/contactme",
    },
    {
      name: "Portofolio",
      path: "/portofolio",
    },
    {
      name: "Resume",
      path: "/resume",
    },
  ];

  return (
    <div className="nav_nav_nav_bar">
      <ul>
        {lists.map((items, i) => (
          <li key={i}>
            <Link to={items.path}>{items.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
