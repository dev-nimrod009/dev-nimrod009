import HeadName from "../headName/headName";

export default function MyPortofolio() {
  const portofolioData = [
    {
      id: 3,
      name: "Track Myself",
      path: "",
      image: "",
    },
    { id: 2, name: "Weather App", path: "", image: "" },
    { id: 3, name: "Finance Tracker", path: "", image: "" },
    { id: 3, name: " Travel Safaris App", path: "", image: "" },
    { id: 2, name: " Flight Web App", path: "", image: "" },
    { id: 3, name: "Pork City", path: "", image: "" },
  ];
  const filterData = [
    {
      name: "All",
      id: 1,
    },
    { name: "FINISHED", id: 2 },
    { name: "IN PROGRESS", id: 3 },
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
