import React from "react";
import "./CommonFilterBar.css";

export const CommonFilterBar = ({
  search = "",
  setSearch,
  searchPlaceholder = "Search...",

  filters = [],

  onClear,

  showClear = true,
}) => {
  const hasActiveFilters =
    search ||
    filters.some(
      (filter) =>
        filter.value !== undefined &&
        filter.value !== "" &&
        filter.value !== "All"
    );

  return (
    <div className="common-filter-bar">

      {/* =================================================
          SEARCH
      ================================================= */}

      {setSearch && (
        <div className="common-filter-group common-filter-search">

          <label>
            Search
          </label>

          <input
            type="text"
            value={search}
            placeholder={
              searchPlaceholder
            }
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>
      )}

      {/* =================================================
          DYNAMIC FILTERS
      ================================================= */}

      {filters.map(
        (filter, index) => (

          <div
            className="common-filter-group"
            key={
              filter.key ||
              filter.label ||
              index
            }
          >

            <label>
              {filter.label}
            </label>

            {/* SELECT */}

            {filter.type ===
              "select" ||
            !filter.type ? (

              <select
                value={
                  filter.value ?? ""
                }
                onChange={(e) =>
                  filter.onChange(
                    e.target.value
                  )
                }
              >

                {filter.options?.map(
                  (option) => (

                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>

                  )
                )}

              </select>

            ) : null}

            {/* DATE */}

            {filter.type ===
              "date" && (

              <input
                type="date"
                value={
                  filter.value || ""
                }
                onChange={(e) =>
                  filter.onChange(
                    e.target.value
                  )
                }
              />

            )}

          </div>

        )
      )}

      {/* =================================================
          CLEAR FILTERS
      ================================================= */}

      {showClear &&
        hasActiveFilters &&
        onClear && (

          <button
            type="button"
            className="common-filter-clear"
            onClick={onClear}
          >
            Clear Filters
          </button>

        )}

    </div>
  );
};

export default CommonFilterBar;