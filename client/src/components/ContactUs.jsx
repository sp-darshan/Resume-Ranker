// src/components/Contact.jsx
import React from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaCheckCircle, FaRocket } from "react-icons/fa";

const Contact = () => {
  return (
    <section id="contact" className="py-20 mb-5">
      {/* Heading */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900">
          Get in <span className="text-indigo-600">Touch</span>
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Have questions about our AI-powered resume ranking system? 
          We’d love to hear from you and help optimize your hiring process.
        </p>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6">
        {/* Left Side */}
        <div className="space-y-8">
          {/* Email */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl">
              <FaEnvelope />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Email Us</h4>
              <p className="text-gray-600">contact@resumerank.ai</p>
              <p className="text-gray-600">support@resumerank.ai</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl">
              <FaPhoneAlt />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Call Us</h4>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <p className="text-gray-600">Mon-Fri 9AM–6PM EST</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Visit Us</h4>
              <p className="text-gray-600">123 AI Innovation Drive</p>
              <p className="text-gray-600">San Francisco, CA 94105</p>
            </div>
          </div>

          {/* Why Choose Box */}
          <div className="bg-indigo-50 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">
              Why Choose ResumeRank AI?
            </h4>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center space-x-2">
                <FaCheckCircle className="text-indigo-600" /> 
                <span>99.9% uptime guarantee</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaCheckCircle className="text-indigo-600" /> 
                <span>24/7 customer support</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaCheckCircle className="text-indigo-600" /> 
                <span>GDPR compliant & secure</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaCheckCircle className="text-indigo-600" /> 
                <span>Free trial with no commitments</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">
            Send us a message
          </h4>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Your company name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <textarea
              placeholder="Tell us about your hiring needs..."
              rows="5"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
            <button
              type="submit" 
              className="w-full py-3 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium hover:opacity-90 transition"
            >
              <FaRocket />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
