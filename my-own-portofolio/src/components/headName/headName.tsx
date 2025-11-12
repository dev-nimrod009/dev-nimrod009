import React from "react";
import "./styles.scss";
function HeadName(props) {
  const { headName } = props;
  return (
    <div className="head_container">
      <p>{headName}</p>
    </div>
  );
}

export default HeadName;
