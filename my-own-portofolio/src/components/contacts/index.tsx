import React from "react";
import HeadName from "../headName/headName";

export default function MyContacts() {
  const socialHandles = [
    {
      name: " Email",
      value: "01nimrodkinyanjui@gmail.com",
    },
    {
      name: "Phone Number",
      value: "0113008096",
    },
  ];
  const metaHandles = [
    {
      name: "Github",
      value: "@git",
    },
    {
      name: "LinkedIn",
      value: "@link",
    },
    {
      name: "Instagram",
      value: "@inst",
    },
    {
      name: "Telegram",
      value: "@tg",
    },
    {
      name: "Facebook",
      value: "@fb",
    },
  ];

  return (
    <div className="main_div">
      <HeadName headName="Contact Me" />
      <form className="input_part">
        <label>Full Name</label>
        <input placeholder="Full Name" type="text" />
        <label id="email-part">Email</label>
        <input
          className="email-part"
          type="email"
          placeholder="What's your email"
        />

        <label id="content" htmlFor="content">
          Message
        </label>
        <input id="content" type="text" placeholder="Hi....." />
        <button type="submit">Submit</button>
      </form>
      <div className="social_holders">
        <div className="my_handles">
          <p>Directly contact me through </p>
          <ul>
            {socialHandles.map((item, i) => (
              <li key={i}>
                <span>{item.name} : </span>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="meta_handles">
          <h4> online Platforms</h4>
          <ul>
            {metaHandles.map((item, i) => (
              <li key={i}>
                <span>{item.name} : </span>
                <a>{item.value}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
