import HeadName from "../headName/headName";
import "./styles.scss";
interface SkillProps extends SkillDetail {}

const SkillBar: React.FC<SkillProps> = ({ name, percentage, value }) => {
  const properPercent = Math.min(100, Math.max(0, percentage));
  return (
    <li className="skills_item">
      <p>{name}</p>
      <div className="progress_bar">
        <div
          className="bar_fill"
          style={{ width: `${properPercent}%` }}
          role="progressbar"
          aria-valuenow={properPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <div className="show_percent">
        <p>{properPercent}</p>
      </div>
    </li>
  );
};
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
              <SkillBar
                key={i}
                name={item.name}
                percentage={item.percentage}
                value={item.value}
              />
            ))}
          </ul>
        </div>
        <div className=" skills">
          <p>BACKEND</p>
          <ul>
            {technicalSkills.backend.map((item, i) => (
              <SkillBar
                key={i}
                name={item.name}
                percentage={item.percentage}
                value={item.value}
              />
            ))}
          </ul>
        </div>
        <div className=" skills">
          <p>DATABASE</p>
          <ul>
            {technicalSkills.database.map((item, i) => (
              <SkillBar
                key={i}
                name={item.name}
                percentage={item.percentage}
                value={item.value}
              />
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
