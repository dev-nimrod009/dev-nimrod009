import { Link } from "react-router-dom";
import HeadName from "../headName/headName";

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
    <div className="main_page">
      <HeadName headName="About Me" />
      <div className="profile_container">
        <div className="profile_photo">
          <h4>we</h4>
          <h4>we</h4>
        </div>
        <div className="profile_name">
          <h2>Nimrod Kinyanjui</h2>
        </div>
      </div>
      <div className="brief_description">
        <ul>
          {fullData.backThen.map((items, i) => (
            <li key={i}>
              {" "}
              <h4>{items.name}:</h4>
              <h6>{items.value}</h6>
            </li>
          ))}
        </ul>
        <ul>
          {fullData.myDetails.map((item, i) => (
            <li key={i}>
              <span>{item.label}:</span>
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
        <Link to="/resume">View Full Resume</Link>
      </div>
    </div>
  );
}
