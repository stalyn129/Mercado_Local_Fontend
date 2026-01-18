import "./ProductGrid.css";

export default function ProductGrid({ items }) {
  return (
    <div className="product-grid">
      {items.map((img, i) => (
        <div className="grid-item" key={i}>
          <img src={img} alt="producto" />
        </div>
      ))}
    </div>
  );
}
