import React, { useEffect, useState } from "react";

/**
 * Props:
 *  - sunrise: number (unix seconds)
 *  - sunset: number (unix seconds)
 *  - timezone: number (offset in seconds from UTC, as returned by OpenWeather)
 *
 * NOTE:
 *  - For countdown calculations we use the absolute unix timestamp (sunrise*1000).
 *    Do NOT add timezone to the target when computing diff vs Date.now().
 *  - For displaying the city's local wall-clock time we add the timezone offset
 *    to the timestamp and format the resulting UTC string (this yields the
 *    correct "local clock" for that city even though JS Date lacks a simple
 *    IANA tz mapping).
 */

const SunriseSunset = ({ sunrise, sunset, timezone = 0 }) => {
  const [timeLeft, setTimeLeft] = useState({ sunrise: "", sunset: "" });

  // Format a unix timestamp (seconds) into HH:MM:SS for the city's local time
  const formatCityLocalTime = (timestampSec) => {
    if (!timestampSec) return "--:--:--";
    // Add timezone offset seconds to the timestamp => this yields a new epoch
    // which when displayed in UTC string shows the city's local wall-clock time.
    const shifted = new Date((timestampSec + timezone) * 1000);
    // Extract only HH:MM:SS
    return shifted.toUTCString().split(" ")[4];
  };

  // Compute countdown to absolute moment (timestampSec * 1000) relative to now
  const computeCountdown = (timestampSec) => {
    if (!timestampSec) return "N/A";
    const targetMs = timestampSec * 1000; // absolute epoch ms of event
    const diff = targetMs - Date.now();

    if (diff <= 0) return "Already passed";

    const totalSeconds = Math.floor(diff / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);

    return `${hrs}h ${mins}m ${secs}s`;
  };

  useEffect(() => {
    // initialize
    setTimeLeft({
      sunrise: computeCountdown(sunrise),
      sunset: computeCountdown(sunset),
    });

    const timer = setInterval(() => {
      setTimeLeft({
        sunrise: computeCountdown(sunrise),
        sunset: computeCountdown(sunset),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sunrise, sunset, timezone]);

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "16px auto",
        padding: 14,
        borderRadius: 12,
        background: "rgba(255,255,255,0.12)",
        color: "inherit",
        boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
        textAlign: "center",
      }}
    >
      <h4 style={{ marginBottom: 8 }}>🌅 Sunrise & 🌇 Sunset</h4>

      <div style={{ display: "flex", justifyContent: "space-around", gap: 12, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>🌅 Sunrise</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {formatCityLocalTime(sunrise)}
          </div>
          <div style={{ marginTop: 6, color: "#e90d0dff", fontSize: 13 }}>
            in {timeLeft.sunrise}
          </div>
        </div>

        <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.06)" }} />

        <div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>🌇 Sunset</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {formatCityLocalTime(sunset)}
          </div>
          <div style={{ marginTop: 6, color: "#e90d0dff", fontSize: 13 }}>
            in {timeLeft.sunset}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SunriseSunset;

