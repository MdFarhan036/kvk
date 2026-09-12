import { useEffect, useState } from "react";
import api from "../../api.js";
import { DailyDealsCard } from "./DailyDealsCard";
import "./DailyDeals.css";

const SkeletonGrid = ({ count = 8 }) => (
  <div className="dd-skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div className="dd-skeleton-card" key={i}>
        <div className="dd-skeleton-img" />
        <div className="dd-skeleton-line" />
        <div className="dd-skeleton-line short" />
      </div>
    ))}
  </div>
);

export const DailyDealsCategory = () => {
  const [ddproducts, setDdProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);

    window.clearTimeout(showToast._t);

    showToast._t = window.setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAllDailyDeals = async () => {
      try {
        const { data } = await api.get("/daily-deals");

        const validDeals = (Array.isArray(data) ? data : []).filter(
          (p) => p.is_daily_deal === 1 && p.daily_deal_price
        );

        if (isMounted) {
          setDdProducts(validDeals);
        }
      } catch (err) {
        console.error("Error fetching daily deals:", err);

        if (isMounted) {
          setError("We couldn't load daily deals right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllDailyDeals();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="daily-deals">
      <div className="dailydeals-container">
        <div className="dd-section-title">
          <div>
            <span className="dd-eyebrow">Browsing</span>

            <h2>All daily deals</h2>

            <p>
              {loading
                ? "Loading the full lineup..."
                : `${ddproducts.length} deals live today`}
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="dd-empty-state">
            <strong>Something went wrong</strong>
            {error}
          </div>
        ) : ddproducts.length > 0 ? (
          <div className="dailydeals-grid">
            {ddproducts.map((ddproduct) => (
              <DailyDealsCard
                key={ddproduct.id}
                ddproduct={ddproduct}
                onToast={showToast}
              />
            ))}
          </div>
        ) : (
          <div className="dd-empty-state">
            <strong>No daily deals right now</strong>
            Check back soon — new deals drop daily.
          </div>
        )}
      </div>

      {toast && (
        <div className="dd-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
};