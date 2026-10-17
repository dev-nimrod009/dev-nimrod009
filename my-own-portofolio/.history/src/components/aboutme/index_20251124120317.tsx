import { Link } from "react-router-dom";
import HeadName from "../headName/headName";
import "./styles.scss";
export default function AboutMe() {
  const fullData = {
    backThen: [
      {
        name: " What brought me to code ",
        value:
          " My passion for technology began when I first realized the power of automation, leading me to transition from a background in [Previous Field] to full-time software development. I thrive on translating complex requirements into elegant, maintainable code. My initial projects focused on optimizing data processing, which cemented my commitment to efficient and scalable solutions.",
      },
      {
        name: " What I serve you  ",
        value:
          " Currently, I specialize in the modern web stack, utilizing **React, Tailwind CSS, and Node.js** to build fast, responsive, and accessible applications. I dont just write code; I aim to deliver tangible business value. In my last role, I built a custom API integration that **improved data sync reliability by 99%** and reduced manual intervention.  ",
      },
      {
        name: "  Future Plans ",
        value: " The future plans are many  ",
      },
    ],
    myDetails: [
      {
        label: " Core Stack ",
        value: "React,Node",
      },
      {
        label: " Experience ",
        value: "1 year",
      },
      {
        label: "Email ",
        value: " 01nimrodkinyanjui@gmail.com",
      },
      {
        label: "Address ",
        value: " Chuka Kenya",
      },
      {
        label: "Role preffered ",
        value: " intern developer",
      },
    ],
  };

  return (
    <div className="main_about_page">
      <HeadName headName="About Me" />
      <div className="profile_container">
        <div className="profile_photo"></div>
        <div className="profile_name">
          <p>Nimrod Kinyanjui</p>
        </div>
      </div>
      <div className="brief_description">
        <ul>
          {fullData.backThen.map((items, i) => (
            <li key={i}>
              <p>
                {" "}
                <span>{items.name}:</span>
                <span>{items.value}</span>
              </p>
            </li>
          ))}
        </ul>
        <ul>
          {fullData.myDetails.map((item, i) => (
            <li key={i}>
              <p>
                <span>
                  {item.label}:<br />
                </span>
                <span>
                  {item.value}
                  <br />
                </span>
              </p>
            </li>
          ))}
        </ul>
        <div className="resume_button">
          <Link to="/resume">View Full Resume</Link>
        </div>
      </div>
    </div>
  );
}
