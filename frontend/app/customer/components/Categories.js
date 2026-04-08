"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const CategoryMenu = ({ categories = [], activeCategory = "", setCategoryFilter }) => {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  return (
    <section className="ch-top-categories" aria-label="Top support categories">
      <div className="ch-top-cat-head">
        <h2>Top Categories</h2>
        <p>Select one category for exact matching. Use search for broader discovery.</p>
      </div>

      <div className="ch-top-cat-rail-wrap">
        <button className="ch-top-cat-nav" onClick={() => handleScroll("left")} aria-label="Scroll categories left">
          <ChevronLeft size={16} />
        </button>

        <div ref={scrollContainerRef} className="ch-top-cat-rail">
          <button
            className={`ch-top-cat-pill${activeCategory ? "" : " active"}`}
            onClick={() => setCategoryFilter("")}
          >
            All Categories
          </button>

          {categories.map((category) => {
            const totalIssues = ["L1", "L2", "L3"].reduce(
              (sum, level) => sum + (category.levels?.[level]?.length || 0),
              0
            );

            return (
              <button
                key={category.name}
                className={`ch-top-cat-pill${activeCategory === category.name ? " active" : ""}`}
                onClick={() => setCategoryFilter(category.name)}
              >
                <span className="ch-top-cat-main">
                  <span className="ch-top-cat-name">{category.name}</span>
                  <span className="ch-top-cat-count">{totalIssues}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button className="ch-top-cat-nav" onClick={() => handleScroll("right")} aria-label="Scroll categories right">
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default CategoryMenu;
