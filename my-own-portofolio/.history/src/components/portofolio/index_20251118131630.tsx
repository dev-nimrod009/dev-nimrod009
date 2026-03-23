import HeadName from "../headName/headName";

export default function MyPortofolio() {
  const portofolioData = [
    {
      name: "Track Myself",
      path: "",
      image: "",
    },
    {
      name: "Finance Tracker",
      path: "",
      image: "",
    },
    {
      name: " Travel Safaris App",
      path: "",
      image: "",
    },
    {
      name: " Flight Web App",
      path: "",
      image: "",
    },
    {
      name: "Pork City",
      path: "",
      image: "",
    },
  ];

  return (
    <>
      <HeadName headName="My Portofolio" />
      <h1>This is my portofolio</h1>
      <div className="portofolioGrid">
        <ul>
          {portofolioData.map((item, i) => (
            <li key={i}>
              <img src={item.image} alt={item.name} />
              <p>{item.name}</p>
              <a>{item.path}</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
