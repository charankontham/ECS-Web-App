import React, { useEffect, useRef, useState } from "react";
import "../css/ProductImages.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpFromBracket,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "@src/util/api";

interface ProductImagesProps {
  images: string[];
}

const ProductImagesBlock: React.FC<ProductImagesProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState({
    image: images.length > 0 ? images[0] : "",
    index: 0,
  });
  const imageListRef = useRef<HTMLDivElement>(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageApiUrl = `${API_BASE_URL}/ecs-inventory-admin/api/public/images`;

  useEffect(() => {
    setSelectedImage({ image: images[0], index: 0 });
  }, [images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const scrollUp = () => {
    if (imageListRef.current) {
      imageListRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    if (imageListRef.current) {
      imageListRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  return (
    <div className="product-images-container">
      <div className="main-image-container">
        <div
          className="main-image-wrapper"
          ref={imageContainerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={
              selectedImage.image
                ? `${imageApiUrl}/view/getImageById/${selectedImage.image}`
                : "/assets/images/image-placeholder.jpg"
            }
            alt="Selected Product"
            className={`main-image ${isZoomed ? "zoomed" : ""}`}
            style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
          />
        </div>
        {/* Share Button */}
        <button
          className="btn-share"
          onClick={() => navigator.share?.({ url: window.location.href })}
        >
          <FontAwesomeIcon icon={faArrowUpFromBracket}></FontAwesomeIcon>
        </button>
      </div>

      {/* Left Side: Image List */}
      <div className="image-list-container">
        <button className="scroll-btn" onClick={scrollUp}>
          {/* &uarr; */}
          <FontAwesomeIcon icon={faChevronLeft}></FontAwesomeIcon>
        </button>
        <div className="image-list" ref={imageListRef}>
          {images.map((image, index) => (
            <img
              key={index}
              src={
                image == "" || image == null
                  ? "/assets/images/image-placeholder.jpg"
                  : `${imageApiUrl}/view/getImageById/${image}`
              }
              alt={`Thumbnail ${index + 1}`}
              className={`thumbnail ${
                index === selectedImage.index ? "active" : ""
              }`}
              onClick={() => setSelectedImage({ image: image, index: index })}
            />
          ))}
        </div>
        <button className="scroll-btn" onClick={scrollDown}>
          {/* &darr; */}
          <FontAwesomeIcon icon={faChevronRight}></FontAwesomeIcon>
        </button>
      </div>
    </div>
  );
};

export default ProductImagesBlock;
