import HeadName from "../headName/headName";

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
    <div className="main_div">
      <HeadName headName="My Skills" />
      <div className="name_tag">
        <p>{data.personalDetails.name}</p>
        <span>{data.personalDetails.value}</span>
      </div>

      <div className="education">
        <h1>EDUCATION</h1>
        <h2>{data.education.name}</h2>
        <h6>{data.education.institution}</h6>
        <em>{data.education.dates}</em>
      </div>
      <div className="work_experience">
        <h1>WORK EXPERIENCE</h1>
        <ul>
          {data.workExperience.map((item, i) => (
            <li key={i}>
              <h3>{item.name}</h3>
              <h6>{item.institution}</h6>
              <em>{item.dates}</em>
              <p>{item.cores}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
