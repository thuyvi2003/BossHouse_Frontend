import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import notificationService from "@/services/notificationService";

export default function NotificationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await notificationService.getNotificationById(id);
        const payload = res?.data || res;
        setData(payload);
        // Mark as read best-effort
        try { await notificationService.markAsRead(id); } catch {}
      } catch (e) {
        setError(e.message || "Failed to load notification");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back
      </button>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !data ? (
        <div className="text-gray-600">Not found</div>
      ) : (
        <article className="bg-white rounded-lg shadow border p-6">
          <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
          <div className="text-sm text-gray-500 mb-4">{formatDate(data.created_at || data.createdAt)}</div>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{data.content || data.description}</p>
          </div>
        </article>
      )}
    </div>
  );
}


