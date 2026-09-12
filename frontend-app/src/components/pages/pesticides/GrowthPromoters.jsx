import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import wishlistimg from "../../../assets/img/wishlist.png";
import dailydealscarouselbanner from "../../../assets/img/banner-4.png";
import previewimg from "../../../assets/img/eyeicon.jpg";
import "./GrowthPromoters.css";
import { Loader } from "../../Loader";

export const GrowthPromoters = ({ categoryId, categoryName }) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const productsPerPage = 4;

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        // Updated API endpoint
        const res = await axios.get(
          `http://localhost:8000/api/categories/products/${categoryId}`
        );

        const categoryData = res.data;

        // Format product images
        const formattedProducts = categoryData.products.map((p) => ({
          ...p,
          pimage: p.pimage
            ? p.pimage.startsWith("http")
              ? p.pimage
              : `http://localhost:8000${p.pimage}`
            : "/fallback-image.png",
        }));

        setCategory({ ...categoryData, products: formattedProducts });
      } catch (err) {
        console.error(err.response || err.message);
        setMessage(`Error fetching ${categoryName}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, categoryName]);
  if (loading) return <Loader label="Loading" inline />;
  if (!category) return <p>{message || "No products available"}</p>;

  const displayedProducts = category.products.slice(0, productsPerPage);

  return (
    <div className="dailydeals-container">
      <div className="growth-title">
        <h2>{categoryName}</h2>
        <div className="view-all-btn-container">
          <Link to={`/daily-deals/${category.id}`}>
            <button className="view-all-btn">View All</button>
          </Link>
        </div>
      </div>

      <div className="daily-deals">
        <div className="dailydeals-item">
          <div className="dailydeals-item-carousel">
            <img className="product-image" src={dailydealscarouselbanner} alt="Banner" />
          </div>

          <div className="product-wrapper">
            <div className="dailydeals-content">
              {displayedProducts.length > 0 ? (
                displayedProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <span className="product-badge">Hot</span>

                    <div className="product-imgcard">
                      <img
                        className="product-image"
                        src={product.pimage}
                        alt={product.name}
                      />
                      <div className="img_overlay">
                        <ul className="ddproduct-product-overlay">
                          <li className="ddproduct-item-overlay">
                            <img src={wishlistimg} alt="Wishlist" />
                          </li>
                          <Link to={`/daily-deals/${category.id}/${product.id}`}>
                            <li className="ddproduct-item-overlay">
                              <img src={previewimg} alt="Preview" />
                            </li>
                          </Link>
                        </ul>
                      </div>
                    </div>

                    <div className="ddproduct-contentcard">
                      <span className="catName">{categoryName}</span>
                      <h2 className="ddproducts-name">{product.name}</h2>

                      <div className="product-ratings">
                        <span className="fa fa-star checked"></span>
                        <span className="fa fa-star checked"></span>
                        <span className="fa fa-star checked"></span>
                        <span className="fa fa-star"></span>
                        <span className="fa fa-star"></span>
                      </div>

                      <h6 className="ddproducts-description">{product.pdescription}</h6>

                      <div className="price">
                        <span className="original-price">{product.orgprice}</span>
                        <span className="discount-price">{product.disprice}</span>
                        <p>
                          <Link to={`/cartpage`}>
                            <button className="addtocart">
                              <i className="fa-solid fa-cart-shopping"></i> Add to Cart
                            </button>
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No products available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
