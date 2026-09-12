import "./Loader.css";

export const Loader = ({ label = "Loading", fullpage = false, inline = false }) => {
  return (
    <div className={`loader-wrap ${fullpage ? "fullpage" : ""} ${inline ? "inline" : ""}`}>
      <div className="loader-ring" role="status" aria-label={label}></div>
      {label && (
        <p className="loader-text">
          {label}
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </p>
      )}
    </div>
  );
};
