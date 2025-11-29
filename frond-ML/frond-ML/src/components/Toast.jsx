import { useEffect } from "react";

export default function Toast({ message, close }) {
  useEffect(() => {
    const t = setTimeout(close, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "#43a047",
      color: "white",
      padding: "12px 18px",
      borderRadius: "10px",
      boxShadow: "0px 6px 20px rgba(0,0,0,.2)",
      zIndex: 2000,
      fontWeight: "700",
      fontSize: "14px"
    }}>
      {message}
    </div>
  );
}
