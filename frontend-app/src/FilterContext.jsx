import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const useFilters = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [sortOption, setSortOption] = useState("Featured");
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const clearFilters = () => {
    setMinPrice(0);
    setMaxPrice(100000);
    setSelectedBrands([]);
    setSelectedStock("");
  };

  return (
    <FilterContext.Provider
      value={{
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        selectedBrands,
        setSelectedBrands,
        selectedStock,
        setSelectedStock,
        sortOption,
        setSortOption,
        itemsPerPage,
        setItemsPerPage,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
