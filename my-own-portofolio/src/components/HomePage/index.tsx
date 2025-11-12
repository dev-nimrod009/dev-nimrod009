import { Link } from "react-router-dom";
import "./styles.scss";
export default function MyHome() {
  return (
    <div className="main_home_div">
      <div className="right_div">
        <p> Hi there,I am Nimrod Kinyanjui a MERN developer.</p>
      </div>
      <div className="left_div">
        <Link to="/contactme">Hire Me</Link>
      </div>
    </div>
  );
}
