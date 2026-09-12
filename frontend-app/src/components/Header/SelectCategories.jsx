import { useState, useEffect, useRef } from "react";
import api from "../api";

export const SelectCategories = ({ onSelect, open, setOpen }) => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const [selected, setSelected] = useState({
    id: "",
    name: "All Categories",
  });

  // ✅ FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        const safeData = Array.isArray(data) ? data : [];
        const allCats = [{ id: "", name: "All Categories" }, ...safeData];

        setCategories(allCats);
        setFiltered(allCats);
      } catch (err) {
        console.error("Error fetching categories:", err);
        const fallback = [{ id: "", name: "All Categories" }];
        setCategories(fallback);
        setFiltered(fallback);
      }
    };

    fetchCategories();
  }, []);

  // ✅ OUTSIDE CLICK CLOSE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  // ✅ SELECT CATEGORY
  const handleSelect = (cat) => {
    setSelected(cat || { id: "", name: "All Categories" });
    setOpen(false);
    if (onSelect) onSelect(cat);
  };

  // ✅ FILTER
  const handleFilter = (e) => {
    const value = e.target.value;
    setSearch(value);

    const list = categories.filter((cat) =>
      cat?.name?.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(list);
  };

  const safeName = selected?.name || "All Categories";

  return (
    <div
      className="selectDropWrapper"
      ref={wrapperRef}
      onClick={(e) => e.stopPropagation()} // ✅ FIX 1 (VERY IMPORTANT)
    >
      {/* BUTTON */}
      <span
        className="openselect"
        onClick={(e) => {
          e.stopPropagation(); // ✅ FIX 2
          setOpen(!open);
        }}
      >
        {safeName.length > 14
          ? safeName.substring(0, 14) + "..."
          : safeName}
      </span>

      {/* DROPDOWN */}
      <div className={`selectDrop ${open ? "open" : ""}`}>
        {/* SEARCH */}
        <div className="searchField">
          <input
            type="text"
            placeholder="Search Categories..."
            value={search}
            onChange={handleFilter}
            onClick={(e) => e.stopPropagation()} // ✅ FIX 3
          />
        </div>

        {/* LIST */}
        <ul className="searchResults">
          {filtered?.length > 0 ? (
            filtered.map((cat) => (
              <li
                key={cat.id || cat.name}
                onClick={(e) => {
                  e.stopPropagation(); // ✅ FIX 4 (CRITICAL)
                  handleSelect(cat);
                }}
                className={selected?.id === cat.id ? "active" : ""}
              >
                {cat.name}
              </li>
            ))
          ) : (
            <li>No Categories Found</li>
          )}
        </ul>
      </div>
    </div>
  );
};