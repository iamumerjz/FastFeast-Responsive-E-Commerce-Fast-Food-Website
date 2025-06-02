import React from "react";
import "./PromoCards.css";
import burgerImg from "../assets/burger.png";
import pizzaImg from "../assets/pizza.png";

const PROMOS = [
  {
    id: "burger-thursday",
    img: burgerImg,
    title: "Tasty Thursdays",
    discount: "20%",
    desc: "Off",
    btn: "Order Now",
  },
  {
    id: "pizza-days",
    img: pizzaImg,
    title: "Pizza Days",
    discount: "15%",
    desc: "Off",
    btn: "Order Now",
  },
];

const PromoCards = () => (
  <section className="ff-promo-cards-section">
    <div className="ff-promo-cards-container">
      {PROMOS.map((promo) => (
        <div className="ff-promo-card" id={`promo-${promo.id}`} key={promo.id}>
          <div className="ff-promo-img-circle">
            <img src={promo.img} alt={promo.title} />
          </div>
          <div className="ff-promo-content">
            <h3 className="ff-promo-title">{promo.title}</h3>
            <div className="ff-promo-discount">
              <span className="ff-promo-percent">{promo.discount}</span>
              <span className="ff-promo-off">{promo.desc}</span>
            </div>
            <button
              className="ff-promo-btn"
              onClick={() => {
                document
                  .getElementById("menu-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {promo.btn}
              <span className="ff-promo-cart">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mobile-icon"
                  fill="none"
                  stroke="#ee032b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <rect x="3" y="7" width="18" height="14" rx="2" ry="2" />
                  <path d="M16 7V5a4 4 0 0 0-8 0v2" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default PromoCards;
