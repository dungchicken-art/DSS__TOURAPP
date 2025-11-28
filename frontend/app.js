const { useState, useEffect } = React;
const API_BASE = "http://127.0.0.1:5000";

function Status({ message, tone = "success" }) {
  if (!message) return null;
  return <p className={`status ${tone}`}>{message}</p>;
}

function Input({ label, children }) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

const heroHighlights = [
  "Đích đến", "Khoảng giá", "Số ngày", "Loại hình", "Mùa du lịch", "Độ ưu tiên"
];

const regionPhotos = {
  "bắc": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
  "trung": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "nam": "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80",
};

function getTourImage(tour) {
  if (regionPhotos[tour.region]) return regionPhotos[tour.region];
  if (tour.tour_type === "biển") return regionPhotos["trung"];
  if (tour.tour_type === "núi") return regionPhotos["bắc"];
  return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Không thể xử lý yêu cầu");
  return data;
}

function AuthCard({ onAuth }) {
  const [status, setStatus] = useState({ text: "Chưa đăng nhập", tone: "success" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(endpoint, payload, form) {
    try {
      setLoading(true);
      const data = await postJson(`${API_BASE}${endpoint}`, payload);
      onAuth(data.user);
      setStatus({ text: `Đang đăng nhập: ${data.user.name} (${data.user.email})`, tone: "success" });
      form.reset();
    } catch (err) {
      setStatus({ text: err.message, tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2>Thành viên</h2>
        <span className="pill">Lưu bộ lọc & lịch sử</span>
      </div>
      <div className="inline-grid">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            handleSubmit(
              "/api/register",
              {
                name: form.name.value,
                email: form.email.value,
                password: form.password.value,
              },
              form
            );
          }}
        >
          <h3>Đăng ký</h3>
          <Input label="Họ tên">
            <input type="text" name="name" placeholder="Nguyễn Văn A" required disabled={loading} />
          </Input>
          <Input label="Email">
            <input type="email" name="email" placeholder="ban@example.com" required disabled={loading} />
          </Input>
          <Input label="Mật khẩu">
            <input type="password" name="password" placeholder="••••••••" required disabled={loading} />
          </Input>
          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            handleSubmit(
              "/api/login",
              {
                email: form.email.value,
                password: form.password.value,
              },
              form
            );
          }}
        >
          <h3>Đăng nhập</h3>
          <Input label="Email">
            <input type="email" name="email" placeholder="ban@example.com" required disabled={loading} />
          </Input>
          <Input label="Mật khẩu">
            <input type="password" name="password" placeholder="••••••••" required disabled={loading} />
          </Input>
          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
      </div>
      <Status message={status.text} tone={status.tone} />
    </section>
  );
}

function FilterCard({ onSubmit }) {
  const [form, setForm] = useState({
    budget: 700,
    days: 5,
    region: "",
    season: "",
    tourType: "",
    minRating: 4.2,
    method: "saw",
    weightPrice: 3.5,
    weightDays: 2,
    weightRating: 4,
    weightAttraction: 3.5,
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      budget: form.budget === "" ? null : Number(form.budget),
      days: form.days === "" ? null : Number(form.days),
      region: form.region,
      season: form.season,
      tour_type: form.tourType,
      min_rating: form.minRating === "" ? null : Number(form.minRating),
      method: form.method,
      weights: {
        price: Number(form.weightPrice || 0),
        days: Number(form.weightDays || 0),
        rating: Number(form.weightRating || 0),
        attraction: Number(form.weightAttraction || 0),
      },
    };
    onSubmit(payload);
  };

  return (
    <section className="card">
      <div className="section-title">
        <h2>Điều kiện tìm kiếm</h2>
        <span className="pill strong">SAW / TOPSIS</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="inline-grid">
          <Input label="Ngân sách tối đa (USD)">
            <input
              type="number"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              min="0"
              step="10"
            />
          </Input>
          <Input label="Số ngày tối đa">
            <input
              type="number"
              value={form.days}
              onChange={(e) => update("days", e.target.value)}
              min="0"
            />
          </Input>
        </div>

        <div className="inline-grid">
          <Input label="Vùng miền">
            <select value={form.region} onChange={(e) => update("region", e.target.value)}>
              <option value="">Tất cả</option>
              <option value="bắc">Miền Bắc</option>
              <option value="trung">Miền Trung</option>
              <option value="nam">Miền Nam</option>
            </select>
          </Input>
          <Input label="Mùa / thời điểm">
            <select value={form.season} onChange={(e) => update("season", e.target.value)}>
              <option value="">Tất cả</option>
              <option value="xuân">Xuân</option>
              <option value="hè">Hè</option>
              <option value="thu">Thu</option>
              <option value="đông">Đông</option>
              <option value="quanh năm">Quanh năm</option>
            </select>
          </Input>
          <Input label="Loại hình tour">
            <select value={form.tourType} onChange={(e) => update("tourType", e.target.value)}>
              <option value="">Tất cả</option>
              <option value="biển">Biển</option>
              <option value="nghỉ dưỡng">Nghỉ dưỡng</option>
              <option value="văn hóa">Văn hóa</option>
              <option value="núi">Núi</option>
              <option value="phiêu lưu">Phiêu lưu</option>
            </select>
          </Input>
          <Input label="Rating tối thiểu">
            <input
              type="number"
              value={form.minRating}
              onChange={(e) => update("minRating", e.target.value)}
              min="0"
              max="5"
              step="0.1"
            />
          </Input>
        </div>

        <Input label="Thuật toán">
          <select value={form.method} onChange={(e) => update("method", e.target.value)}>
            <option value="saw">SAW (Simple Additive Weighting)</option>
            <option value="topsis">TOPSIS</option>
          </select>
        </Input>

        <p className="muted" style={{ marginTop: -4 }}>
          Điều chỉnh trọng số 0-5 để thể hiện mức ưu tiên của bạn cho từng tiêu chí.
        </p>
        <div className="weights">
          <Input label="Ưu tiên giá (0-5)">
            <input
              type="number"
              value={form.weightPrice}
              onChange={(e) => update("weightPrice", e.target.value)}
              min="0"
              max="5"
              step="0.5"
            />
          </Input>
          <Input label="Ưu tiên số ngày (0-5)">
            <input
              type="number"
              value={form.weightDays}
              onChange={(e) => update("weightDays", e.target.value)}
              min="0"
              max="5"
              step="0.5"
            />
          </Input>
          <Input label="Ưu tiên rating (0-5)">
            <input
              type="number"
              value={form.weightRating}
              onChange={(e) => update("weightRating", e.target.value)}
              min="0"
              max="5"
              step="0.5"
            />
          </Input>
          <Input label="Ưu tiên mức hấp dẫn (0-5)">
            <input
              type="number"
              value={form.weightAttraction}
              onChange={(e) => update("weightAttraction", e.target.value)}
              min="0"
              max="5"
              step="0.5"
            />
          </Input>
        </div>

        <button type="submit" style={{ marginTop: "12px" }}>Tìm tour phù hợp</button>
      </form>
    </section>
  );
}

function TourCard({ tour }) {
  return (
    <div className="tour-card">
      <div
        className="tour-img"
        style={{ backgroundImage: `url(${getTourImage(tour)})` }}
        aria-label={`Ảnh ${tour.name}`}
      ></div>
      <div className="tour-body">
        <div className="tour-title">{tour.name}</div>
        <div className="tour-meta">{tour.region} • {tour.season} • {tour.tour_type}</div>
        <div>
          <span className="badge">{tour.days} ngày</span>
          <span className="badge">${tour.price}</span>
          <span className="badge">⭐ {tour.rating}</span>
          <span className="badge">🎯 {tour.attraction}</span>
        </div>
        <div className="score">Điểm ưu tiên: {tour.score.toFixed(3)}</div>
      </div>
    </div>
  );
}

function ResultPanel({ tours, summary, loading }) {
  return (
    <section className="card" style={{ marginTop: 18 }} id="tours">
      <div className="result-header">
        <div>
          <h2 style={{ margin: 0 }}>Kết quả xếp hạng</h2>
          <p className="muted" id="result-summary">{summary}</p>
        </div>
        <span className="pill strong">Card + bảng</span>
      </div>

      {loading ? (
        <p className="muted">Đang tính toán, vui lòng chờ...</p>
      ) : tours.length === 0 ? (
        <p className="muted">Không có tour phù hợp với bộ lọc hiện tại.</p>
      ) : (
        <>
          <div className="result-grid">
            {tours.map((t) => (
              <TourCard key={`${t.name}-${t.region}-${t.season}`} tour={t} />
            ))}
          </div>

          <table id="result-table">
            <thead>
              <tr>
                <th>Tour</th>
                <th>Vùng</th>
                <th>Mùa</th>
                <th>Loại hình</th>
                <th>Giá</th>
                <th>Ngày</th>
                <th>Rating</th>
                <th>Attraction</th>
                <th>Điểm</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((t) => (
                <tr key={`row-${t.name}-${t.region}-${t.season}`}>
                  <td>{t.name}</td>
                  <td>{t.region}</td>
                  <td>{t.season}</td>
                  <td>{t.tour_type}</td>
                  <td>{t.price}</td>
                  <td>{t.days}</td>
                  <td>{t.rating}</td>
                  <td>{t.attraction}</td>
                  <td>{t.score.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

function App() {
  const [tours, setTours] = useState([]);
  const [summary, setSummary] = useState(
    "Hệ thống sẽ gợi ý các tour phù hợp nhất với bộ lọc bạn chọn."
  );
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const fetchRanking = async (payload) => {
    try {
      setLoading(true);
      const data = await postJson(`${API_BASE}/api/rank`, payload);
      setTours(data);
      setSummary(`Tìm thấy ${data.length} tour phù hợp với bộ lọc của bạn.`);
    } catch (err) {
      setSummary(err.message || "Không thể xếp hạng tour. Vui lòng thử lại.");
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking({ method: "saw", weights: { price: 4, days: 2, rating: 4, attraction: 3 } });
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span role="img" aria-label="logo">🧭</span>
          TourGuide DSS
        </div>
        <nav className="nav-links">
          <a className="active" href="#tours">Tours</a>
          <a href="#filters">Bộ lọc</a>
          <a href="#about">Trợ giúp</a>
          <span className="pill">{user ? `Xin chào, ${user.name}` : "Chế độ khách"}</span>
        </nav>
      </div>

      <header className="hero">
        <div className="hero-content">
          <div className="pill strong" style={{ width: "fit-content" }}>Travel decision support</div>
          <h1>Tour Selection</h1>
          <p>
            Travel decision support system giúp bạn cân bằng ngân sách, thời gian, mùa du lịch và sở thích
            để tìm tour tối ưu theo SAW hoặc TOPSIS.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              style={{ width: "fit-content", padding: "12px 18px" }}
              onClick={() =>
                fetchRanking({ method: "saw", weights: { price: 4, days: 2, rating: 4, attraction: 3 } })
              }
            >
              Bắt đầu gợi ý
            </button>
            <span className="pill">Không dùng màu gradient</span>
          </div>
          <div className="chip-row">
            {heroHighlights.map((label) => (
              <span className="chip" key={label}>{label}</span>
            ))}
          </div>
        </div>
      </header>

      <main className="container">
        <div className="layout">
          <div style={{ display: "grid", gap: "14px" }} id="filters">
            <FilterCard onSubmit={fetchRanking} />
            <AuthCard onAuth={setUser} />
          </div>

          <div>
            <section className="card" id="about">
              <div className="section-title">
                <h2>Ưu tiên & phạm vi dữ liệu</h2>
                <span className="pill">{tours.length} tour phù hợp</span>
              </div>
              <p className="muted">
                Bao phủ điểm đến Bắc - Trung - Nam, theo mùa, loại hình (biển, văn hóa, núi, nghỉ dưỡng, phiêu lưu)
                và các tiêu chí giá / ngày / rating / sức hấp dẫn.
              </p>
              <div className="chip-row">
                <span className="chip">Lọc ngân sách & thời gian</span>
                <span className="chip">Chọn mùa & vùng miền</span>
                <span className="chip">Tùy chỉnh trọng số 0-5</span>
                <span className="chip">So sánh SAW / TOPSIS</span>
              </div>
            </section>

            <ResultPanel tours={tours} summary={summary} loading={loading} />
          </div>
        </div>
      </main>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
