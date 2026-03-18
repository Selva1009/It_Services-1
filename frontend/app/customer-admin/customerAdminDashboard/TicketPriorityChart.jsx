"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TicketPriorityChart({ labels, values }) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#ef4444", "#f97316", "#16a34a"],
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
  };

  return <Pie data={data} options={options} />;
}
