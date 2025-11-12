import HeadName from "../headName/headName";
import "./styles.scss";
export default function MyResume() {
  const technicalSkills = {
    frontend: [
      {
        name: "HTML ",
        percentage: 90,
        value: "Expert",
      },
      {
        name: "JAVASCRIPT & FRAMEWORKS",
        percentage: 40,
        value: "Familiar",
      },
      {
        name: "STYLING",
        percentage: 70,
        value: "Advanced",
      },
    ],
    backend: [
      {
        name: "NODE.JS",
        percentage: 60,
        value: "Proficient",
      },
      {
        name: "PHP",
        percentage: 90,
        value: "Expert",
      },
    ],
    database: [
      {
        name: "MYSQL",
        percentage: 70,
        value: "Advanced",
      },
      {
        name: "MONGODB",
        percentage: 60,
        value: "Proficient",
      },
      {
        name: "ORACLE",
        percentage: 60,
        value: "Proficient",
      },
    ],
  };
  return (
    <div className="resume_container">
      <HeadName headName="My Resume" />
      <div className="skills_div">
        <div className=" skills">
          <p>FRONTEND</p>
          <ul>
            {technicalSkills.frontend.map((item, i) => (
              <li key={i}>
                <p>{item.name}</p>
                <p>{item.percentage}</p>
                <p>{item.value}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className=" skills">
          <p>BACKEND</p>
          <ul>
            {technicalSkills.backend.map((item, i) => (
              <li key={i}>
                <p>{item.name}</p>
                <p>{item.percentage}</p>
                <p>{item.value}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className=" skills">
          <p>DATABASE</p>
          <ul>
            {technicalSkills.database.map((item, i) => (
              <li key={i}>
                <p>{item.name}</p>
                <p>{item.percentage}</p>
                <p>{item.value}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
//  C. Resume

// Focus: Professional Summary and Achievements.

// Essential Work:

// Key Achievements: For past roles, focus on quantifiable results (e.g., "Reduced load time by 30%") instead of generic responsibilities.

// Clear Hierarchy: Use <h2> for sections (Education, Experience) and clear <ul> lists for individual points.

// PDF Link: Include a prominent button or link allowing recruiters to download your formal resume as a PDF file.
