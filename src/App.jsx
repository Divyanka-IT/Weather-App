import { useEffect, useState } from "react";
import { HashRouter as Router } from "react-router-dom";
import cities from "./data/cities.json";
import "./App.css";

function App() {
  const [city, setCity] = useState(localStorage.getItem("lastCity") || "");
  const [weather, setWeather] = useState(null);
  const [theme, setTheme] = useState("light");
  const [cityWeatherList, setCityWeatherList] = useState([]);
  const [recentCities, setRecentCities] = useState(
    JSON.parse(localStorage.getItem("recentCities")) || []
  );

  // ✅ Fetch weather for one city
  const getWeather = async (cityName) => {
    if (!cityName) return;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=7bbc4822f963c2409c4c436893addfaa`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(data);
        setCity("");
        localStorage.setItem("lastCity", cityName);

        const updatedRecent = Array.from(new Set([cityName, ...recentCities])).slice(0, 8);
        setRecentCities(updatedRecent);
        localStorage.setItem("recentCities", JSON.stringify(updatedRecent));
      } else {
        setWeather(null);
        alert("City not found!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWeatherForCities = async (cityArray) => {
    const results = [];
    for (const city of cityArray) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=7bbc4822f963c2409c4c436893addfaa`
        );
        const data = await res.json();
        if (data.cod === 200) results.push({ name: city, data });
      } catch (err) {
        console.error("Error fetching for", city, err);
      }
    }
    setCityWeatherList(results);
  };

  useEffect(() => {
    const savedCity = localStorage.getItem("lastCity") || "Delhi";
    getWeather(savedCity);

    const uniqueCities = Array.from(
      new Set([...recentCities, ...cities.slice(0, 5)])
    );
    fetchWeatherForCities(uniqueCities);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 20) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleShare = async () => {
    if (navigator.share && weather) {
      await navigator.share({
        title: "Weather Report",
        text: `Current weather in ${weather.name}: ${weather.main.temp}°C, ${weather.weather[0].main}.`,
        url: window.location.href,
      });
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const getSuggestions = () => {
    if (!weather) return { eat: "", hygiene: "" };
    const temp = weather.main.temp;
    const condition = weather.weather[0].main.toLowerCase();

    let eat = "", hygiene = "";

    if (temp > 30) {
      eat = "Stay hydrated 🍉 — drink coconut water or lemon juice.";
      hygiene = "Use sunscreen 🧴 and shower twice a day.";
    } else if (temp >= 15 && temp <= 30) {
      eat = "Enjoy light meals 🍛 — fruits, veggies & salads.";
      hygiene = "Maintain daily hygiene and moisturize regularly.";
    } else {
      eat = "Have warm soups 🍲 and herbal tea ☕ to stay cozy.";
      hygiene = "Use hydrating cream and wear warm clothes.";
    }

    if (condition.includes("rain")) hygiene += " Don’t forget your umbrella ☔!";
    else if (condition.includes("dust") || condition.includes("smoke"))
      hygiene += " Wear a mask 😷 outdoors.";

    return { eat, hygiene };
  };

  return (
    <Router>
      <div className={`app-container ${theme === "dark" ? "dark" : "light"}`}>
        {/* 🌤 Navbar */}
        <nav className="navbar">
          <h1 className="nav-logo">🌦 Smart Weather</h1>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#guide">Usage Guide</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            {weather && (
              <button className="share-btn" onClick={handleShare}>
                📤 Share
              </button>
            )}
          </div>
        </nav>

        {/* 🌍 Main Weather Section */}
        <section id="home" className="main-section">
          <div className="main-content">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Enter city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && getWeather(city)}
              />
              {city && (
                <button className="cancel-btn" onClick={() => setCity("")}>
                  ✖
                </button>
              )}
              <button onClick={() => getWeather(city)}>Search</button>
            </div>

            {weather && (
              <div className={`weather-card main-card ${weather.weather[0].main.toLowerCase()}`}>
                <h2>{weather.name}</h2>
                <p className="temp">{Math.round(weather.main.temp)}°C</p>
                <p className="desc">{weather.weather[0].description}</p>
                <p>Humidity: {weather.main.humidity}%</p>
                <p>Wind: {weather.wind.speed} m/s</p>
              </div>
            )}

            {weather && (
              <div className="suggestions">
                <h3>🌿 Weather Tips</h3>
                <p><strong>Eat:</strong> {getSuggestions().eat}</p>
                <p><strong>Hygiene:</strong> {getSuggestions().hygiene}</p>
              </div>
            )}
          </div>
        </section>

        {recentCities.length > 0 && (
          <section id="recent" className="recent-section">
            <h2>🕓 Recently Searched</h2>
            <div className="city-grid">
              {recentCities.map((city, i) => (
                <div key={i} className="weather-card" onClick={() => getWeather(city)}>
                  <h3>{city}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="compare" className="compare-section">
          <h2>🌍 Nearby Cities</h2>
          <div className="city-grid">
            {cityWeatherList.map((c, i) => (
              <div key={i} className={`weather-card ${c.data.weather[0].main.toLowerCase()}`}>
                <h3>{c.name}</h3>
                <p className="temp-small">{Math.round(c.data.main.temp)}°C</p>
                <p>{c.data.weather[0].main}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="info-section">
          <h2>ℹ️ About Smart Weather</h2>
          <p>
            Smart Weather gives real-time weather updates for your favorite cities and nearby regions.
            Get personalized tips for food, hygiene, and health based on the current weather.
          </p>
        </section>

        <section id="guide" className="info-section">
          <h2>🧭 Usage Guide</h2>
          <ul>
            <li>Enter a city name and click <b>Search</b> or press <b>Enter</b>.</li>
            <li>Switch between <b>Dark</b> and <b>Light</b> modes using the toggle.</li>
            <li>Check <b>Nearby Cities</b> for quick comparisons.</li>
            <li>Tap <b>Share</b> to send weather info to friends.</li>
          </ul>
        </section>

        <section id="contact" className="info-section">
          <h2>📞 Contact Us</h2>
          <p>Developed with ❤️ by your friendly weather enthusiast!</p>
          <p>Email: <a href="mailto:smartweather@app.com">smartweather@app.com</a></p>
        </section>
      </div>
    </Router>
  );
}

export default App;
