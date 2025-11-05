'use client'

import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa'; // FontAwesome Star
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import { useAuthToken } from '../contexts/AuthTokenContext.jsx'
import { usePayment } from '../hooks/usePayment.js';

export default function Pricing() {
  const [tokens, setTokens] = useState(0);
  const { tokens: credits, loading} = useAuthToken() 
  const { handlePayment, loading:paymentloading } = usePayment()

  const plans = [
    {
        name: "Starter",
        price: 2,
        rupees: 20,
        period: "",
        description: "Perfect for small teams and startups",
        popular: false
    },
    {
        name: "Professional",
        price: 10,
        rupees: 90,
        period: "",
        description: "Ideal for growing companies",
        popular: true
    },
    {
        name: "Enterprise",
        price: 20,
        rupees: 175,
        period: "",
        description: "For large organizations with high volume needs",
        popular: false
    }
    ];

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Choose Your
              <span className="block bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Start and scale as your hiring needs grow. 
              All plans include our core AI-powered resume ranking technology.
            </p>
            {/* Display Tokens */}
            <p className="mt-4 text-lg font-semibold">
              Tokens Remaining:{" "}
              <span className={`${credits === 0 ? 'text-red-600' : 'text-violet-600'}`}>
                {loading ? '...' : credits ?? 0}
              </span>
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  plan.popular 
                  ? 'ring-2 ring-violet-500 scale-105' 
                  : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-violet-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <FaStar className="h-4 w-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline mb-8">
                    <span className="text-3xl font-bold text-gray-900">{plan.price} Token(s)</span>
                    {plan.rupees && <span className="text-lg text-gray-600 ml-2">₹{plan.rupees}</span>}
                    {!plan.rupees && plan.period && <span className="text-lg text-gray-600 ml-2">{plan.period}</span>}
                  </div>
                  
                  <button
                    className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-300 ${
                      plan.popular
                      ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    onClick={() => handlePayment(plan.rupees, plan.price)}
                    disabled={paymentloading}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Solution Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need a Custom Solution?</h2>
            <p className="text-gray-600 mb-6">
              For enterprises with specific requirements, we offer custom AI models, dedicated infrastructure, and personalized support packages.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-gradient-to-r from-violet-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-violet-600 hover:to-blue-600 transition-all duration-300">
                Contact Sales
              </button>
              <button className="border-2 border-violet-500 text-violet-500 px-6 py-3 rounded-lg font-semibold hover:bg-violet-50 transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-gray-600 mt-12">
            <p className="mb-2">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <span><FaStar className="inline text-violet-500 mr-1" />No setup fees</span>
              <span><FaStar className="inline text-violet-500 mr-1" />Data security & privacy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
