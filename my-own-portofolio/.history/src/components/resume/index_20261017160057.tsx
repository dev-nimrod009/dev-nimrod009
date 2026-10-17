import HeadName from "../headName/headName";
import "./styles.scss";

interface SkillProps {
  name: string;
  percentage: number;
}

const SkillBar: React.FC<SkillProps> = ({ name, percentage }) => {
  const properPercent = Math.min(100, Math.max(0, percentage));

  return (
    <li className="skills_item">
      <p>{name}</p>
      <div className="progress_bar">
        <div
          className="bar_fill"
          style={{ width: `${properPercent}%` }}
          role="progressbar"
          aria-label={`${name} proficiency`}
          aria-valuenow={properPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      <div className="show_percent">
        <p>{properPercent}%</p>
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
      },
      {
        name: "JAVASCRIPT & FRAMEWORKS",
        percentage: 40,
      },
      {
        name: "STYLING",
        percentage: 70,
      },
    ],
    backend: [
      {
        name: "NODE.JS",
        percentage: 60,
      },
      {
        name: "PHP",
        percentage: 90,
      },
    ],
    database: [
      {
        name: "MYSQL",
        percentage: 70,
      },
      {
        name: "MONGODB",
        percentage: 60,
      },
      {
        name: "ORACLE",
        percentage: 60,
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
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
