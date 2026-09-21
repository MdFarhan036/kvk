import { useEffect, useState } from "react";
import API from "../services/api";
import "./MyAddresses.css";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

// =====================================================
// LEAFLET MARKER ICON FIX
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =====================================================
// DEFAULT MAP POSITION
// =====================================================

const DEFAULT_MAP_POSITION = {
  lat: 20.5937,
  lng: 78.9629,
};

// =====================================================
// MAP CENTER
// =====================================================

const MapCenter = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo(
      [position.lat, position.lng],
      17,
      {
        animate: true,
        duration: 1,
      }
    );
  }, [position, map]);

  return null;
};

// =====================================================
// MAP CLICK HANDLER
// =====================================================

const MapClickHandler = ({
  onLocationSelected,
}) => {
  useMapEvents({
    click(e) {
      onLocationSelected(
        e.latlng.lat,
        e.latlng.lng
      );
    },
  });

  return null;
};

// =====================================================
// DRAGGABLE MARKER
// =====================================================

const DeliveryMarker = ({
  position,
  onLocationSelected,
}) => {
  if (!position) {
    return null;
  }

  return (
    <Marker
      position={[
        position.lat,
        position.lng,
      ]}
      draggable={true}
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          const location = marker.getLatLng();

          onLocationSelected(
            location.lat,
            location.lng
          );
        },
      }}
    >
      <Popup>
        <strong>
          Delivery Location
        </strong>

        <br />

        Drag this pin to your exact
        delivery point.
      </Popup>
    </Marker>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function MyAddresses() {
  const [addresses, setAddresses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [locating, setLocating] =
    useState(false);

  const [loadingMapAddress, setLoadingMapAddress] =
    useState(false);

  const [error, setError] =
    useState("");

  const [locationMessage, setLocationMessage] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  // ===================================================
  // EMPTY FORM
  // ===================================================

  const emptyForm = {
    addressType: "Home",
    fullName: "",
    mobile: "",
    houseNo: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    latitude: "",
    longitude: "",
    isDefault: false,
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // ===================================================
  // MAP POSITION
  // ===================================================

  const [mapPosition, setMapPosition] =
    useState(null);

  // ===================================================
  // FETCH ADDRESSES
  // ===================================================

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get(
          "/customer/addresses"
        );

      setAddresses(
        Array.isArray(response.data)
          ? response.data
          : response.data?.addresses ||
              []
      );
    } catch (err) {
      console.error(
        "Failed to load addresses:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Failed to load your addresses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ===================================================
  // REVERSE GEOCODING
  // ===================================================

  const reverseGeocode = async (
    latitude,
    longitude
  ) => {
    try {
      setLoadingMapAddress(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          latitude
        )}&lon=${encodeURIComponent(
          longitude
        )}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(
          "Reverse geocoding request failed"
        );
      }

      const data =
        await response.json();

      console.log(
        "Reverse geocoding result:",
        data
      );

      const address =
        data?.address || {};

      const houseNumber =
        address.house_number || "";

      const road =
        address.road ||
        address.residential ||
        address.pedestrian ||
        "";

      const neighbourhood =
        address.neighbourhood ||
        address.suburb ||
        address.quarter ||
        address.village ||
        "";

      const city =
        address.city ||
        address.town ||
        address.municipality ||
        address.city_district ||
        address.village ||
        "";

      const state =
        address.state ||
        address.state_district ||
        "";

      const postcode =
        address.postcode || "";

      const country =
        address.country ||
        "India";

      // =============================================
      // BUILD ADDRESS
      // =============================================

      let generatedAddress = "";

      if (
        road &&
        neighbourhood
      ) {
        generatedAddress =
          `${road}, ${neighbourhood}`;
      } else if (road) {
        generatedAddress = road;
      } else if (neighbourhood) {
        generatedAddress =
          neighbourhood;
      }

      // =============================================
      // UPDATE FORM
      // =============================================

      setFormData((prev) => ({
        ...prev,

        latitude:
          latitude.toString(),

        longitude:
          longitude.toString(),

        houseNo:
          houseNumber ||
          prev.houseNo,

        addressLine1:
          generatedAddress ||
          prev.addressLine1,

        city:
          city || prev.city,

        state:
          state || prev.state,

        pincode:
          postcode || prev.pincode,

        country:
          country || prev.country,
      }));

      setLocationMessage(
        "Location selected. Please verify the address before saving."
      );

    } catch (geocodeError) {
      console.error(
        "Reverse geocoding failed:",
        geocodeError
      );

      setFormData((prev) => ({
        ...prev,

        latitude:
          latitude.toString(),

        longitude:
          longitude.toString(),
      }));

      setLocationMessage(
        "GPS coordinates saved. Please enter or verify the address manually."
      );

    } finally {
      setLoadingMapAddress(false);
    }
  };

  // ===================================================
  // LOCATION SELECTED
  // ===================================================

  const handleMapLocationSelected =
    async (
      latitude,
      longitude
    ) => {
      setError("");

      setMapPosition({
        lat: latitude,
        lng: longitude,
      });

      await reverseGeocode(
        latitude,
        longitude
      );
    };

  // ===================================================
  // USE CURRENT LOCATION
  // ===================================================

  const handleUseCurrentLocation =
    () => {
      setError("");
      setLocationMessage("");

      if (!navigator.geolocation) {
        setError(
          "Location services are not supported by this browser."
        );

        return;
      }

      setLocating(true);

      setLocationMessage(
        "Getting your current location..."
      );

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          console.log(
            "GPS Location:",
            {
              latitude,
              longitude,
              accuracy:
                position.coords
                  .accuracy,
            }
          );

          await handleMapLocationSelected(
            latitude,
            longitude
          );

          setLocating(false);
        },

        (locationError) => {
          console.error(
            "Location error:",
            locationError
          );

          let message =
            "Unable to get your current location.";

          switch (
            locationError.code
          ) {
            case 1:
              message =
                "Location permission was denied. Please allow location access in your browser settings.";
              break;

            case 2:
              message =
                "Your location could not be determined. Please try again.";
              break;

            case 3:
              message =
                "Location request timed out. Please try again.";
              break;

            default:
              message =
                "Unable to get your current location. Please try again.";
          }

          setError(message);
          setLocationMessage("");
          setLocating(false);
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };

  // ===================================================
  // OPEN ADD FORM
  // ===================================================

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

    setMapPosition(null);
    setError("");
    setLocationMessage("");
    setShowForm(true);
  };

  // ===================================================
  // RESET FORM
  // ===================================================

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

    setMapPosition(null);
    setShowForm(false);
    setError("");
    setLocationMessage("");
  };

  // ===================================================
  // ADD ADDRESS
  // ===================================================

  const handleAddAddress = async () => {
    try {
      setSaving(true);
      setError("");

      await API.post(
        "/customer/addresses",
        formData
      );

      await fetchAddresses();

      resetForm();

    } catch (err) {
      console.error(
        "Failed to add address:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Failed to add address."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // EDIT ADDRESS
  // ===================================================

  const handleEdit = (address) => {
    setEditingId(address.id);

    const latitude =
      address.latitude;

    const longitude =
      address.longitude;

    setFormData({
      addressType:
        address.addressType ||
        "Home",

      fullName:
        address.fullName ||
        "",

      mobile:
        address.mobile ||
        "",

      houseNo:
        address.houseNo ||
        "",

      addressLine1:
        address.addressLine1 ||
        "",

      addressLine2:
        address.addressLine2 ||
        "",

      landmark:
        address.landmark ||
        "",

      city:
        address.city ||
        "",

      state:
        address.state ||
        "",

      pincode:
        address.pincode ||
        "",

      country:
        address.country ||
        "India",

      latitude:
        latitude !== null &&
        latitude !== undefined
          ? String(latitude)
          : "",

      longitude:
        longitude !== null &&
        longitude !== undefined
          ? String(longitude)
          : "",

      isDefault:
        Boolean(
          address.isDefault
        ),
    });

    if (
      latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined
    ) {
      setMapPosition({
        lat: Number(latitude),
        lng: Number(longitude),
      });

      setLocationMessage(
        "This address has a saved GPS location."
      );
    } else {
      setMapPosition(null);
      setLocationMessage("");
    }

    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================================================
  // UPDATE ADDRESS
  // ===================================================

  const handleUpdateAddress =
    async () => {
      try {
        setSaving(true);
        setError("");

        await API.put(
          `/customer/addresses/${editingId}`,
          formData
        );

        await fetchAddresses();

        resetForm();

      } catch (err) {
        console.error(
          "Failed to update address:",
          err
        );

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            err.response?.data?.msg ||
            "Failed to update address."
        );
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await handleUpdateAddress();
    } else {
      await handleAddAddress();
    }
  };

  // ===================================================
  // DELETE ADDRESS
  // ===================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this address?"
      );

    if (!confirmed) return;

    try {
      setError("");

      await API.delete(
        `/customer/addresses/${id}`
      );

      await fetchAddresses();

    } catch (err) {
      console.error(
        "Failed to delete address:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Failed to delete address."
      );
    }
  };

  // ===================================================
  // SET DEFAULT
  // ===================================================

  const handleSetDefault =
    async (id) => {
      try {
        setError("");

        await API.patch(
          `/customer/addresses/${id}/default`
        );

        await fetchAddresses();

      } catch (err) {
        console.error(
          "Failed to set default address:",
          err
        );

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            err.response?.data?.msg ||
            "Failed to set default address."
        );
      }
    };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="my-addresses">
        <div className="addresses-loading">
          Loading your addresses...
        </div>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="my-addresses">

      {/* HEADER */}

      <div className="addresses-header">

        <div>
          <h1>
            My Addresses
          </h1>

          <p>
            Manage your saved delivery addresses
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="add-address-btn"
            onClick={openAddForm}
          >
            + Add New Address
          </button>
        )}

      </div>

      {/* ERROR */}

      {error && (
        <div className="address-error">
          {error}
        </div>
      )}

      {/* ADD / EDIT FORM */}

      {showForm && (
        <div className="address-form-card">

          <div className="form-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Address"
                  : "Add New Address"}
              </h2>

              <p>
                Select your exact delivery location
                and verify your address details.
              </p>
            </div>

            <button
              type="button"
              className="close-form-btn"
              onClick={resetForm}
              disabled={
                saving ||
                locating ||
                loadingMapAddress
              }
            >
              ×
            </button>

          </div>

          {/* DELIVERY LOCATION */}

          <div className="delivery-location-section">

            <div className="delivery-location-header">

              <div>
                <h3>
                  📍 Delivery Location
                </h3>

                <p>
                  Click on the map or use your current
                  location to select the delivery point.
                </p>
              </div>

              <button
                type="button"
                className="use-location-btn"
                onClick={
                  handleUseCurrentLocation
                }
                disabled={
                  locating ||
                  saving ||
                  loadingMapAddress
                }
              >
                {locating
                  ? "📍 Detecting..."
                  : "📍 Use My Current Location"}
              </button>

            </div>

            <div className="delivery-map-wrapper">

              <MapContainer
                center={[
                  mapPosition?.lat ||
                    DEFAULT_MAP_POSITION.lat,

                  mapPosition?.lng ||
                    DEFAULT_MAP_POSITION.lng,
                ]}
                zoom={
                  mapPosition
                    ? 17
                    : 5
                }
                scrollWheelZoom={true}
                className="delivery-map"
              >

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapCenter
                  position={mapPosition}
                />

                <MapClickHandler
                  onLocationSelected={
                    handleMapLocationSelected
                  }
                />

                <DeliveryMarker
                  position={mapPosition}
                  onLocationSelected={
                    handleMapLocationSelected
                  }
                />

              </MapContainer>

              {!mapPosition && (
                <div className="map-instruction">

                  <span>
                    📍
                  </span>

                  <div>
                    <strong>
                      Select your delivery location
                    </strong>

                    <small>
                      Click anywhere on the map or use
                      your current location.
                    </small>
                  </div>

                </div>
              )}

            </div>

            {locationMessage && (
              <div className="location-message">
                {locationMessage}
              </div>
            )}

            {formData.latitude &&
              formData.longitude && (
                <div className="gps-location-info">

                  <div>
                    <strong>
                      📍 Exact Location Selected
                    </strong>
                  </div>

                  <div className="gps-coordinates">

                    <span>
                      Latitude:{" "}
                      {Number(
                        formData.latitude
                      ).toFixed(8)}
                    </span>

                    <span>
                      Longitude:{" "}
                      {Number(
                        formData.longitude
                      ).toFixed(8)}
                    </span>

                  </div>

                </div>
              )}

          </div>

          {/* ADDRESS FORM */}

          <form onSubmit={handleSubmit}>

            {/* ADDRESS TYPE */}

            <div className="form-group">

              <label>
                Address Type
              </label>

              <div className="address-type-options">

                {[
                  "Home",
                  "Work",
                  "Other",
                ].map((type) => (
                  <label
                    key={type}
                    className={
                      formData.addressType ===
                      type
                        ? "type-option active"
                        : "type-option"
                    }
                  >

                    <input
                      type="radio"
                      name="addressType"
                      value={type}
                      checked={
                        formData.addressType ===
                        type
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      {type ===
                        "Home" &&
                        "🏠"}

                      {type ===
                        "Work" &&
                        "🏢"}

                      {type ===
                        "Other" &&
                        "📍"}
                    </span>

                    {type}

                  </label>
                ))}

              </div>

            </div>

            {/* NAME + MOBILE */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={
                    formData.fullName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter full name"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  name="mobile"
                  value={
                    formData.mobile
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                />

              </div>

            </div>

            {/* HOUSE */}

            <div className="form-group">

              <label>
                House / Flat / Building *
              </label>

              <input
                type="text"
                name="houseNo"
                value={
                  formData.houseNo
                }
                onChange={
                  handleChange
                }
                placeholder="House no., Flat no., Building name"
                required
              />

            </div>

            {/* ADDRESS LINE 1 */}

            <div className="form-group">

              <label>
                Address *
              </label>

              <input
                type="text"
                name="addressLine1"
                value={
                  formData.addressLine1
                }
                onChange={
                  handleChange
                }
                placeholder="Street, area, locality"
                required
              />

            </div>

            {/* ADDRESS LINE 2 */}

            <div className="form-group">

              <label>
                Address Line 2
              </label>

              <input
                type="text"
                name="addressLine2"
                value={
                  formData.addressLine2
                }
                onChange={
                  handleChange
                }
                placeholder="Additional address details"
              />

            </div>

            {/* LANDMARK */}

            <div className="form-group">

              <label>
                Landmark
              </label>

              <input
                type="text"
                name="landmark"
                value={
                  formData.landmark
                }
                onChange={
                  handleChange
                }
                placeholder="Nearby landmark"
              />

            </div>

            {/* CITY + STATE */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  City *
                </label>

                <input
                  type="text"
                  name="city"
                  value={
                    formData.city
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="City"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  State *
                </label>

                <input
                  type="text"
                  name="state"
                  value={
                    formData.state
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="State"
                  required
                />

              </div>

            </div>

            {/* PINCODE + COUNTRY */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Pincode *
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={
                    formData.pincode
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="6-digit pincode"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={
                    formData.country
                  }
                  readOnly
                />

              </div>

            </div>

            {/* GPS */}

            {formData.latitude &&
              formData.longitude && (
                <div className="gps-location-info">

                  <strong>
                    📍 GPS Location Saved
                  </strong>

                  <div className="gps-coordinates">

                    <span>
                      Latitude:{" "}
                      {Number(
                        formData.latitude
                      ).toFixed(8)}
                    </span>

                    <span>
                      Longitude:{" "}
                      {Number(
                        formData.longitude
                      ).toFixed(8)}
                    </span>

                  </div>

                </div>
              )}

            {/* DEFAULT */}

            <label className="default-address-option">

              <input
                type="checkbox"
                name="isDefault"
                checked={
                  formData.isDefault
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Set this as my default address
              </span>

            </label>

            {/* ACTIONS */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
                disabled={
                  saving ||
                  locating ||
                  loadingMapAddress
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-address-btn"
                disabled={
                  saving ||
                  locating ||
                  loadingMapAddress
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Address"
                  : "Save Address"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* EMPTY STATE */}

      {!showForm &&
        addresses.length === 0 && (
          <div className="empty-addresses">

            <div className="empty-address-icon">
              📍
            </div>

            <h2>
              No saved addresses
            </h2>

            <p>
              Add your first delivery address
              to make booking faster and easier.
            </p>

            <button
              type="button"
              className="add-address-btn"
              onClick={openAddForm}
            >
              + Add New Address
            </button>

          </div>
        )}

      {/* SAVED ADDRESSES */}

      {!showForm &&
        addresses.length > 0 && (
          <div className="addresses-grid">

            {addresses.map((address) => {

              const isDefault =
                Boolean(
                  address.isDefault
                );

              const hasLocation =
                address.latitude !==
                  null &&
                address.latitude !==
                  undefined &&
                address.longitude !==
                  null &&
                address.longitude !==
                  undefined;

              return (
                <div
                  className={
                    isDefault
                      ? "address-card default"
                      : "address-card"
                  }
                  key={address.id}
                >

                  {/* HEADER */}

                  <div className="address-card-header">

                    <div className="address-type">

                      <span className="address-icon">

                        {address.addressType ===
                          "Work" &&
                          "🏢"}

                        {address.addressType ===
                          "Other" &&
                          "📍"}

                        {(!address.addressType ||
                          address.addressType ===
                            "Home") &&
                          "🏠"}

                      </span>

                      <strong>
                        {address.addressType ||
                          "Home"}
                      </strong>

                    </div>

                    {isDefault && (
                      <span className="default-badge">
                        DEFAULT
                      </span>
                    )}

                  </div>

                  {/* DETAILS */}

                  <div className="address-details">

                    <h3>
                      {address.fullName}
                    </h3>

                    <p className="address-mobile">
                      {address.mobile}
                    </p>

                    <p>
                      {address.houseNo}
                    </p>

                    <p>
                      {address.addressLine1}
                    </p>

                    {address.addressLine2 && (
                      <p>
                        {address.addressLine2}
                      </p>
                    )}

                    {address.landmark && (
                      <p>
                        <strong>
                          Landmark:
                        </strong>{" "}
                        {address.landmark}
                      </p>
                    )}

                    <p>
                      {address.city},{" "}
                      {address.state} -{" "}
                      {address.pincode}
                    </p>

                    <p>
                      {address.country ||
                        "India"}
                    </p>

                    {hasLocation && (
                      <p className="saved-location-status">
                        📍 Exact GPS location saved
                      </p>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="address-actions">

                    <button
                      type="button"
                      className="edit-address-btn"
                      onClick={() =>
                        handleEdit(
                          address
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-address-btn"
                      onClick={() =>
                        handleDelete(
                          address.id
                        )
                      }
                    >
                      Delete
                    </button>

                    {!isDefault && (
                      <button
                        type="button"
                        className="default-address-btn"
                        onClick={() =>
                          handleSetDefault(
                            address.id
                          )
                        }
                      >
                        Set as Default
                      </button>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

    </div>
  );
}
