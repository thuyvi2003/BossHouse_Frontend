import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { fetchRevenueStatistics } from "@/services/statisticsService";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#14B8A6", "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

// Format currency helper
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

// Format number to millions/billions
const formatNumber = (value) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return (value / 1000).toFixed(1) + "K";
};

const StatisticsDashboard = () => {
  // Time range options
  const timeRangeOptions = [
    { label: "Last 1 months", months: 3 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 7 days", days: 7 },
  ];

  const [selectedTimeRange, setSelectedTimeRange] = useState("Last 3 months");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate date range from selected time range
  const getDateRange = (rangeLabel) => {
    const option = timeRangeOptions.find((opt) => opt.label === rangeLabel);
    if (!option || option.months === null) {
      return {
        startDate: dayjs().subtract(10, "year").format("YYYY-MM-DD"),
        endDate: dayjs().format("YYYY-MM-DD"),
      };
    }
    return {
      startDate: dayjs().subtract(option.months - 1, "month").startOf("month").format("YYYY-MM-DD"),
      endDate: dayjs().format("YYYY-MM-DD"),
    };
  };

  // Load statistics when time range changes
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError("");
        const { startDate, endDate } = getDateRange(selectedTimeRange);
        const data = await fetchRevenueStatistics({
          start_date: startDate,
          end_date: endDate,
        });
        setStats(data);
      } catch (err) {
        console.error("Failed to load statistics:", err);
        setError("Failed to load statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [selectedTimeRange]);

  // Prepare stacked area chart data
  const incomeChartData = useMemo(() => {
    if (!stats?.revenueTrend) return [];
    return stats.revenueTrend.map((item) => ({
      date: dayjs(item.date).format("MMM DD"),
      revenue: item.revenue || 0,
      cost: item.cost || 0,
    }));
  }, [stats?.revenueTrend]);

  // Prepare pie chart data for income distribution
  const incomeDistributionData = useMemo(() => {
    if (!stats) return [];
    const revenue = stats.totalRevenue || 0;
    const cost = stats.totalCost || 0;
    const profit = revenue - cost;

    return [
      { name: "Revenue", value: revenue, color: COLORS[0] },
      { name: "Cost", value: cost, color: COLORS[1] },
      { name: "Profit", value: profit > 0 ? profit : 0, color: COLORS[2] },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Get date range subtitle for pie chart
  const dateRangeSubtitle = useMemo(() => {
    if (!stats?.filters) return "";
    const start = dayjs(stats.filters.startDate);
    const end = dayjs(stats.filters.endDate);
    return `${start.format("MMMM")} - ${end.format("MMMM YYYY")}`;
  }, [stats?.filters]);

  return (
    <div className="p-6">
      {/* Background pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, white 1px, transparent 0),
            radial-gradient(circle at 2px 2px, white 1px, transparent 0)
          `,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Income Overview - Stacked Area Chart */}
        <section className="bg-white rounded-lg shadow-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Income Overview - Stacked Expanded
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing income statistics for available days
              </p>
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Loading statistics...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              {error}
            </div>
          ) : incomeChartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={incomeChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="square"
                  formatter={(value) => (
                    <span style={{ color: "#374151", fontSize: "14px" }}>
                      {value}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Export Revenue (VND)"
                  stroke="#14B8A6"
                  fill="url(#colorRevenue)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  name="Import Cost (VND)"
                  stroke="#EF4444"
                  fill="url(#colorCost)"
                  stackId="1"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Pie Chart - Income Distribution */}
        <section className="bg-white rounded-lg shadow-2xl p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Pie Chart - Income Distribution
            </h2>
            <p className="text-sm text-gray-500 mt-1">{dateRangeSubtitle}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Loading statistics...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              {error}
            </div>
          ) : incomeDistributionData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for selected period
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={incomeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: "#374151", fontSize: "14px" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StatisticsDashboard;