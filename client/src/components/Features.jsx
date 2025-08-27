// src/components/FeaturesCard.jsx
import React from "react";

const Features = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-start text-left 
      transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-2xl mb-6">
        {icon}
      </div>
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {/* Description */}
      <p className="text-gray-600 mt-3 leading-relaxed">{description}</p>
    </div>
  );
};

export default Features;
