import "./styles.scss";

type HeadNameProps = {
  headName: string;
};

function HeadName({ headName }: HeadNameProps) {
  return (
    <div className="head_container">
      <p>{headName}</p>
    </div>
  );
}

export default HeadName;
