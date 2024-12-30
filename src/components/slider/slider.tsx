"use client";

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ExampleSlider = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

  const slideData = [
    { id: 1, content: "첫 번째 슬라이드" },
    { id: 2, content: "두 번째 슬라이드" },
    { id: 3, content: "세 번째 슬라이드" },
  ];

  return (
    <div style={{ width: "300px", margin: "0 auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        슬라이더 예시
      </h2>
      <Slider {...sliderSettings}>
        {slideData.map((slide) => (
          <div
            key={slide.id}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              backgroundColor: "#f7f7f7",
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              padding: "1rem",
              fontSize: "1.2rem",
            }}
          >
            {slide.content}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ExampleSlider;
