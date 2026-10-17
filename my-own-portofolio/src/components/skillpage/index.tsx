import HeadName from "../headName/headName";
import "./styles.scss";
export default function MySkills() {
  const data = {
    personalDetails: {
      name: "Nimrod Kinyanjui",
      value: "Junior Full Stack Developer",
    },

    education: {
      name: "Bsc Applied Computer Science",
      institution: "Chuka University",
      dates: "2023-09-04 to 2027-04-24",
    },

    workExperience: [
      {
        name: "Web Development Team Member",
        institution: "Chuka University,Chuka",
        dates: "2023-09-04 to 2027-04-24",
        cores: [" profesional web", " leveraged react", " practiced team work"],
      },
      {
        name: "ICT Department Assistant",
        institution: "Chuka University,ICT department",
        dates: "2023-09-04 to 2027-04-24",
        cores: ["school web app", " involved in ajira team"],
      },
    ],
  };
  return (
    <div className="main_skills_div">
      <HeadName headName="My Skills" />
      <div className="center_wrap">
        <div className="name_tag">
          <p>{data.personalDetails.name}</p>
          <span>{data.personalDetails.value}</span>
        </div>

        <div className="education">
          <p>EDUCATION</p>
          <span>{data.education.name}</span>
          <span>{data.education.institution}</span>
          <em>{data.education.dates}</em>
        </div>
        <div className="work_experience">
          <p>WORK EXPERIENCE</p>
          <ul>
            {data.workExperience.map((item, i) => (
              <li key={i}>
                <p>{item.name}</p>
                <span>{item.cores}</span>
                <span>{item.institution}</span>
                <em>{item.dates}</em>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
