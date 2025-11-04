import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function WeatherGraph({ lat, lon }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPastData = async () => {
      try {
        // 🌡️ OpenWeather historical data API (requires paid plan for full 5-day history)
        // For free plan, we’ll simulate last 5 days using current + forecast API
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=7bbc4822f963c2409c4c436893addfaa`
        );
        const json = await res.json();

        const daily = [];
        const temps = [];
        const dates = [];

        // Pick one data point every 8 steps (24 hours)
        for (let i = 0; i < json.list.length; i += 8) {
          daily.push(json.list[i]);
        }

        daily.forEach((item) => {
          dates.push(new Date(item.dt * 1000).toLocaleDateString());
          temps.push(item.main.temp);
        });

        setData({
          labels: dates,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temps,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (err) {
        console.error("Error loading temperature trend:", err);
      }
    };

    fetchPastData();
  }, [lat, lon]);

  if (!data) return <p>Loading temperature trend...</p>;

  return (
    <div className="graph-container" style={{ width: "100%", maxWidth: "600px", margin: "30px auto" }}>
      <h3>📊 Temperature Trend (Next 5 Days)</h3>
      <Line data={data} options={{
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Temperature Forecast" }
        }
      }} />
    </div>
  );
}

