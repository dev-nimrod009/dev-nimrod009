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
          <textarea id="content" placeholder="Hi....." />
        </label>
        <button type="submit">Submit</button>
      </form>
      <div className="social_holders">
        <div className="meta_handles">
          <p>Directly contact me through </p>
          <ul>
            {socialHandles.map((item, i) => (
              <li key={i}>
                <span>{item.name} :</span>
                <a>{item.value}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="meta_handles">
          <p> Online Platforms</p>
          <ul>
            {metaHandles.map((item, i) => (
              <li key={i}>
                <span>{item.name} :</span>
                <a>{item.value}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
