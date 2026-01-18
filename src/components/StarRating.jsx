export default function StarRating({ rating }) {
  const max = 5;

  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[...Array(max)].map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <span
            key={i}
            style={{
              color: filled ? "#F4B419" : "#D9D9D9",
              fontSize: "16px"
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
