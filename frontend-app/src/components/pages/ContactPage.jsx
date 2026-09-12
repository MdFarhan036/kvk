import { useEffect, useState } from "react";
import "./ContactPage.css";

import api from "../../components/api";

export const ContactPage = () => {
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    category: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =================================
  // FETCH CATEGORIES
  // =================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Error fetching categories:",
          error
        );

        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // =================================
  // HANDLE INPUT CHANGE
  // =================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =================================
  // HANDLE FORM SUBMIT
  // =================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      console.log("Contact Form Data:", formData);

      // Later:
      // await api.post("/contact", formData);

      setSuccessMessage(
        "Thank you! Your message has been sent successfully."
      );

      setFormData({
        name: "",
        email: "",
        mobile: "",
        category: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      alert(
        "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">

      {/* CONTACT INFORMATION */}

      <div className="contact-info">
        <h2>Contact Us</h2>

        <div className="contact-details">

          <div className="detail">
            <h3>Address</h3>
            <p>
              Chandwa, Latehar, Jharkhand
            </p>
          </div>

          <div className="detail">
            <h3>Phone</h3>

            <a href="tel:+919308270123">
              +91 930 827 0123
            </a>
          </div>

          <div className="detail">
            <h3>Service Mobile</h3>

            <a href="tel:+91XXXXXXXXXX">
              +91 XXXXXXXXXX
            </a>
          </div>

          <div className="detail">
            <h3>Email</h3>

            <a href="mailto:krishivikashkendra@gmail.com">
              krishivikashkendra@gmail.com
            </a>
          </div>

          <div className="detail">
            <h3>Working Hours</h3>

            <p>
              10:00 AM - 6:00 PM
              <br />
              Monday - Saturday
            </p>
          </div>

        </div>
      </div>


      {/* CONTACT FORM */}

      <div className="contact-form">
        <h2>Send Us a Message</h2>

        <form onSubmit={handleSubmit}>

          {/* NAME */}

          <label htmlFor="name">
            Your Name
          </label>

          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />


          {/* EMAIL */}

          <label htmlFor="email">
            Your Email
          </label>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />


          {/* MOBILE */}

          <label htmlFor="mobile">
            Mobile Number
          </label>

          <input
            type="tel"
            id="mobile"
            name="mobile"
            placeholder="Enter your mobile number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />


          {/* CATEGORY */}

          <label htmlFor="category">
            Service Category
          </label>

          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => {
              const categoryName =
                category.category_name ||
                category.name ||
                category.title ||
                "";

              return (
                <option
                  key={category.id || categoryName}
                  value={categoryName}
                >
                  {categoryName}
                </option>
              );
            })}
          </select>


          {/* MESSAGE */}

          <label htmlFor="message">
            Your Message
          </label>

          <textarea
            id="message"
            name="message"
            rows="5"
            placeholder="Write your message here..."
            value={formData.message}
            onChange={handleChange}
            required
          />


          {/* SUCCESS MESSAGE */}

          {successMessage && (
            <p className="contact-success">
              {successMessage}
            </p>
          )}


          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Sending..."
              : "Send Message"}
          </button>

        </form>
      </div>


      {/* GOOGLE MAP */}

      <div className="contact-map">
        <h2>Our Location</h2>

        <iframe
          src="https://www.google.com/maps?q=Chandwa,Latehar,Jharkhand&output=embed"
          title="Krishi Vikas Kendra Location"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

    </div>
  );
};