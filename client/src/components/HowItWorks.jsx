// src/components/HowItWorks.jsx
import React from "react";
import { FaUpload, FaBriefcase, FaMagic } from "react-icons/fa";

const steps = [
  {
    icon: <FaUpload />,
    title: "Upload Your Resume",
    description: "Choose your resume (PDF format) and upload it securely to our AI system.",
  },
  {
    icon: <FaBriefcase />,
    title: "Enter Job Description (Optional)",
    description: "Paste a job description to get tailored resume feedback aligned to the role.",
  },
  {
    icon: <FaMagic />,
    title: "Click Analyze Resume",
    description: "Our AI instantly generates an ATS score, strengths, and suggestions for improvement.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      {/* Heading */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900">
          How It <span className="text-indigo-600">Works</span>
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Follow these three simple steps to analyze and improve your resume with AI.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-xl hover:scale-105 transition-transform duration-300"
          >
            <div className="text-indigo-600 text-5xl mb-6">{step.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
            <p className="text-gray-600 mt-3">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
