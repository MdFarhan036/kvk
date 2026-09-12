import { useState } from "react";
import api from "../../components/api.js";

export const AuthTest = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/customer/check-auth", { withCredentials: true });
      console.log("Check auth response:", res.data);
      if (res.data.user) setUser(res.data.user);
      else setUser(null);
    } catch (err) {
      console.log("Check auth error:", err);
      setError("Auth check failed");
    }
  };

  return (
    <div>
      <button onClick={checkAuth}>Check Auth</button>
      {user && (
        <div>
          <h4>Logged in as:</h4>
          <p>{user.name} ({user.email})</p>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
