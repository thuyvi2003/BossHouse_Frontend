// src/pages/VetSchedulePage.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";

export default function VetSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedSchedules, setSelectedSchedules] = useState([]);

  // --- Fetch lịch của chính vet ---
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get("/api/vet-schedule/my");
        setSchedules(res.data.data || []);
      } catch (err) {
        console.error("Failed to load schedules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // --- Kiểm tra ngày có lịch ---
  const hasSchedule = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return schedules.some((sch) => {
      const start = new Date(sch.start_time).toISOString().split("T")[0];
      return start === formattedDate;
    });
  };

  // --- Khi chọn ngày ---
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const daySchedules = schedules.filter((sch) => {
      const start = new Date(sch.start_time).toISOString().split("T")[0];
      return start === date.toISOString().split("T")[0];
    });
    setSelectedSchedules(daySchedules);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading schedule...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-[#6B1700]">My Vet Schedule</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white p-4 rounded-xl shadow border">
          <Calendar
            onClickDay={handleDateClick}
            value={selectedDate}
            tileClassName={({ date, view }) =>
              view === "month" && hasSchedule(date)
                ? "bg-[#CEAF95] text-white rounded-lg"
                : ""
            }
          />
        </div>

        {/* Details */}
        <div className="bg-white p-4 rounded-xl shadow border">
          <h2 className="text-lg font-medium mb-3">
            Schedule on {selectedDate.toLocaleDateString()}
          </h2>
          {selectedSchedules.length > 0 ? (
            <ul className="space-y-3">
              {selectedSchedules.map((s, i) => (
                <li key={i} className="border p-3 rounded-lg">
                  <div className="text-sm text-gray-700">
                    <strong>Time:</strong>{" "}
                    {new Date(s.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(s.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {s.is_available ? "🟢 Available" : "🔴 Unavailable"}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm italic">No schedule on this day.</p>
          )}
        </div>
      </div>
    </div>
  );
}
