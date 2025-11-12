import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import NavBar from "./components/navBar";
import Home from "./components/HomePage/index.js";
import MySkills from "./components/skillpage/index.js";
import MyContacts from "./components/contacts/index.js";
import Resume from "./components/resume/index.js";
import Portofolio from "./components/portofolio/index.js";
import AboutMe from "./components/aboutme/index.js";

function App() {
  return (
    <div className="main_app_container">
      <BrowserRouter>
        <div className="nav_app_bar">
          <NavBar />
        </div>
        <div className="container_app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/skills" element={<MySkills />} />
            <Route path="/contactme" element={<MyContacts />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/portofolio" element={<Portofolio />} />
            <Route path="/about" element={<AboutMe />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
