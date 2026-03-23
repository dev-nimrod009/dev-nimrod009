import HeadName from "../headName/headName";

export default function MyPortofolio() {
  const data = [
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
      <h2>The following is my work gallery and the link to the work done</h2>
    </>
  );
}
