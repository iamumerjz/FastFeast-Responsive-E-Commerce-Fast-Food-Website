import React, { useEffect, useState } from "react";
import slide1Img from "../assets/hero.png";
import slide2Img from "../assets/hero2.jpg";
import slide3Img from "../assets/hero3.jpg";
import "./HeroSlider.css";

const slides = [
  {
    image: slide1Img,
    heading: "FRESH & HOT",
    subheading: "Hot off the grill, straight to your plate.",
    buttonText: "ORDER NOW",
  },
  {
    image: slide2Img,
    heading: "TASTY PIZZAS",
    subheading: "Experience the juicy goodness of our signature pizzas.",
    buttonText: "ORDER NOW",
  },
  {
    image: slide3Img,
    heading: "CRISPY FRIES",
    subheading: "Golden and crunchy fries made to perfection.",
    buttonText: "ORDER NOW",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7500);

    return () => clearTimeout(timer);
  }, [current]);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <div className="hero-slider" id="hero-section">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="overlay" />
          <div className="slide-content">
            <h1>{slide.heading}</h1>
            <p>{slide.subheading}</p>
            <button
              onClick={() => {
                document
                  .getElementById("menu-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {slide.buttonText}
            </button>
          </div>
        </div>
      ))}

      {/* Pagination dots */}
      <div className="pagination-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
