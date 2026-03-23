import HeadName from "../headName/headName";
import { useState } from "react";
export default function MyPortofolio() {
  const portofolioData = [
    {
      id: 3,
      name: "Track Myself",
      path: "",
      image: "",
      status: "IN PROGRESS",
    },
    { id: 2, name: "Weather App", path: "", image: "", status: "FINISHED" },
    {
      id: 3,
      name: "Finance Tracker",
      path: "",
      image: "",
      status: "IN PROGRESS",
    },
    {
      id: 3,
      name: " Travel Safaris App",
      path: "",
      image: "",
      status: "IN PROGRESS",
    },
    { id: 2, name: " Flight Web App", path: "", image: "", status: "FINISHED" },
    { id: 3, name: "Pork City", path: "", image: "", status: "IN PROGRESS" },
  ];
  const filterData = [
    {
      name: "ALL",
      id: 1,
    },
    { name: "FINISHED", id: 2 },
    { name: "IN PROGRESS", id: 3 },
  ];
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredData =
    activeFilter === "ALL"
      ? portofolioData
      : portofolioData.filter((item) => item.status === activeFilter);
  return (
    <>
      <HeadName headName="My Portofolio" />
      <h1>This is my portofolio</h1>
      <div className="filterDetails">
        {filterData.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.name)}
            className={activeFilter === filter.name ? "active" : ""}
          >
            {filter.name}
          </button>
        ))}
      </div>
      <div className="portofolioGrid">
        <ul>
          {filteredData.map((item, i) => (
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
