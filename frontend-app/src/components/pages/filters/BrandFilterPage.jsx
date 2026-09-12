const BrandFilter = ({
  brands = [],
  selectedBrands = [],
  setSelectedBrands,
}) => {
  const brandList = Array.isArray(brands)
    ? brands
        .map((item) => {
          if (typeof item === "string") {
            return item.trim();
          }

          if (item && typeof item === "object") {
            return (
              item.brand_name ||
              item.brand ||
              item.name ||
              null
            );
          }

          return null;
        })
        .filter(Boolean)
    : [];

  const handleBrandChange = (brand, checked) => {
    if (checked) {
      if (!selectedBrands.includes(brand)) {
        setSelectedBrands([...selectedBrands, brand]);
      }
    } else {
      setSelectedBrands(
        selectedBrands.filter((item) => item !== brand)
      );
    }
  };

  return (
    <div className="sidebar-category-card">
      <h3>Brands</h3>

      <div className="bf-list">
        {brandList.length > 0 ? (
          brandList.map((brand) => (
            <label key={brand} className="bf-item">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={(e) =>
                  handleBrandChange(
                    brand,
                    e.target.checked
                  )
                }
              />

              <span className="bf-label">
                {brand}
              </span>
            </label>
          ))
        ) : (
          <p className="bf-empty">
            No brands available
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandFilter;