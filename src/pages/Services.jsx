// src/pages/Services.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import optionService from "../services/optionService";

import groomingImg from "../assets/services/grooming.jpg";
import boardingImg from "../assets/services/boarding.jpg";
import healthCheckImg from "../assets/services/health-check.jpg";
import vaccinationImg from "../assets/services/vaccination.jpg";
import adoptionImg from "../assets/services/adoption-consultation.jpg";

const serviceImages = {
  "Grooming": groomingImg,
  "Boarding": boardingImg,
  "Health Check": healthCheckImg,
  "Vaccination": vaccinationImg,
  "Adoption Consultation": adoptionImg,
};

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await optionService.getAllOptions();
        setServices(data.services);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBook = (service) => {
    navigate("/user-booking", { state: { selectedService: service } });
  };

  if (loading) return <p className="text-center mt-8">Loading services...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-yellow-800 mb-8 text-center">Our Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s) => (
          <div
            key={s._id}
            className="flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
          >
            <div className="h-48 overflow-hidden rounded-t-2xl">
              <img
                src={serviceImages[s.name]}
                alt={s.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{s.name}</h2>
              <div className="flex justify-between text-gray-600 font-medium mb-3">
                <span>Price: ${s.base_price}</span>
                <span>Duration: {s.duration_minutes} mins</span>
              </div>
              <p className="text-gray-700 text-sm mb-4 line-clamp-4">{s.description}</p>
              <button
                onClick={() => handleBook(s)}
                className="mt-auto self-start px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
