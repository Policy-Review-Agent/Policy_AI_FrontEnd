import errorLogo from "/assets/images/Error-Icon.png";
const Error = () => {
  return (
    <div className="h-[99.9vh] flex flex-col justify-center items-center">

      <div style={{textAlign:"-webkit-center"}}>
        <img
          src={errorLogo}
          alt="errorLogo"
          width={150}
          height={150}
          className="mt-5"
        />
        <h4 className="text-muted mt-3">
          Please contact your admin for access
        </h4>
      </div>
    </div>
  );
};

export default Error;
