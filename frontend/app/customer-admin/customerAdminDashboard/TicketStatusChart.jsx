"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TicketStatusChart({ labels, values }) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#64748b", "#7c3aed", "#2563eb", "#ef4444", "#16a34a", "#94a3b8"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
    cutout: "62%",
  };

  return <Doughnut data={data} options={options} />;
}
