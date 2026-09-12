import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api from "../api.js";

import { HomeProduct } from "../pages/listing/HomeProduct";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            try {
                const { data } = await api.get("/products/search", {
                    params: {
                        q: query,
                    },
                });

                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Search error:", err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) {
        return <h2>Searching...</h2>;
    }

    return (
        <div className="listing-page">
            <h2 className="search-results-heading">
                Search results for: <strong>{query}</strong>
            </h2>

            <HomeProduct
                products={products}
                categoryName="search"
                handleAddToWishlist={() => {}}
                handleAddToCart={() => {}}
            />
        </div>
    );
};

export default SearchResults;