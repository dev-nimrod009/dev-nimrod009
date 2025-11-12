import React from "react";
import HeadName from "../headName/headName";
import "./styles.scss";
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
    <div className="main_div_contact">
      <HeadName headName="Contact Me" />
      <form className="input_part">
        <label>
          Full Name
          <input placeholder="Full  Name" type="text" />
        </label>
        <label id="email-part">
          Email
          <input
            className="email-part"
            type="email"
            placeholder="What's your email"
          />
        </label>

        <label id="content" htmlFor="content">
          Message
          <input id="content" type="text" placeholder="Hi....." />
        </label>
        <button type="submit">Submit</button>
      </form>
      <div className="social_holders">
        <div className="my_handles">
          <p>Directly contact me through </p>
          <ul>
            {socialHandles.map((item, i) => (
              <li key={i}>
                <span>
                  <b>{item.name} :</b>{" "}
                </span>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="meta_handles">
          <p> online Platforms</p>
          <ul>
            {metaHandles.map((item, i) => (
              <li key={i}>
                <span>
                  <b>{item.name}</b> :{" "}
                </span>
                <a>{item.value}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
