## Direktori: src

### File: `./src/layouts/components/PengaduanForm.astro`

```astro
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaExclamationTriangle,
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const PengaduanForm = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    kategori: "Pelayanan",
    judul: "",
    isi_pengaduan: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const kategoriOptions = [
    "Pelayanan",
    "Fasilitas",
    "Akademik",
    "Keuangan",
    "SDM",
    "Lainnya",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/pengaduan.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.status === "success") {
        setStatus("success");
        setMessage(result.message);
        setFormData({
          nama: "",
          email: "",
          telepon: "",
          kategori: "Pelayanan",
          judul: "",
          isi_pengaduan: "",
        });
      } else {
        setStatus("error");
        setMessage(result.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Gagal menghubungi server.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm text-center dark:border-darkmode-border dark:bg-darkmode-body">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
          <FaCheckCircle size={30} />
        </div>
        <h3 className="h4 mb-2 text-green-700 dark:text-green-400">
          Pengaduan Terkirim!
        </h3>
        <p className="mb-6 text-sm text-text-light">{message}</p>
        <button
          onClick={() => setStatus("idle")}
          className="btn btn-primary"
        >
          Kirim Pengaduan Lain
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-8 shadow-sm dark:border-darkmode-border dark:bg-darkmode-body">
      <h3 className="h4 mb-6 text-center">Form Pengaduan</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FaUser className="text-primary" />
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="form-input"
            placeholder="Nama lengkap Anda"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FaEnvelope className="text-primary" />
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="email@example.com"
            required
          />
        </div>

        {/* Telepon */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FaPhone className="text-primary" />
            Nomor Telepon
          </label>
          <input
            type="tel"
            name="telepon"
            value={formData.telepon}
            onChange={handleChange}
            className="form-input"
            placeholder="08123456789"
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FaExclamationTriangle className="text-primary" />
            Kategori Pengaduan <span className="text-red-500">*</span>
          </label>
          <select
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            className="form-input cursor-pointer"
            required
          >
            {kategoriOptions.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>

        {/* Judul */}
        <div>
          <label className="form-label">
            Judul Pengaduan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            className="form-input"
            placeholder="Ringkasan pengaduan Anda"
            required
          />
        </div>

        {/* Isi Pengaduan */}
        <div>
          <label className="form-label">
            Isi Pengaduan <span className="text-red-500">*</span>
          </label>
          <textarea
            name="isi_pengaduan"
            value={formData.isi_pengaduan}
            onChange={handleChange}
            className="form-input"
            rows={6}
            placeholder="Jelaskan pengaduan Anda secara detail..."
            required
          ></textarea>
        </div>

        {/* Status Error */}
        {status === "error" && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3">
            <FaTimesCircle className="text-xl" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Mengirim...
            </>
          ) : (
            <>
              <FaPaperPlane /> Kirim Pengaduan
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          <strong>Catatan:</strong> Pengaduan Anda akan kami proses dan ditindaklanjuti 
          maksimal 3x24 jam. Kami akan menghubungi Anda melalui email atau telepon 
          yang telah didaftarkan.
        </p>
      </div>
    </div>
  );
};

export default PengaduanForm;
```

---

### File: `./src/layouts/helpers/AdminDashboard.tsx`

```tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  FaDownload,
  FaSignOutAlt,
  FaEye,
  FaStar,
  FaChartLine,
  FaPoll,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaTimes,
  FaExternalLinkAlt,
  FaQuoteLeft,
  FaTrash,
  FaExclamationCircle,
  FaFileUpload,
  FaFileCsv,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaHistory,
  FaDesktop,
  FaFilter,
  FaCalendarAlt,
  FaUserEdit,
  FaFileAlt,
  FaImages,
  FaVideo,
  FaSyncAlt,
  FaCloudUploadAlt,
  FaHammer,
  FaSearchPlus,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// --- HELPER & INTERFACES ---
interface User {
  name: string;
  email: string;
  picture: string;
  role: string;
}

interface UserManagementData {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
}

// FORMAT TANGGAL
const formatDateIndo = (dateString: string) => {
  if (!dateString) return "-";
  try {
    const date = new Date(
      dateString.includes("Z")
        ? dateString
        : dateString.replace(" ", "T") + "Z",
    );
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
      timeZoneName: "short",
    })
      .format(date)
      .replace("pukul", "");
  } catch (e) {
    return dateString;
  }
};

const getMonthFromDate = (dateString: string) => {
  try {
    return (
      new Date(
        dateString.includes("Z")
          ? dateString
          : dateString.replace(" ", "T") + "Z",
      ).getMonth() + 1
    );
  } catch (e) {
    return 0;
  }
};

const getYearFromDate = (dateString: string) => {
  try {
    return new Date(
      dateString.includes("Z")
        ? dateString
        : dateString.replace(" ", "T") + "Z",
    ).getFullYear();
  } catch (e) {
    return 0;
  }
};

const AdminDashboard = () => {
  // --- STATE UTAMA ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // --- STATE USER MANAGEMENT ---
  const [userList, setUserList] = useState<UserManagementData[]>([]);
  const [editUserModal, setEditUserModal] = useState<{
    isOpen: boolean;
    user: UserManagementData | null;
  }>({ isOpen: false, user: null });

  // --- STATE FILTER ULASAN ---
  const [fbFilterMonth, setFbFilterMonth] = useState<number>(0);
  const [fbFilterYear, setFbFilterYear] = useState<number>(0);
  const [fbFilterRating, setFbFilterRating] = useState<number>(0);

  // --- STATE FILTER SURVEI ---
  const [svFilterMonth, setSvFilterMonth] = useState<number>(0);
  const [svFilterYear, setSvFilterYear] = useState<number>(0);
  const [svFilterCategory, setSvFilterCategory] = useState<string>("all");
  const [svFilterScore, setSvFilterScore] = useState<number>(0);

  // --- STATE MODALS ---
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"feedback" | "survey" | null>(
    null,
  );

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    ids: number[];
    type: string;
    count: number;
    action?: () => void;
  }>({ isOpen: false, ids: [], type: "feedback", count: 0 });

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    status: "success" | "error";
    title: string;
    message: string;
  }>({ isOpen: false, status: "success", title: "", message: "" });

  const [importModalOpen, setImportModalOpen] = useState(false);

  // --- STATE CONTENT MANAGER ---
  const [contentTab, setContentTab] = useState<"article" | "image" | "video">(
    "article",
  );
  const [fileList, setFileList] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadConflict, setUploadConflict] = useState<{
    isOpen: boolean;
    file: File | null;
    type: string;
  }>({ isOpen: false, file: null, type: "" });
  const [isRebuilding, setIsRebuilding] = useState(false);

  // State Filter Header (PDF)
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear(),
  );

  // --- LOGIKA FILTER DATA ---
  const filteredFeedbacks = useMemo(() => {
    if (!data?.tables?.feedbacks) return [];
    return data.tables.feedbacks.filter((item: any) => {
      const matchMonth =
        fbFilterMonth === 0 ||
        getMonthFromDate(item.created_at) === fbFilterMonth;
      const matchYear =
        fbFilterYear === 0 || getYearFromDate(item.created_at) === fbFilterYear;
      const matchRating =
        fbFilterRating === 0 || item.rating === fbFilterRating;
      return matchMonth && matchYear && matchRating;
    });
  }, [data, fbFilterMonth, fbFilterYear, fbFilterRating]);

  const filteredSurveys = useMemo(() => {
    if (!data?.tables?.surveys) return [];
    return data.tables.surveys.filter((item: any) => {
      const matchMonth =
        svFilterMonth === 0 ||
        getMonthFromDate(item.created_at) === svFilterMonth;
      const matchYear =
        svFilterYear === 0 || getYearFromDate(item.created_at) === svFilterYear;

      let matchScore = true;
      if (svFilterScore > 0) {
        // Dinamis check score
        const cats = [
          "score_zi",
          "score_service",
          "score_academic",
          "score_facilities",
          "score_management",
          "score_culture",
        ];
        if (svFilterCategory === "all") {
          matchScore = cats.some(
            (c) => Math.round(item[c] || 0) === svFilterScore,
          );
        } else {
          matchScore =
            Math.round(item[`score_${svFilterCategory}`] || 0) ===
            svFilterScore;
        }
      }
      return matchMonth && matchYear && matchScore;
    });
  }, [data, svFilterMonth, svFilterYear, svFilterCategory, svFilterScore]);

  const filteredVisits = useMemo(() => {
    if (!data?.tables?.visits) return [];
    return data.tables.visits.filter((item: any) => {
      const matchMonth =
        fbFilterMonth === 0 ||
        getMonthFromDate(item.created_at) === fbFilterMonth;
      const matchYear =
        fbFilterYear === 0 || getYearFromDate(item.created_at) === fbFilterYear;
      return matchMonth && matchYear;
    });
  }, [data, fbFilterMonth, fbFilterYear]);

  // Data Grafik Kunjungan
  const visitsChartData = useMemo(() => {
    if (!data?.tables?.visits) return { labels: [], datasets: [] };
    const visitsByDate: Record<string, number> = {};
    data.tables.visits.forEach((visit: any) => {
      const date = new Date(visit.created_at.replace(" ", "T"))
        .toISOString()
        .split("T")[0];
      visitsByDate[date] = (visitsByDate[date] || 0) + 1;
    });
    const sortedDates = Object.keys(visitsByDate).sort();
    return {
      labels: sortedDates.map((d) => {
        const [y, m, day] = d.split("-");
        return `${day}/${m}`;
      }),
      datasets: [
        {
          label: "Jumlah Kunjungan",
          data: sortedDates.map((d) => visitsByDate[d]),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [data]);

  // --- AUTH & INIT ---
  const initializeGoogleButton = () => {
    const btnContainer = document.getElementById("googleBtn");
    if (!btnContainer) return;
    /* @ts-ignore */
    if (window.google && window.google.accounts) {
      /* @ts-ignore */
      window.google.accounts.id.initialize({
        client_id: import.meta.env.PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleAuthResponse,
        auto_select: false,
        ui_mode: "popup",
      });
      renderGoogleBtn();
    }
  };

  const renderGoogleBtn = () => {
    const btn = document.getElementById("googleBtn");
    if (btn)
      /* @ts-ignore */ window.google?.accounts.id.renderButton(btn, {
        theme: "outline",
        size: "large",
        width: 250,
        text: isRegisterMode ? "signup_with" : "signin_with",
      });
  };

  useEffect(() => {
    if (!user && !loading) renderGoogleBtn();
  }, [isRegisterMode, user, loading]);

  const handleAuthResponse = async (response: any) => {
    setLoading(true);
    if (!isRegisterMode) {
      try {
        const res = await fetch("/api/auth.php?action=login", {
          method: "POST",
          body: JSON.stringify({ credential: response.credential }),
        });
        const result = await res.json();

        if (result.status === "success") {
          setUser(result.user);
          fetchStats();
          if (result.user.role === "super_admin") fetchUsers();
        } else if (result.status === "unregistered") {
          if (
            window.confirm(
              "Email ini belum terdaftar. Apakah Anda ingin mendaftar sekarang sebagai User baru?",
            )
          ) {
            await doRegister(response.credential);
          } else {
            alert("Login dibatalkan.");
          }
        } else {
          alert(result.message);
        }
      } catch (e) {
        alert("Gagal menghubungi server login.");
      }
    } else {
      await doRegister(response.credential);
    }
    setLoading(false);
  };

  const doRegister = async (credential: string) => {
    try {
      const res = await fetch("/api/auth.php?action=register", {
        method: "POST",
        body: JSON.stringify({ credential }),
      });
      const result = await res.json();

      if (result.status === "success") {
        setUser(result.user);
        fetchStats();
        setIsRegisterMode(false);
        setStatusModal({
          isOpen: true,
          status: "success",
          title: "Selamat Datang!",
          message:
            "Akun Anda berhasil dibuat. Anda sekarang login sebagai User.",
        });
      } else {
        setStatusModal({
          isOpen: true,
          status: "error",
          title: "Registrasi Gagal",
          message: result.message,
        });
      }
    } catch (e) {
      alert("Gagal melakukan registrasi.");
    }
  };

  const fetchStats = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin.php?action=stats");
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      const json = await res.json();
      if (json.status === "error") throw new Error(json.message);
      setData(json);
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal memuat data.");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users.php");
      const json = await res.json();
      if (json.status === "success") setUserList(json.data);
    } catch (e) {}
  };

  // --- CONTENT MANAGER FETCH ---
  useEffect(() => {
    if (activeTab === "content" && user) {
      fetchFiles(contentTab);
    }
  }, [activeTab, contentTab, refreshTrigger, user]);

  const fetchFiles = async (type: string) => {
    try {
      const res = await fetch(`/api/content.php?type=${type}`);
      const json = await res.json();
      if (json.status === "success") {
        setFileList(json.data);
      }
    } catch (e) {
      console.error("Gagal load files", e);
    }
  };

  // --- CONTENT ACTIONS ---
  const handleContentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    behavior = "ask",
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("behavior", behavior); // ask, overwrite, rename

    try {
      const res = await fetch(
        `/api/content.php?action=upload&type=${contentTab}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const json = await res.json();

      if (json.status === "conflict") {
        // Show Conflict Modal
        setUploadConflict({ isOpen: true, file, type: contentTab });
      } else if (json.status === "success") {
        setUploadConflict({ isOpen: false, file: null, type: "" });
        setRefreshTrigger((prev) => prev + 1); // Refresh list ONLY (No Rebuild Trigger)
        setStatusModal({
          isOpen: true,
          status: "success",
          title: "Upload Berhasil",
          message: json.message,
        });
      } else {
        throw new Error(json.message);
      }
    } catch (e: any) {
      setStatusModal({
        isOpen: true,
        status: "error",
        title: "Upload Gagal",
        message: e.message || "Terjadi kesalahan upload.",
      });
    }
    // Reset input
    e.target.value = "";
  };

  const deleteContent = async (filename: string) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus ${filename}? Aksi ini tidak dapat dibatalkan.`,
      )
    )
      return;

    try {
      const res = await fetch(
        `/api/content.php?action=delete&type=${contentTab}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        },
      );
      const json = await res.json();
      if (json.status === "success") {
        setRefreshTrigger((prev) => prev + 1); // Refresh list ONLY (No Rebuild Trigger)
      } else {
        alert(json.message);
      }
    } catch (e) {
      alert("Gagal menghapus file.");
    }
  };

  const triggerRebuild = async () => {
    if (
      !window.confirm(
        "Yakin ingin melakukan Rebuild Website? Proses ini memakan waktu 1-2 menit. Pastikan Anda telah meninjau semua perubahan file.",
      )
    )
      return;
    setIsRebuilding(true);
    try {
      const res = await fetch(`/api/content.php?action=rebuild`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.status === "success") {
        setStatusModal({
          isOpen: true,
          status: "success",
          title: "Rebuild Dimulai",
          message: json.message,
        });
      } else {
        alert(json.message);
      }
    } catch (e) {
      alert("Gagal menghubungi server.");
    } finally {
      setIsRebuilding(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const authRes = await fetch("/api/auth.php?action=check");
        const authData = await authRes.json();
        if (isMounted) {
          if (authData.status === "authenticated") {
            setUser(authData.user);
            fetchStats();
            if (authData.user.role === "super_admin") fetchUsers();
          } else {
            if (!document.getElementById("google-client-script")) {
              const script = document.createElement("script");
              script.src = "https://accounts.google.com/gsi/client";
              script.async = true;
              script.id = "google-client-script";
              script.onload = initializeGoogleButton;
              document.body.appendChild(script);
            } else {
              setTimeout(initializeGoogleButton, 500);
            }
          }
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setErrorMsg("Gagal menghubungi server autentikasi.");
        setLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth.php?action=logout");
    setUser(null);
    window.location.reload();
  };

  const downloadReport = (type: string) => {
    window.open(`/api/admin.php?action=export&type=${type}`, "_blank");
  };

  const printPDF = () => {
    window.open(
      `/api/print_pdf.php?month=${selectedMonth}&year=${selectedYear}`,
      "_blank",
    );
  };

  // --- LOGIC USER MANAGEMENT ---
  const updateUser = async (id: number, role: string, status: string) => {
    try {
      const res = await fetch(`/api/users.php?action=update`, {
        method: "POST",
        body: JSON.stringify({ id, role, status }),
      });
      const json = await res.json();
      if (json.status === "success") {
        fetchUsers();
        setEditUserModal({ isOpen: false, user: null });
        alert("User updated!");
      } else alert(json.message);
    } catch (e) {
      alert("Gagal update user");
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const res = await fetch(`/api/users.php?action=delete`, {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.status === "success") {
        fetchUsers();
        alert("User deleted!");
      } else alert(json.message);
    } catch (e) {
      alert("Gagal hapus user");
    }
  };

  // --- ACTION HANDLERS ---
  const openDetail = (item: any, type: "feedback" | "survey") => {
    setSelectedItem(item);
    setModalType(type);
  };

  const requestDelete = (ids: number[], type: "feedback" | "survey") => {
    setConfirmModal({
      isOpen: true,
      ids,
      type,
      count: ids.length,
    });
  };

  const executeDelete = async () => {
    if (confirmModal.type === "user" && confirmModal.action) {
      confirmModal.action();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      const res = await fetch("/api/crud.php?action=delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: confirmModal.ids,
          type: confirmModal.type,
        }),
      });
      const json = await res.json();

      if (json.status === "success") {
        fetchStats();
        if (
          selectedItem &&
          confirmModal.ids.includes(selectedItem.id) &&
          modalType === confirmModal.type
        ) {
          setSelectedItem(null);
          setModalType(null);
        }
        setStatusModal({
          isOpen: true,
          status: "success",
          title: "Berhasil Dihapus",
          message: `${confirmModal.count} data telah berhasil dihapus dari database.`,
        });
      } else {
        throw new Error(json.message);
      }
    } catch (e: any) {
      setStatusModal({
        isOpen: true,
        status: "error",
        title: "Gagal Menghapus",
        message: e.message || "Terjadi kesalahan sistem saat menghapus data.",
      });
    }
  };

  if (loading)
    return (
      <div className="text-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Memuat Sistem...
      </div>
    );

  if (!user)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-xl dark:border-darkmode-border dark:bg-darkmode-light">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="mx-auto mb-6 h-12"
          />
          <h2 className="h4 mb-2">
            {isRegisterMode ? "Registrasi Akun Baru" : "Login Portal Admin"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {isRegisterMode
              ? "Daftarkan email Google Anda untuk akses."
              : "Gunakan akun Google yang terdaftar."}
          </p>
          <div className="flex justify-center h-[50px]">
            <div id="googleBtn"></div>
          </div>
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="mt-6 text-sm text-primary hover:underline"
          >
            {isRegisterMode
              ? "Sudah punya akun? Login disini"
              : "Belum punya akun? Daftar sekarang"}
          </button>
        </div>
        <StatusModal
          isOpen={statusModal.isOpen}
          status={statusModal.status}
          title={statusModal.title}
          message={statusModal.message}
          onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        />
      </div>
    );

  const monthOptions = [
    "Semua Bulan",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const yearOptions = [0, 2024, 2025, 2026, 2027];

  const userRole = user.role || "user";

  return (
    <div className="min-h-screen pb-12 relative">
      {/* Header Panel */}
      <div className="mb-8 flex flex-col xl:flex-row items-center justify-between gap-4 rounded-xl bg-white p-6 border border-border shadow-sm dark:bg-darkmode-light dark:border-darkmode-border">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <img
            src={user.picture}
            alt={user.name}
            className="h-12 w-12 rounded-full border border-gray-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="h5 mb-0 font-bold">{user.name}</h3>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${userRole === "super_admin" ? "bg-red-100 text-red-700" : userRole === "operator" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
              >
                {userRole.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-text-light">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
          {/* PDF Filter & Actions (Only Operator & Admin) */}
          {(userRole === "operator" || userRole === "super_admin") && (
            <>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-1.5 rounded-lg border border-border dark:border-darkmode-border mr-2">
                <span className="text-xs font-bold px-2">Cetak:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-xs bg-transparent outline-none"
                >
                  {monthOptions.slice(1).map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs bg-transparent outline-none"
                >
                  {yearOptions.slice(1).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setImportModalOpen(true)}
                className="btn btn-sm flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 whitespace-nowrap"
              >
                <FaFileUpload /> Import
              </button>
              <button
                onClick={printPDF}
                className="btn btn-outline-primary btn-sm flex items-center gap-2 print:hidden whitespace-nowrap"
              >
                <FaDownload /> PDF
              </button>
            </>
          )}
          <button
            onClick={async () => {
              await fetch("/api/auth.php?action=logout");
              window.location.reload();
            }}
            className="btn btn-primary btn-sm flex items-center gap-2 bg-red-500 border-red-500 hover:bg-red-600 print:hidden whitespace-nowrap"
          >
            <FaSignOutAlt /> Keluar
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-8 rounded-xl bg-red-50 p-4 border border-red-200 text-red-700 flex items-center gap-3">
          <FaExclamationTriangle className="text-xl" />
          <div>
            <p className="font-bold">Gagal memuat data</p>
            <p className="text-sm">{errorMsg}</p>
            <button
              onClick={fetchStats}
              className="mt-2 text-xs underline hover:text-red-900"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {data && (
        <div className="animate-fade-in">
          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Kunjungan"
              value={data.overview.visits.toLocaleString()}
              icon={<FaEye />}
              color="text-blue-500"
              bg="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              label="Artikel Dibaca"
              value={data.overview.posts_count.toLocaleString()}
              icon={<FaChartLine />}
              color="text-green-500"
              bg="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              label="Total Ulasan"
              value={data.overview.feedback_count.toLocaleString()}
              icon={<FaStar />}
              color="text-yellow-500"
              bg="bg-yellow-50 dark:bg-yellow-900/20"
            />
            <StatCard
              label="Responden Survei"
              value={data.overview.survey_count.toLocaleString()}
              icon={<FaPoll />}
              color="text-purple-500"
              bg="bg-purple-50 dark:bg-purple-900/20"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8 border-b border-border dark:border-darkmode-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: "overview", label: "Ringkasan" },
                { id: "content", label: "Manajemen Artikel & Media" },
                { id: "posts", label: "Statistik Artikel" },
                { id: "visits", label: "Riwayat Kunjungan" },
                { id: "feedback", label: "Ulasan" },
                { id: "surveys", label: "Survei" },
                ...(userRole === "super_admin"
                  ? [{ id: "users", label: "Manajemen User" }]
                  : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:border-gray-300 dark:text-gray-400"}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* === CONTENT TABS === */}

          {/* 1. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2 rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-darkmode-light dark:border-darkmode-border">
                <h3 className="h6 mb-6">Tren Aktivitas</h3>
                <div className="h-72">
                  <Line
                    data={{
                      labels: data.charts.activity.labels,
                      datasets: [
                        {
                          label: "Ulasan",
                          data: data.charts.activity.feedback,
                          borderColor: "#eab308",
                          backgroundColor: "rgba(234, 179, 8, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: "Survei",
                          data: data.charts.activity.survey,
                          borderColor: "#8b5cf6",
                          backgroundColor: "rgba(139, 92, 246, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

              {/* Grafik Kunjungan (Baru) */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-darkmode-light dark:border-darkmode-border">
                <h3 className="h6 mb-6">Total Kunjungan Bulanan</h3>
                <div className="h-72">
                  <Line
                    data={visitsChartData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-darkmode-light dark:border-darkmode-border">
                <h3 className="h6 mb-6 text-center">
                  Distribusi Rating Bintang
                </h3>
                <div className="h-64 flex justify-center">
                  <Pie
                    data={{
                      labels: ["5 ★", "4 ★", "3 ★", "2 ★", "1 ★"],
                      datasets: [
                        {
                          label: "Jumlah",
                          data: [5, 4, 3, 2, 1].map(
                            (r) => data.charts.stars?.[r] || 0,
                          ),
                          backgroundColor: [
                            "#22c55e",
                            "#3b82f6",
                            "#eab308",
                            "#f97316",
                            "#ef4444",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right" as const,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* SKOR RATA-RATA SURVEI (6 KATEGORI) */}
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-darkmode-light dark:border-darkmode-border">
                <h3 className="h6 mb-6 text-center">Skor Rata-rata Survei</h3>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: [
                        "ZI",
                        "Pelayanan",
                        "Akademik",
                        "Sarpras",
                        "Manajemen",
                        "Budaya",
                      ],
                      datasets: [
                        {
                          label: "Skor",
                          data: [
                            data.charts.survey_avg?.zi || 0,
                            data.charts.survey_avg?.service || 0,
                            data.charts.survey_avg?.academic || 0,
                            data.charts.survey_avg?.facilities || 0,
                            data.charts.survey_avg?.management || 0,
                            data.charts.survey_avg?.culture || 0,
                          ],
                          backgroundColor: [
                            "#3b82f6",
                            "#10b981",
                            "#8b5cf6",
                            "#f59e0b",
                            "#ef4444",
                            "#14b8a6",
                          ],
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { y: { min: 0, max: 5 } },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. CONTENT MANAGER (NEW) */}
          {activeTab === "content" &&
            (userRole === "operator" || userRole === "super_admin") && (
              <div className="grid grid-cols-1 gap-6">
                {/* Top Bar Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-darkmode-light p-4 rounded-xl border border-border dark:border-darkmode-border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContentTab("article")}
                      className={`btn btn-sm ${contentTab === "article" ? "btn-primary" : "btn-outline-primary"}`}
                    >
                      <FaFileAlt className="mr-2" /> Artikel (.mdx)
                    </button>
                    <button
                      onClick={() => setContentTab("image")}
                      className={`btn btn-sm ${contentTab === "image" ? "btn-primary" : "btn-outline-primary"}`}
                    >
                      <FaImages className="mr-2" /> Gambar
                    </button>
                    <button
                      onClick={() => setContentTab("video")}
                      className={`btn btn-sm ${contentTab === "video" ? "btn-primary" : "btn-outline-primary"}`}
                    >
                      <FaVideo className="mr-2" /> Video
                    </button>
                  </div>

                  <div className="flex gap-2 items-center">
                    {contentTab === "article" && (
                      <a
                        href="/template.mdx"
                        download
                        className="text-sm text-primary hover:underline flex items-center gap-1 mr-2"
                      >
                        <FaDownload /> Unduh Template
                      </a>
                    )}

                    <label className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer flex items-center gap-2">
                      <FaCloudUploadAlt /> Upload{" "}
                      {contentTab === "article"
                        ? "Artikel"
                        : contentTab === "image"
                          ? "Gambar"
                          : "Video"}
                      <input
                        type="file"
                        className="hidden"
                        accept={
                          contentTab === "article"
                            ? ".md,.mdx"
                            : contentTab === "image"
                              ? "image/*"
                              : "video/*"
                        }
                        onChange={(e) => handleContentUpload(e)}
                      />
                    </label>

                    {userRole === "super_admin" && (
                      <button
                        onClick={triggerRebuild}
                        disabled={isRebuilding}
                        className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white border-none flex items-center gap-2 disabled:opacity-50"
                      >
                        <FaHammer
                          className={isRebuilding ? "animate-spin" : ""}
                        />{" "}
                        {isRebuilding ? "Building..." : "Rebuild"}
                      </button>
                    )}
                  </div>
                </div>

                {/* File List */}
                <div className="bg-white dark:bg-darkmode-light rounded-xl border border-border dark:border-darkmode-border overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-border dark:border-darkmode-border flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                      File Manager: {contentTab.toUpperCase()}
                      <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {fileList.length} files
                      </span>
                    </h3>
                    <button
                      onClick={() => setRefreshTrigger((prev) => prev + 1)}
                      className="text-gray-500 hover:text-primary"
                    >
                      <FaSyncAlt />
                    </button>
                  </div>
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 dark:bg-black/20 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3">Nama File</th>
                          <th className="px-4 py-3">Ukuran</th>
                          <th className="px-4 py-3">Tanggal Upload</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border dark:divide-darkmode-border">
                        {fileList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-8 text-center text-gray-500"
                            >
                              Folder kosong.
                            </td>
                          </tr>
                        ) : (
                          fileList.map((file, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <td className="px-4 py-3 font-medium flex items-center gap-2">
                                {file.url ? (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    className="text-primary hover:underline truncate max-w-[200px] md:max-w-md block"
                                    rel="noreferrer"
                                  >
                                    {file.name}{" "}
                                    <FaExternalLinkAlt className="inline text-[10px] ml-1" />
                                  </a>
                                ) : (
                                  <span className="truncate max-w-[200px] md:max-w-md block">
                                    {file.name}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {file.size}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {file.date}
                              </td>
                              <td className="px-4 py-3 text-right flex justify-end gap-2">
                                {/* View/Download Button */}
                                {userRole === "super_admin" && (
                                  <a
                                    href={
                                      file.url ||
                                      `/api/content.php?action=download&type=${contentTab}&file=${file.name}`
                                    }
                                    target="_blank"
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    title={
                                      contentTab === "article"
                                        ? "Unduh / Tinjau Source"
                                        : "Lihat Media"
                                    }
                                  >
                                    {contentTab === "article" ? (
                                      <FaSearchPlus />
                                    ) : (
                                      <FaEye />
                                    )}
                                  </a>
                                )}

                                {/* Delete Button (Super Admin Only) */}
                                {userRole === "super_admin" && (
                                  <button
                                    onClick={() => deleteContent(file.name)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    title="Hapus"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          {/* 3. USER MANAGEMENT (SUPER ADMIN ONLY) */}
          {activeTab === "users" && userRole === "super_admin" && (
            <div className="bg-white dark:bg-darkmode-light rounded-xl border border-border dark:border-darkmode-border overflow-hidden">
              <div className="p-6 border-b border-border dark:border-darkmode-border flex justify-between items-center">
                <h3 className="text-lg font-bold">Daftar Pengguna</h3>
                <button
                  onClick={fetchUsers}
                  className="text-sm text-primary hover:underline"
                >
                  Refresh Data
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-white/5 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Terdaftar</th>
                      <th className="px-6 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-darkmode-border">
                    {userList.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4">
                          <div className="font-bold">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${u.role === "super_admin" ? "bg-red-100 text-red-700" : u.role === "operator" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {formatDateIndo(u.created_at)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                setEditUserModal({ isOpen: true, user: u })
                              }
                              className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                              title="Edit Role/Status"
                            >
                              <FaUserEdit />
                            </button>
                            {u.role !== "super_admin" && (
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    isOpen: true,
                                    ids: [u.id],
                                    type: "user",
                                    count: 1,
                                    action: () => deleteUser(u.id),
                                  })
                                }
                                className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                title="Hapus User"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. POSTS (STATS) */}
          {activeTab === "posts" && (
            <DataTable
              title="Statistik Artikel Populer"
              data={data.tables.posts}
              enableSelection={false}
              onDownload={() => downloadReport("posts")}
              columns={[
                {
                  key: "slug",
                  label: "Judul Artikel",
                  render: (val: string) => {
                    const urlSlug = val.replace(/_/g, "-");
                    const displayTitle = val.replace(/_/g, " ").toUpperCase();
                    return (
                      <a
                        href={`/blog/${urlSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-medium flex items-center gap-1 group"
                      >
                        {displayTitle}
                        <FaExternalLinkAlt className="text-[10px] opacity-50 group-hover:opacity-100" />
                      </a>
                    );
                  },
                },
                {
                  key: "views",
                  label: "Jumlah Pembaca",
                  sortable: true,
                  className: "text-right font-bold",
                },
              ]}
            />
          )}
          {/* TAB BARU: VISIT HISTORY */}
          {activeTab === "visits" && (
            <DataTable
              title="Riwayat Kunjungan Website"
              data={filteredVisits}
              searchKeys={["ip_address", "user_agent"]}
              enableSelection={false}
              onDownload={() => downloadReport("visits")}
              customFilters={
                <div className="flex items-center gap-2 border border-border rounded-lg px-2 py-1.5 bg-white dark:bg-darkmode-body dark:border-darkmode-border">
                  <FaCalendarAlt className="text-gray-400" />
                  <select
                    className="text-xs bg-transparent outline-none"
                    value={fbFilterMonth}
                    onChange={(e) => setFbFilterMonth(Number(e.target.value))}
                  >
                    {monthOptions.map((m, i) => (
                      <option key={i} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className="text-xs bg-transparent outline-none border-l border-gray-200 pl-2 ml-1"
                    value={fbFilterYear}
                    onChange={(e) => setFbFilterYear(Number(e.target.value))}
                  >
                    <option value={0}>Semua Tahun</option>
                    {yearOptions.slice(1).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              }
              columns={[
                {
                  key: "created_at",
                  label: "Waktu Akses",
                  sortable: true,
                  className: "w-48 text-sm text-gray-500",
                  render: (val: string) => formatDateIndo(val),
                },
                {
                  key: "ip_address",
                  label: "IP Address",
                  sortable: true,
                  className: "font-mono text-xs w-32",
                },
                {
                  key: "user_agent",
                  label: "Perangkat / Browser",
                  render: (val: string) => (
                    <div className="flex items-center gap-2" title={val}>
                      <FaDesktop className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-md block">
                        {val}
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          )}
          {/* 5. FEEDBACK (DATA ULASAN) */}
          {activeTab === "feedback" && (
            <DataTable
              title="Data Ulasan Masuk"
              data={filteredFeedbacks}
              searchKeys={["name", "message"]}
              enableSelection={userRole === "super_admin"}
              onBulkDelete={(ids: any) => requestDelete(ids, "feedback")}
              onDownload={() => downloadReport("feedback")}
              customFilters={
                <div className="flex flex-wrap gap-2 items-center mb-2 md:mb-0">
                  <div className="flex items-center gap-2 border border-border rounded-lg px-2 py-1.5 bg-white dark:bg-darkmode-body dark:border-darkmode-border">
                    <FaCalendarAlt className="text-gray-400" />
                    <select
                      className="text-xs bg-transparent outline-none"
                      value={fbFilterMonth}
                      onChange={(e) => setFbFilterMonth(Number(e.target.value))}
                    >
                      {monthOptions.map((m, i) => (
                        <option key={i} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      className="text-xs bg-transparent outline-none border-l border-gray-200 pl-2 ml-1"
                      value={fbFilterYear}
                      onChange={(e) => setFbFilterYear(Number(e.target.value))}
                    >
                      <option value={0}>Semua Tahun</option>
                      {yearOptions.slice(1).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 border border-border rounded-lg px-2 py-1.5 bg-white dark:bg-darkmode-body dark:border-darkmode-border">
                    <FaStar className="text-yellow-400" />
                    <select
                      className="text-xs bg-transparent outline-none"
                      value={fbFilterRating}
                      onChange={(e) =>
                        setFbFilterRating(Number(e.target.value))
                      }
                    >
                      <option value={0}>Semua Rating</option>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} Bintang
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              }
              columns={[
                {
                  key: "created_at",
                  label: "Waktu",
                  sortable: true,
                  className: "w-48 text-sm text-gray-500",
                  render: (val: string) => formatDateIndo(val),
                },
                {
                  key: "name",
                  label: "Nama Pengirim",
                  sortable: true,
                  className: "font-medium w-48",
                },
                {
                  key: "rating",
                  label: "Rating",
                  sortable: true,
                  className: "w-24",
                  render: (val: number) => (
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">
                      {val} ✯
                    </span>
                  ),
                },
                {
                  key: "message",
                  label: "Pesan / Kritik",
                  render: (val: string, row: any) => (
                    <div className="group relative">
                      <p className="italic text-gray-600 dark:text-gray-400 line-clamp-1 max-w-xs">
                        {val || "-"}
                      </p>
                      {val && val.length > 50 && (
                        <button
                          onClick={() => openDetail(row, "feedback")}
                          className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                        >
                          Lihat Detail{" "}
                          <FaExternalLinkAlt className="text-[10px]" />
                        </button>
                      )}
                    </div>
                  ),
                },
                {
                  key: "actions",
                  label: "Aksi",
                  className: "text-center w-16",
                  render: (_: any, row: any) =>
                    userRole === "super_admin" && (
                      <button
                        onClick={() => requestDelete([row.id], "feedback")}
                        className="text-red-500 hover:text-red-700 p-2 transition-colors hover:bg-red-50 rounded-full"
                        title="Hapus Data"
                      >
                        <FaTrash size={14} />
                      </button>
                    ),
                },
              ]}
            />
          )}

          {/* 6. SURVEY (DATA SURVEI) - UPDATED 6 COLS */}
          {activeTab === "surveys" && (
            <DataTable
              title="Data Survei Kepuasan"
              data={filteredSurveys}
              searchKeys={["respondent_name", "feedback"]}
              enableSelection={userRole === "super_admin"}
              onBulkDelete={(ids: any) => requestDelete(ids, "survey")}
              onDownload={() => downloadReport("survey")}
              customFilters={
                <div className="flex flex-wrap gap-2 items-center mb-2 md:mb-0">
                  <div className="flex items-center gap-2 border border-border rounded-lg px-2 py-1.5 bg-white dark:bg-darkmode-body dark:border-darkmode-border">
                    <FaCalendarAlt className="text-gray-400" />
                    <select
                      className="text-xs bg-transparent outline-none"
                      value={svFilterMonth}
                      onChange={(e) => setSvFilterMonth(Number(e.target.value))}
                    >
                      {monthOptions.map((m, i) => (
                        <option key={i} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      className="text-xs bg-transparent outline-none border-l border-gray-200 pl-2 ml-1"
                      value={svFilterYear}
                      onChange={(e) => setSvFilterYear(Number(e.target.value))}
                    >
                      <option value={0}>Semua Tahun</option>
                      {yearOptions.slice(1).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 border border-border rounded-lg px-2 py-1.5 bg-white dark:bg-darkmode-body dark:border-darkmode-border">
                    <FaFilter className="text-blue-400" />
                    <select
                      className="text-xs bg-transparent outline-none"
                      value={svFilterCategory}
                      onChange={(e) => setSvFilterCategory(e.target.value)}
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="zi">Zona Integritas (ZI)</option>
                      <option value="service">Pelayanan</option>
                      <option value="academic">Akademik</option>
                      <option value="facilities">Sarpras</option>
                      <option value="management">Manajemen</option>
                      <option value="culture">Budaya</option>
                    </select>
                    <select
                      className="text-xs bg-transparent outline-none border-l border-gray-200 pl-2 ml-1"
                      value={svFilterScore}
                      onChange={(e) => setSvFilterScore(Number(e.target.value))}
                    >
                      <option value={0}>Semua Nilai</option>
                      {[5, 4, 3, 2, 1].map((s) => (
                        <option key={s} value={s}>
                          Nilai {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              }
              columns={[
                {
                  key: "created_at",
                  label: "Waktu",
                  sortable: true,
                  className: "w-32 text-xs text-gray-500",
                  render: (val: string) => formatDateIndo(val),
                },
                {
                  key: "respondent_name",
                  label: "Responden",
                  sortable: true,
                  className: "w-40",
                  render: (_: any, row: any) => (
                    <div>
                      <div className="font-bold text-sm">
                        {row.respondent_name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {row.respondent_role}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "score_zi",
                  label: "ZI",
                  className: "text-center w-10 text-xs font-bold",
                },
                {
                  key: "score_service",
                  label: "LYN",
                  className: "text-center w-10 text-xs font-bold",
                },
                {
                  key: "score_academic",
                  label: "AKD",
                  className: "text-center w-10 text-xs font-bold",
                },
                {
                  key: "score_facilities",
                  label: "SAR",
                  className: "text-center w-10 text-xs font-bold",
                },
                {
                  key: "score_management",
                  label: "MGT",
                  className: "text-center w-10 text-xs font-bold",
                },
                {
                  key: "score_culture",
                  label: "BUD",
                  className: "text-center w-10 text-xs font-bold",
                },
                {
                  key: "feedback",
                  label: "Masukan",
                  render: (val: string, row: any) => (
                    <div>
                      <p className="italic text-gray-500 text-xs line-clamp-1 max-w-xs">
                        {val || "-"}
                      </p>
                      {val && val.length > 30 && (
                        <button
                          onClick={() => openDetail(row, "survey")}
                          className="text-[10px] text-primary hover:underline mt-1 flex items-center gap-1"
                        >
                          Lihat <FaExternalLinkAlt className="text-[8px]" />
                        </button>
                      )}
                    </div>
                  ),
                },
                {
                  key: "actions",
                  label: "Aksi",
                  className: "text-center w-10",
                  render: (_: any, row: any) =>
                    userRole === "super_admin" && (
                      <button
                        onClick={() => requestDelete([row.id], "survey")}
                        className="text-red-500 hover:text-red-700 p-1.5 transition-colors hover:bg-red-50 rounded-full"
                        title="Hapus Data"
                      >
                        <FaTrash size={12} />
                      </button>
                    ),
                },
              ]}
            />
          )}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Conflict Modal */}
      {uploadConflict.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-darkmode-body w-full max-w-sm rounded-xl shadow-2xl p-6 border border-gray-100 dark:border-darkmode-border">
            <h3 className="text-lg font-bold mb-2">Konflik File</h3>
            <p className="text-sm text-gray-500 mb-4">
              File dengan nama yang sama sudah ada. Apa yang ingin Anda lakukan?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  handleContentUpload(
                    { target: { files: [uploadConflict.file] } } as any,
                    "overwrite",
                  )
                }
                className="btn btn-primary w-full bg-red-600 border-red-600"
              >
                Timpa (Overwrite)
              </button>
              <button
                onClick={() =>
                  handleContentUpload(
                    { target: { files: [uploadConflict.file] } } as any,
                    "rename",
                  )
                }
                className="btn btn-primary w-full"
              >
                Ganti Nama (Rename)
              </button>
              <button
                onClick={() =>
                  setUploadConflict({ isOpen: false, file: null, type: "" })
                }
                className="btn btn-outline-primary w-full"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          fetchStats();
          setImportModalOpen(false);
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Konfirmasi Hapus"
        message={`Yakin ingin menghapus ${confirmModal.count} data terpilih?`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Status Modal (Success/Fail Delete) */}
      <StatusModal
        isOpen={statusModal.isOpen}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
      />

      {/* Edit User Modal */}
      {editUserModal.isOpen && editUserModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-darkmode-body w-full max-w-sm rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              Edit User: {editUserModal.user.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm mb-1">Role</label>
              <select
                id="editRole"
                defaultValue={editUserModal.user.role}
                className="w-full border p-2 rounded bg-gray-50 dark:bg-white/10 dark:text-white"
              >
                <option value="user">User (View Only)</option>
                <option value="operator">Operator (View + Export)</option>
                <option value="super_admin">Super Admin (Full Access)</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1">Status</label>
              <select
                id="editStatus"
                defaultValue={editUserModal.user.status}
                className="w-full border p-2 rounded bg-gray-50 dark:bg-white/10 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive (Banned)</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditUserModal({ isOpen: false, user: null })}
                className="btn btn-outline-primary btn-sm"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const role = (
                    document.getElementById("editRole") as HTMLSelectElement
                  ).value;
                  const status = (
                    document.getElementById("editStatus") as HTMLSelectElement
                  ).value;
                  updateUser(editUserModal.user!.id, role, status);
                }}
                className="btn btn-primary btn-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-darkmode-body w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-darkmode-border transform transition-all scale-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-darkmode-border bg-gray-50 dark:bg-white/5">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Detail{" "}
                  {modalType === "feedback" ? "Ulasan" : "Masukan Survei"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateIndo(selectedItem.created_at)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalType(null);
                }}
                className="text-gray-400 hover:text-red-500 bg-white dark:bg-white/10 p-2 rounded-full shadow-sm"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {(selectedItem.name || selectedItem.respondent_name || "A")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-800 dark:text-white">
                    {selectedItem.name || selectedItem.respondent_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedItem.respondent_role || "Pengunjung / Wali Murid"}
                  </p>
                  {modalType === "feedback" && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar
                          key={s}
                          className={
                            s <= selectedItem.rating
                              ? "text-yellow-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative rounded-xl bg-gray-50 dark:bg-white/5 p-6 border border-gray-100 dark:border-darkmode-border">
                <FaQuoteLeft className="absolute top-4 left-4 text-gray-200 dark:text-gray-600 text-2xl" />
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Isi Pesan:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {modalType === "feedback"
                      ? selectedItem.message
                      : selectedItem.feedback}
                  </p>
                </div>
              </div>
              {modalType === "survey" && (
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="p-2 bg-blue-50 rounded text-center dark:bg-blue-900/20">
                    <div className="font-bold text-blue-700 dark:text-blue-400">
                      ZI
                    </div>
                    {selectedItem.score_zi}
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center dark:bg-green-900/20">
                    <div className="font-bold text-green-700 dark:text-green-400">
                      LYN
                    </div>
                    {selectedItem.score_service}
                  </div>
                  <div className="p-2 bg-purple-50 rounded text-center dark:bg-purple-900/20">
                    <div className="font-bold text-purple-700 dark:text-purple-400">
                      AKD
                    </div>
                    {selectedItem.score_academic}
                  </div>
                  <div className="p-2 bg-yellow-50 rounded text-center dark:bg-yellow-900/20">
                    <div className="font-bold text-yellow-700 dark:text-yellow-400">
                      SAR
                    </div>
                    {selectedItem.score_facilities}
                  </div>
                  <div className="p-2 bg-red-50 rounded text-center dark:bg-red-900/20">
                    <div className="font-bold text-red-700 dark:text-red-400">
                      MGT
                    </div>
                    {selectedItem.score_management}
                  </div>
                  <div className="p-2 bg-teal-50 rounded text-center dark:bg-teal-900/20">
                    <div className="font-bold text-teal-700 dark:text-teal-400">
                      BUD
                    </div>
                    {selectedItem.score_culture}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 dark:border-darkmode-border">
              <span>IP: {selectedItem.ip_address}</span>
              <div className="flex gap-2">
                {userRole === "super_admin" && (
                  <button
                    onClick={() => requestDelete([selectedItem.id], modalType!)}
                    className="btn bg-red-100 text-red-600 hover:bg-red-200 border-transparent btn-sm flex items-center gap-2"
                  >
                    <FaTrash /> Hapus
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setModalType(null);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

// 1. STATUS MODAL (NEW)
const StatusModal = ({ isOpen, status, title, message, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-darkmode-body w-full max-w-sm rounded-xl shadow-2xl p-6 text-center border border-gray-100 dark:border-darkmode-border">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${status === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"}`}
        >
          {status === "success" ? (
            <FaCheckCircle className="text-4xl animate-bounce" />
          ) : (
            <FaTimesCircle className="text-4xl" />
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-500 mb-6 text-sm">{message}</p>
        <button onClick={onClose} className="btn btn-primary w-full">
          OK, Mengerti
        </button>
      </div>
    </div>
  );
};

// 2. CONFIRMATION MODAL
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-darkmode-body w-full max-w-sm rounded-xl shadow-2xl p-6 border border-gray-100 dark:border-darkmode-border">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4 text-red-600">
            <FaExclamationCircle className="text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {message}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-md shadow-red-200"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. STAT CARD
const StatCard = ({ label, value, icon, color, bg }: any) => (
  <div className="flex items-center justify-between rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-darkmode-light dark:border-darkmode-border">
    <div>
      <p className="text-sm font-medium text-text-light">{label}</p>
      <p className="mt-2 text-3xl font-bold text-text-dark dark:text-white">
        {value}
      </p>
    </div>
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-lg ${bg} text-xl ${color}`}
    >
      {icon}
    </div>
  </div>
);

// 4. IMPORT MODAL
const ImportModal = ({ isOpen, onClose, onSuccess }: any) => {
  const [importType, setImportType] = useState<
    "feedback" | "survey" | "visits"
  >("feedback");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [resultMessage, setResultMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUploadStatus("idle");
      setProgress(0);
      setFile(null);
      setResultMessage("");
      setCountdown(5);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (uploadStatus === "success" && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (uploadStatus === "success" && countdown === 0) {
      window.location.reload();
    }
    return () => clearTimeout(timer);
  }, [uploadStatus, countdown]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProgress(0);
      setResultMessage("");
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploadStatus("uploading");
    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", importType);
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable)
        setProgress(Math.round((event.loaded / event.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          if (json.status === "success") {
            setUploadStatus("success");
            setResultMessage(json.message);
          } else {
            setUploadStatus("error");
            setResultMessage(json.message || "Gagal mengupload file.");
          }
        } catch (e) {
          setUploadStatus("error");
          setResultMessage("Format respon server tidak valid.");
        }
      } else {
        setUploadStatus("error");
        setResultMessage(`Terjadi kesalahan server (Code: ${xhr.status}).`);
      }
    });
    xhr.addEventListener("error", () => {
      setUploadStatus("error");
      setResultMessage("Terjadi kesalahan jaringan.");
    });
    xhr.open("POST", "/api/import.php?action=import");
    xhr.send(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-darkmode-body w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-darkmode-border transition-all duration-300">
        {uploadStatus === "idle" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Import Data CSV</h3>
              <button onClick={onClose}>
                <FaTimes className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Pilih Tipe Data
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importType"
                    value="feedback"
                    checked={importType === "feedback"}
                    onChange={() => setImportType("feedback")}
                  />
                  Data Ulasan
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importType"
                    value="survey"
                    checked={importType === "survey"}
                    onChange={() => setImportType("survey")}
                  />
                  Data Survei
                </label>
                {/* Opsi Baru */}
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="radio"
                    name="importType"
                    value="visits"
                    checked={importType === "visits"}
                    onChange={() => setImportType("visits")}
                  />
                  Data Kunjungan
                </label>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Upload File
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-green-600 font-medium animate-fade-in">
                    <FaFileCsv size={32} />
                    <span className="truncate max-w-[200px] text-sm">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">
                      Klik untuk ganti file
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-500 group-hover:text-primary transition-colors">
                    <FaFileUpload className="mx-auto mb-2 text-2xl" />
                    <p>Klik untuk memilih file CSV</p>
                  </div>
                )}
              </div>
              <div className="mt-2 text-right">
                <a
                  href={`/api/import.php?action=template&type=${importType}`}
                  className="text-xs text-primary hover:underline flex items-center justify-end gap-1"
                >
                  <FaDownload /> Download Template CSV
                </a>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="btn btn-outline-primary btn-sm"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!file}
              >
                Mulai Import
              </button>
            </div>
          </div>
        )}
        {uploadStatus === "uploading" && (
          <div className="p-8 text-center animate-fade-in">
            <div className="mb-4">
              <FaSpinner className="mx-auto text-4xl text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-bold mb-2">Mengupload Data...</h3>
            <p className="text-sm text-gray-500 mb-6">
              Mohon jangan tutup halaman ini.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden relative">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-center"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-2 font-mono text-gray-600 dark:text-gray-400">
              <span>{progress}%</span>
              <span>100%</span>
            </div>
            {progress === 100 && (
              <p className="text-xs text-orange-500 mt-4 animate-pulse">
                Validasi & Insert Database sedang berjalan...
              </p>
            )}
          </div>
        )}
        {uploadStatus === "success" && (
          <div className="p-8 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <FaCheckCircle className="text-5xl text-green-600 dark:text-green-400 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
              Import Berhasil!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {resultMessage}
            </p>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-darkmode-border">
              <p className="text-sm text-gray-500">
                Halaman akan dimuat ulang dalam{" "}
                <span className="font-bold text-dark dark:text-white">
                  {countdown}
                </span>{" "}
                detik.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 btn btn-primary w-full"
            >
              Muat Ulang Sekarang
            </button>
          </div>
        )}
        {uploadStatus === "error" && (
          <div className="p-8 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <FaTimesCircle className="text-5xl text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              Import Gagal
            </h3>
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 mb-6 overflow-y-auto max-h-40">
              <p className="text-sm text-red-600 dark:text-red-300 break-words">
                {resultMessage}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn btn-outline-primary w-full"
              >
                Tutup
              </button>
              <button
                onClick={() => setUploadStatus("idle")}
                className="btn btn-primary w-full"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. DATA TABLE
const DataTable = ({
  title,
  data,
  columns,
  searchKeys = ["slug"],
  onDownload,
  enableSelection = false,
  onBulkDelete,
  customFilters,
}: any) => {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [data, currentPage, search]);

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row: any) =>
      searchKeys.some((key: any) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    );
  }, [data, search, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const requestSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig?.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = paginatedData.map((row: any) => row.id);
      setSelectedIds(currentIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden dark:bg-darkmode-light dark:border-darkmode-border">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between border-b border-border dark:border-darkmode-border bg-gray-50 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">{title}</h3>
          {enableSelection && selectedIds.length > 0 && (
            <button
              onClick={() => onBulkDelete && onBulkDelete(selectedIds)}
              className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs font-bold flex items-center gap-2 animate-fade-in transition-all"
            >
              <FaTrash /> Hapus ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {customFilters}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari data..."
              className="w-full rounded-lg border border-border py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none dark:bg-darkmode-body dark:border-darkmode-border"
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={onDownload}
            className="btn btn-primary btn-sm flex items-center justify-center gap-2 bg-green-600 border-green-600 hover:bg-green-700"
          >
            <FaDownload /> Excel
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 dark:bg-black/20">
            <tr>
              {enableSelection && (
                <th className="px-4 py-3 w-10 text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((row: any) =>
                          selectedIds.includes(row.id),
                        )
                      }
                    />
                  </div>
                </th>
              )}
              <th className="px-6 py-3 w-10 text-center">#</th>
              {columns.map((col: any) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${col.className || ""}`}
                  onClick={() => col.sortable && requestSort(col.key)}
                >
                  <div
                    className={`flex items-center gap-1 ${col.className?.includes("text-center") ? "justify-center" : ""} ${col.className?.includes("text-right") ? "justify-end" : ""}`}
                  >
                    {col.label}
                    {col.sortable && (
                      <span className="text-gray-400">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          )
                        ) : (
                          <FaSort />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-darkmode-border">
            {paginatedData.length > 0 ? (
              paginatedData.map((row: any, i: number) => (
                <tr
                  key={i}
                  className={`transition-colors ${selectedIds.includes(row.id) ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
                >
                  {enableSelection && (
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-center text-gray-400">
                    {(currentPage - 1) * rowsPerPage + i + 1}
                  </td>
                  {columns.map((col: any) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (enableSelection ? 2 : 1)}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-border bg-gray-50 p-4 dark:bg-white/5 dark:border-darkmode-border sm:flex-row">
        <div className="text-xs text-gray-500">
          Menampilkan{" "}
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {(currentPage - 1) * rowsPerPage + 1}
          </span>{" "}
          sampai{" "}
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {Math.min(currentPage * rowsPerPage, sortedData.length)}
          </span>{" "}
          dari{" "}
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {sortedData.length}
          </span>{" "}
          data
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded border border-border bg-white px-2 py-1 text-xs outline-none focus:border-primary dark:bg-darkmode-body dark:border-darkmode-border"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
          <div className="flex rounded border border-border bg-white dark:bg-darkmode-body dark:border-darkmode-border">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <span className="px-3 py-1 text-xs font-medium border-l border-r border-border dark:border-darkmode-border flex items-center">
              Halaman {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

```

---

### File: `./src/layouts/helpers/PengaduanForm.tsx`

```tsx
import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaExclamationTriangle,
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const PengaduanForm = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    kategori: "Pelayanan",
    judul: "",
    isi_pengaduan: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const kategoriOptions = [
    "Pelayanan",
    "Fasilitas",
    "Akademik",
    "Keuangan",
    "SDM",
    "Lainnya",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/pengaduan.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.status === "success") {
        setStatus("success");
        setMessage(result.message);
        setFormData({
          nama: "",
          email: "",
          telepon: "",
          kategori: "Pelayanan",
          judul: "",
          isi_pengaduan: "",
        });
      } else {
        setStatus("error");
        setMessage(result.message || "Terjadi kesalahan.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Gagal menghubungi server.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-border bg-white p-8 shadow-sm text-center dark:border-darkmode-border dark:bg-darkmode-body">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
          <FaCheckCircle size={30} />
        </div>
        <h3 className="h4 mb-2 text-green-700 dark:text-green-400">
          Pengaduan Terkirim!
        </h3>
        <p className="mb-6 text-sm text-text-light">{message}</p>
        <button
          onClick={() => setStatus("idle")}
          className="btn btn-primary"
        >
          Kirim Pengaduan Lain
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-8 shadow-sm dark:border-darkmode-border dark:bg-darkmode-body">
      <h3 className="h4 mb-6 text-center">Form Pengaduan</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FaUser className="text-primary" />
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="form-input"
            placeholder="Nama lengkap Anda"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FaEnvelope className="text-primary" />
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="email@example.com"
            required
          />
        </div>

        {/* Telepon */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FaPhone className="text-primary" />
            Nomor Telepon
          </label>
          <input
            type="tel"
            name="telepon"
            value={formData.telepon}
            onChange={handleChange}
            className="form-input"
            placeholder="08123456789"
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="form-label flex items-center gap-2">
            <FaExclamationTriangle className="text-primary" />
            Kategori Pengaduan <span className="text-red-500">*</span>
          </label>
          <select
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            className="form-input cursor-pointer"
            required
          >
            {kategoriOptions.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>

        {/* Judul */}
        <div>
          <label className="form-label">
            Judul Pengaduan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="judul"
            value={formData.judul}
            onChange={handleChange}
            className="form-input"
            placeholder="Ringkasan pengaduan Anda"
            required
          />
        </div>

        {/* Isi Pengaduan */}
        <div>
          <label className="form-label">
            Isi Pengaduan <span className="text-red-500">*</span>
          </label>
          <textarea
            name="isi_pengaduan"
            value={formData.isi_pengaduan}
            onChange={handleChange}
            className="form-input"
            rows={6}
            placeholder="Jelaskan pengaduan Anda secara detail..."
            required
          ></textarea>
        </div>

        {/* Status Error */}
        {status === "error" && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3">
            <FaTimesCircle className="text-xl" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Mengirim...
            </>
          ) : (
            <>
              <FaPaperPlane /> Kirim Pengaduan
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          <strong>Catatan:</strong> Pengaduan Anda akan kami proses dan ditindaklanjuti 
          maksimal 3x24 jam. Kami akan menghubungi Anda melalui email atau telepon 
          yang telah didaftarkan.
        </p>
      </div>
    </div>
  );
};

export default PengaduanForm;
```

---

### File: `./src/pages/admin/index.astro`

```astro
---
import Base from "@/layouts/Base.astro";
import AdminDashboard from "@/layouts/helpers/AdminDashboard";

// Halaman ini bersifat statis di sisi Astro,
// proteksi sebenarnya dilakukan di dalam komponen React (Client-side)
// dan di PHP API (Server-side)
---

<Base
  title="Admin Dashboard"
  meta_title="Admin Panel - MTsN 1 Pandeglang"
  noindex={true}
>
  <section class="section-sm bg-gray-50 dark:bg-darkmode-body min-h-screen">
    <div class="container">
      <AdminDashboard client:only="react" />
    </div>
  </section>
</Base>

```

---

### File: `./src/pages/pengaduan.astro`

```astro
---
import Base from "@/layouts/Base.astro";
import PageHeader from "@/partials/PageHeader.astro";
import PengaduanForm from "@/layouts/helpers/PengaduanForm";

const title = "Pengaduan Masyarakat";
const description =
  "Sampaikan keluhan, kritik, atau saran Anda terkait pelayanan dan kegiatan di MTs Negeri 1 Pandeglang.";
---

<Base title={title} meta_title={title} description={description}>
  <PageHeader title={title} />

  <section class="section-sm">
    <div class="container">
      <div class="row justify-center">
        <div class="lg:col-10">
          <div class="mb-10 text-center">
            <p class="text-lg">
              Sistem pengaduan ini dirancang untuk menerima masukan, keluhan,
              dan saran dari masyarakat terkait pelayanan di <strong
                >MTs Negeri 1 Pandeglang</strong
              >. Kami berkomitmen untuk menindaklanjuti setiap pengaduan dengan
              serius dan profesional.
            </p>
          </div>

          <PengaduanForm client:only="react" />
        </div>
      </div>
    </div>
  </section>
</Base>
```

---

## Direktori: public

### File: `./public/api/admin.php`

```
<?php
session_start();
date_default_timezone_set('Asia/Jakarta');
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('HTTP/1.1 403 Forbidden');
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    $action = $_GET['action'] ?? 'stats';

    function formatTanggalIndo($timestamp)
    {
        try {
            $dt = new DateTime($timestamp, new DateTimeZone('UTC'));
            $dt->setTimezone(new DateTimeZone('Asia/Jakarta'));
            $bulan = [1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            return $dt->format('d') . ' ' . $bulan[(int)$dt->format('m')] . ' ' . $dt->format('Y') . ', ' . $dt->format('H:i');
        } catch (Exception $e) {
            return $timestamp;
        }
    }

    function getSafeDailyActivity($pdo, $table, $days = 30)
    {
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $data[$date] = 0;
        }

        try {
            $stmt = $pdo->prepare("SHOW TABLES LIKE :table");
            $stmt->execute([':table' => $table]);
            if (!$stmt->fetch()) return $data;

            $sql = "SELECT DATE(created_at) as date, COUNT(*) as count 
                    FROM $table 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY) 
                    GROUP BY DATE(created_at)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':days' => $days]);

            while ($row = $stmt->fetch()) {
                if (isset($data[$row['date']])) $data[$row['date']] = (int)$row['count'];
            }
        } catch (Exception $e) {
        }
        return $data;
    }

    if ($action === 'stats') {
        header('Content-Type: application/json');

        $visits = $pdo->query("SELECT value FROM global_stats WHERE `key` = 'site_visits'")->fetchColumn() ?: 0;
        $total_posts = $pdo->query("SELECT COUNT(*) FROM post_stats")->fetchColumn() ?: 0;
        $total_feedback = $pdo->query("SELECT COUNT(*) FROM feedback")->fetchColumn() ?: 0;
        $total_survey = $pdo->query("SELECT COUNT(*) FROM survey_responses")->fetchColumn() ?: 0;

        $stars = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        if ($total_feedback > 0) {
            $stmt = $pdo->query("SELECT rating, COUNT(*) as count FROM feedback GROUP BY rating");
            while ($row = $stmt->fetch()) $stars[$row['rating']] = (int)$row['count'];
        }

        $survey_avg = [
            'zi' => 0,
            'service' => 0,
            'academic' => 0,
            'facilities' => 0,
            'management' => 0,
            'culture' => 0
        ];

        if ($total_survey > 0) {
            $avgQuery = $pdo->query("SELECT 
                AVG(score_zi) as zi,
                AVG(score_service) as service,
                AVG(score_academic) as academic,
                AVG(score_facilities) as facilities,
                AVG(score_management) as management,
                AVG(score_culture) as culture
                FROM survey_responses")->fetch();

            if ($avgQuery) {
                $survey_avg['zi'] = round($avgQuery['zi'] ?? 0, 2);
                $survey_avg['service'] = round($avgQuery['service'] ?? 0, 2);
                $survey_avg['academic'] = round($avgQuery['academic'] ?? 0, 2);
                $survey_avg['facilities'] = round($avgQuery['facilities'] ?? 0, 2);
                $survey_avg['management'] = round($avgQuery['management'] ?? 0, 2);
                $survey_avg['culture'] = round($avgQuery['culture'] ?? 0, 2);
            }
        }

        $activity_feedback = getSafeDailyActivity($pdo, 'feedback');
        $activity_survey = getSafeDailyActivity($pdo, 'survey_responses');

        $posts = $pdo->query("SELECT slug, views FROM post_stats ORDER BY views DESC")->fetchAll();
        $feedbacks = $pdo->query("SELECT * FROM feedback ORDER BY created_at DESC")->fetchAll();
        $surveys = $pdo->query("SELECT * FROM survey_responses ORDER BY created_at DESC")->fetchAll();
        $visit_logs = $pdo->query("SELECT * FROM site_visit_logs ORDER BY created_at DESC LIMIT 1000")->fetchAll();

        echo json_encode([
            'overview' => ['visits' => $visits, 'posts_count' => $total_posts, 'feedback_count' => $total_feedback, 'survey_count' => $total_survey],
            'charts' => [
                'stars' => $stars,
                'survey_avg' => $survey_avg,
                'activity' => ['labels' => array_keys($activity_feedback), 'feedback' => array_values($activity_feedback), 'survey' => array_values($activity_survey)]
            ],
            'tables' => [
                'posts' => $posts,
                'feedbacks' => $feedbacks,
                'surveys' => $surveys,
                'visits' => $visit_logs
            ]
        ]);
    } elseif ($action === 'export') {
        $type = $_GET['type'] ?? '';
        $filename = "laporan_{$type}_" . date('Y-m-d_His') . ".csv";
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

        if ($type === 'feedback') {
            fputcsv($output, ['ID', 'Waktu (WIB)', 'Nama', 'Rating', 'Pesan', 'IP Address']);
            $stmt = $pdo->query("SELECT id, created_at, name, rating, message, ip_address FROM feedback ORDER BY created_at DESC");
            while ($row = $stmt->fetch()) {
                $row['created_at'] = formatTanggalIndo($row['created_at']);
                fputcsv($output, $row);
            }
        } elseif ($type === 'survey') {
            fputcsv($output, ['ID', 'Waktu (WIB)', 'Nama', 'Peran', 'ZI', 'Pelayanan', 'Akademik', 'Sarpras', 'Manajemen', 'Budaya', 'Masukan', 'IP Address']);
            $stmt = $pdo->query("SELECT id, created_at, respondent_name, respondent_role, score_zi, score_service, score_academic, score_facilities, score_management, score_culture, feedback, ip_address FROM survey_responses ORDER BY created_at DESC");
            while ($row = $stmt->fetch()) {
                $row['created_at'] = formatTanggalIndo($row['created_at']);
                fputcsv($output, $row);
            }
        } elseif ($type === 'posts') {
            fputcsv($output, ['Judul Artikel / Slug', 'Jumlah Pembaca']);
            $stmt = $pdo->query("SELECT slug, views FROM post_stats ORDER BY views DESC");
            while ($row = $stmt->fetch()) fputcsv($output, $row);
        } elseif ($type === 'visits') {
            fputcsv($output, ['ID', 'Waktu (WIB)', 'IP Address', 'User Agent / Perangkat']);
            $stmt = $pdo->query("SELECT id, created_at, ip_address, user_agent FROM site_visit_logs ORDER BY created_at DESC");
            while ($row = $stmt->fetch()) {
                $row['created_at'] = formatTanggalIndo($row['created_at']);
                fputcsv($output, $row);
            }
        }
        fclose($output);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/admin_pengaduan.php`

```
<?php
session_start();
date_default_timezone_set('Asia/Jakarta');
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('HTTP/1.1 403 Forbidden');
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

function initPengaduanTable($pdo)
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS pengaduan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telepon VARCHAR(20),
        kategori VARCHAR(100) NOT NULL,
        judul VARCHAR(255) NOT NULL,
        isi_pengaduan TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Menunggu',
        tanggapan TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_status (status),
        INDEX idx_kategori (kategori)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

function formatTanggalIndo($dateString)
{
    if (!$dateString) return "-";
    try {
        $date = new DateTime(
            $dateString . includes("Z")
                ? $dateString
                : $dateString . replace(" ", "T") . "Z"
        );
        return (new IntlDateFormatter(
            'id_ID',
            IntlDateFormatter::LONG,
            IntlDateFormatter::SHORT,
            'Asia/Jakarta'
        ))->format($date);
    } catch (Exception $e) {
        return $dateString;
    }
}

try {
    $pdo = getDBConnection();
    initPengaduanTable($pdo);

    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        header('Content-Type: application/json');

        $stmt = $pdo->query("SELECT * FROM pengaduan ORDER BY created_at DESC");
        $pengaduan = $stmt->fetchAll();

        $stats = [
            'total' => count($pengaduan),
            'menunggu' => 0,
            'proses' => 0,
            'selesai' => 0,
            'ditolak' => 0
        ];

        foreach ($pengaduan as $p) {
            $status = strtolower($p['status']);
            if (isset($stats[$status])) {
                $stats[$status]++;
            }
        }

        echo json_encode([
            'status' => 'success',
            'data' => $pengaduan,
            'stats' => $stats
        ]);
    } elseif ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $id = (int)$data['id'];
        $status = $data['status'];
        $tanggapan = htmlspecialchars(strip_tags($data['tanggapan'] ?? ''));

        $stmt = $pdo->prepare("UPDATE pengaduan 
            SET status = :status, tanggapan = :tanggapan 
            WHERE id = :id");
        $stmt->execute([
            ':status' => $status,
            ':tanggapan' => $tanggapan,
            ':id' => $id
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Pengaduan diupdate']);
    } elseif ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($_SESSION['user_role'] !== 'super_admin') {
            throw new Exception("Hanya Super Admin yang dapat menghapus pengaduan.");
        }

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $ids = $data['ids'] ?? [];
        if (empty($ids)) throw new Exception("ID tidak valid.");

        $sanitized_ids = array_map('intval', $ids);
        $placeholders = implode(',', array_fill(0, count($sanitized_ids), '?'));

        $stmt = $pdo->prepare("DELETE FROM pengaduan WHERE id IN ($placeholders)");
        $stmt->execute($sanitized_ids);

        echo json_encode([
            'status' => 'success',
            'message' => count($sanitized_ids) . ' pengaduan dihapus'
        ]);
    } elseif ($action === 'export') {
        $filename = "laporan_pengaduan_" . date('Y-m-d_His') . ".csv";
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

        fputcsv($output, ['ID', 'Tanggal', 'Nama', 'Email', 'Telepon', 'Kategori', 'Judul', 'Isi Pengaduan', 'Status', 'Tanggapan', 'IP Address']);

        $stmt = $pdo->query("SELECT * FROM pengaduan ORDER BY created_at DESC");
        while ($row = $stmt->fetch()) {
            fputcsv($output, [
                $row['id'],
                $row['created_at'],
                $row['nama'],
                $row['email'],
                $row['telepon'],
                $row['kategori'],
                $row['judul'],
                $row['isi_pengaduan'],
                $row['status'],
                $row['tanggapan'] ?: '-',
                $row['ip_address']
            ]);
        }

        fclose($output);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/auth.php`

```
<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
require_once __DIR__ . '/config.php';

$ADMIN_EMAIL_ENV = getenv('ADMIN_EMAIL') ?: 'dev.mtsn1pandeglang@gmail.com';

try {
    $pdo = getDBConnection();
    initializeTables($pdo);

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $ADMIN_EMAIL_ENV]);
    if (!$stmt->fetch()) {
        $ins = $pdo->prepare("INSERT INTO users (email, name, role, status) VALUES (:email, 'Super Admin', 'super_admin', 'active')");
        $ins->execute([':email' => $ADMIN_EMAIL_ENV]);
    }

    $action = $_GET['action'] ?? '';

    if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $id_token = $data['credential'] ?? '';
        if (!$id_token) throw new Exception('Token tidak ditemukan');

        $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $id_token;
        $response = @file_get_contents($url);
        if (!$response) throw new Exception('Gagal koneksi ke Google.');

        $payload = json_decode($response, true);
        if (isset($payload['email']) && $payload['email_verified'] == 'true') {
            $email = $payload['email'];
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();

            if ($user) {
                $upd = $pdo->prepare("UPDATE users SET name = :name, picture = :pic WHERE id = :id");
                $upd->execute([':name' => $payload['name'], ':pic' => $payload['picture'], ':id' => $user['id']]);

                if ($user['status'] === 'inactive') {
                    throw new Exception('Akun Anda dinonaktifkan. Hubungi Administrator.');
                }

                $_SESSION['admin_logged_in'] = true;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_name'] = $payload['name'];
                $_SESSION['user_picture'] = $payload['picture'];
                $_SESSION['user_role'] = $user['role'];

                echo json_encode([
                    'status' => 'success',
                    'user' => [
                        'name' => $payload['name'],
                        'email' => $email,
                        'picture' => $payload['picture'],
                        'role' => $user['role']
                    ]
                ]);
            } else {
                echo json_encode(['status' => 'unregistered', 'message' => 'Email belum terdaftar.', 'email' => $email]);
            }
        } else {
            throw new Exception('Token Google tidak valid.');
        }
    } elseif ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $id_token = $data['credential'] ?? '';
        if (!$id_token) throw new Exception('Token tidak ditemukan');

        $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $id_token;
        $response = @file_get_contents($url);
        $payload = json_decode($response, true);
        if (!isset($payload['email'])) throw new Exception('Token Invalid');

        $email = $payload['email'];
        $name = $payload['name'];
        $picture = $payload['picture'];

        $cek = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $cek->execute([':email' => $email]);
        if ($cek->fetch()) {
            throw new Exception("Email sudah terdaftar. Silakan login.");
        }

        $stmt = $pdo->prepare("INSERT INTO users (email, name, picture, role, status) VALUES (:email, :name, :pic, 'user', 'active')");
        $stmt->execute([':email' => $email, ':name' => $name, ':pic' => $picture]);
        $newId = $pdo->lastInsertId();

        $_SESSION['admin_logged_in'] = true;
        $_SESSION['user_id'] = $newId;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_picture'] = $picture;
        $_SESSION['user_role'] = 'user';

        echo json_encode([
            'status' => 'success',
            'message' => 'Registrasi berhasil! Selamat datang.',
            'user' => [
                'name' => $name,
                'email' => $email,
                'picture' => $picture,
                'role' => 'user'
            ]
        ]);
    } elseif ($action === 'check') {
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
            $role = $_SESSION['user_role'] ?? 'user';
            echo json_encode([
                'status' => 'authenticated',
                'user' => [
                    'name' => $_SESSION['user_name'] ?? 'User',
                    'email' => $_SESSION['user_email'] ?? '',
                    'picture' => $_SESSION['user_picture'] ?? '',
                    'role' => $role
                ]
            ]);
        } else {
            echo json_encode(['status' => 'guest']);
        }
    } elseif ($action === 'logout') {
        session_destroy();
        echo json_encode(['status' => 'success']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/config.php`

```
<?php
function getDBConnection()
{
    $host = getenv('DB_HOST') ?: '192.168.1.100';
    $port = getenv('DB_PORT') ?: '3306';
    $dbname = getenv('DB_DATABASE') ?: 'mtsn1pandeglang';
    $user = getenv('DB_USERNAME') ?: 'mtsn1pandeglang';
    $pass = getenv('DB_PASSWORD') ?: '18012000';

    try {
        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
        return $pdo;
    } catch (PDOException $e) {
        throw new Exception("Database connection failed: " . $e->getMessage());
    }
}

function initializeTables($pdo)
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        picture TEXT,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS global_stats (
        `key` VARCHAR(100) PRIMARY KEY,
        value BIGINT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS site_visit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS post_stats (
        slug VARCHAR(255) PRIMARY KEY,
        views BIGINT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        rating INT NOT NULL,
        message TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS survey_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        respondent_name VARCHAR(255),
        respondent_role VARCHAR(100),
        score_zi DECIMAL(3,2) DEFAULT 0,
        score_service DECIMAL(3,2) DEFAULT 0,
        score_academic DECIMAL(3,2) DEFAULT 0,
        score_facilities DECIMAL(3,2) DEFAULT 0,
        score_management DECIMAL(3,2) DEFAULT 0,
        score_culture DECIMAL(3,2) DEFAULT 0,
        feedback TEXT,
        details_json TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $stmt = $pdo->prepare("INSERT IGNORE INTO global_stats (`key`, value) VALUES ('site_visits', 0)");
    $stmt->execute();
}

function initializeComplaintsTables($pdo)
{
    // Tabel untuk pengaduan
    $pdo->exec("CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        attachment VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'normal',
        admin_response TEXT,
        responded_at TIMESTAMP NULL,
        responded_by VARCHAR(255),
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ticket (ticket_number),
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Generate ticket number function
}

// Helper untuk generate nomor tiket
function generateTicketNumber($pdo)
{
    $prefix = 'ADU';
    $date = date('Ymd');

    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM complaints WHERE DATE(created_at) = CURDATE()");
    $stmt->execute();
    $row = $stmt->fetch();
    $sequence = str_pad(($row['total'] ?? 0) + 1, 4, '0', STR_PAD_LEFT);

    return "{$prefix}{$date}{$sequence}";
}

```

---

### File: `./public/api/content.php`

```
<?php
session_start();
// Jangan set header JSON global di awal karena kita ada fitur download file binary/text
// header('Content-Type: application/json');

// 1. Cek Auth & Role (Hanya Super Admin & Operator)
if (!isset($_SESSION['admin_logged_in']) || ($_SESSION['user_role'] !== 'super_admin' && $_SESSION['user_role'] !== 'operator')) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

// Konfigurasi Path
$baseDir = __DIR__ . '/../../';
$paths = [
    'article' => $baseDir . 'src/content/blog/',
    'image'   => $baseDir . 'public/images/artikel/',
    'video'   => $baseDir . 'public/videos/artikel/'
];

// Helper: Format Size
function formatSizeUnits($bytes)
{
    if ($bytes >= 1073741824) $bytes = number_format($bytes / 1073741824, 2) . ' GB';
    elseif ($bytes >= 1048576) $bytes = number_format($bytes / 1048576, 2) . ' MB';
    elseif ($bytes >= 1024) $bytes = number_format($bytes / 1024, 2) . ' KB';
    elseif ($bytes > 1) $bytes = $bytes . ' bytes';
    elseif ($bytes == 1) $bytes = $bytes . ' byte';
    else $bytes = '0 bytes';
    return $bytes;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $type   = $_GET['type'] ?? 'article'; // article, image, video

    $targetDir = $paths[$type] ?? $paths['article'];

    // Pastikan folder ada
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0775, true);
    }

    // === ACTION: GET LIST FILES ===
    if ($method === 'GET' && $action === '') {
        header('Content-Type: application/json');
        $files = array_diff(scandir($targetDir), array('.', '..', '-index.md', '.gitkeep'));
        $fileList = [];

        foreach ($files as $file) {
            $filePath = $targetDir . $file;
            if (is_file($filePath)) {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                $validExt = ($type === 'article') ? ['md', 'mdx'] : (($type === 'image') ? ['jpg', 'jpeg', 'png', 'webp', 'gif'] : ['mp4', 'webm']);

                if (in_array($ext, $validExt)) {
                    $fileList[] = [
                        'name' => $file,
                        'size' => formatSizeUnits(filesize($filePath)),
                        'date' => date("Y-m-d H:i", filemtime($filePath)),
                        'url'  => ($type === 'article')
                            ? null // Artikel tidak punya URL publik langsung (harus dibuild)
                            : "/" . ($type === 'image' ? 'images' : 'videos') . "/artikel/" . $file
                    ];
                }
            }
        }
        // Sort by date desc (Terbaru diatas)
        usort($fileList, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        echo json_encode(['status' => 'success', 'data' => $fileList]);
    }

    // === ACTION: DOWNLOAD FILE (Untuk Tinjauan Super Admin) ===
    elseif ($method === 'GET' && $action === 'download') {
        // Validasi: Hanya Super Admin yang boleh download source code (.mdx)
        if ($type === 'article' && $_SESSION['user_role'] !== 'super_admin') {
            die("Access Denied.");
        }

        $filename = basename($_GET['file']);
        $filePath = $targetDir . $filename;

        if (file_exists($filePath)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;
        } else {
            http_response_code(404);
            die("File not found.");
        }
    }

    // === ACTION: UPLOAD FILE ===
    elseif ($method === 'POST' && $action === 'upload') {
        header('Content-Type: application/json');
        if (!isset($_FILES['file'])) throw new Exception("File tidak ditemukan.");

        $file = $_FILES['file'];
        $behavior = $_POST['behavior'] ?? 'ask'; // ask, overwrite, rename

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        // Validasi Ekstensi
        $allowed = [
            'article' => ['md', 'mdx'],
            'image'   => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            'video'   => ['mp4', 'webm']
        ];

        if (!in_array($ext, $allowed[$type])) {
            throw new Exception("Ekstensi file .$ext tidak diperbolehkan.");
        }

        // Sanitasi Nama File
        $filename = preg_replace('/[^a-zA-Z0-9\-\.]/', '-', basename($file['name']));
        $filename = preg_replace('/-+/', '-', $filename);

        $targetPath = $targetDir . $filename;

        // Cek Konflik
        if (file_exists($targetPath)) {
            if ($behavior === 'ask') {
                echo json_encode(['status' => 'conflict', 'message' => "File '$filename' sudah ada.", 'filename' => $filename]);
                exit;
            } elseif ($behavior === 'rename') {
                $filename = pathinfo($filename, PATHINFO_FILENAME) . '_' . time() . '.' . $ext;
                $targetPath = $targetDir . $filename;
            }
            // behavior 'overwrite' lanjut ke bawah
        }

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            chmod($targetPath, 0664);
            echo json_encode(['status' => 'success', 'message' => "File berhasil diupload. Menunggu tinjauan Super Admin untuk Rebuild."]);
        } else {
            throw new Exception("Gagal memindahkan file.");
        }
    }

    // === ACTION: DELETE FILE (SUPER ADMIN ONLY) ===
    elseif ($method === 'POST' && $action === 'delete') {
        header('Content-Type: application/json');
        if ($_SESSION['user_role'] !== 'super_admin') {
            throw new Exception("Hanya Super Admin yang dapat menghapus file.");
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $filename = basename($input['filename']);
        $targetPath = $targetDir . $filename;

        if (file_exists($targetPath)) {
            if (unlink($targetPath)) {
                echo json_encode(['status' => 'success', 'message' => "File $filename dihapus."]);
            } else {
                throw new Exception("Gagal menghapus file.");
            }
        } else {
            throw new Exception("File tidak ditemukan.");
        }
    }

    // === ACTION: REBUILD WEBSITE (SUPER ADMIN ONLY) ===
    elseif ($method === 'POST' && $action === 'rebuild') {
        header('Content-Type: application/json');
        if ($_SESSION['user_role'] !== 'super_admin') {
            throw new Exception("Hanya Super Admin yang dapat melakukan Rebuild.");
        }

        $cmd = "bash " . $baseDir . "rebuild.sh > /dev/null 2>&1 &";
        shell_exec($cmd);

        echo json_encode(['status' => 'success', 'message' => 'Proses Rebuild dimulai. Perubahan akan tayang dalam beberapa menit.']);
    }
} catch (Exception $e) {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
    }
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/crud.php`

```
<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['user_role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak: Hanya Super Admin yang bisa menghapus data.']);
    exit;
}

try {
    $pdo = getDBConnection();
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $action = $_GET['action'] ?? '';

    if ($action === 'delete') {
        $type = $data['type'] ?? '';
        $ids = [];
        if (isset($data['ids']) && is_array($data['ids'])) {
            $ids = $data['ids'];
        } elseif (isset($data['id'])) {
            $ids = [$data['id']];
        }

        if (empty($ids)) throw new Exception("Tidak ada data yang dipilih.");

        $table = '';
        if ($type === 'feedback') {
            $table = 'feedback';
        } elseif ($type === 'survey') {
            $table = 'survey_responses';
        } else {
            throw new Exception("Tipe data tidak dikenal.");
        }

        $sanitized_ids = array_map('intval', $ids);
        $placeholders = implode(',', array_fill(0, count($sanitized_ids), '?'));
        $query = "DELETE FROM $table WHERE id IN ($placeholders)";

        $stmt = $pdo->prepare($query);
        $stmt->execute($sanitized_ids);
        $count = $stmt->rowCount();

        echo json_encode(['status' => 'success', 'message' => "$count data berhasil dihapus."]);
    } else {
        throw new Exception("Action tidak valid.");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/feedback.php`

```
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
require_once __DIR__ . '/config.php';

function getClientIP()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return $_SERVER['HTTP_X_FORWARDED_FOR'];
    return $_SERVER['REMOTE_ADDR'];
}

try {
    $pdo = getDBConnection();
    initializeTables($pdo);
    $ip_address = getClientIP();

    function getStats($pdo)
    {
        $stmt = $pdo->query("SELECT AVG(rating) as average, COUNT(*) as total FROM feedback");
        $row = $stmt->fetch();
        return [
            'average' => round($row['average'] ?? 0, 1),
            'total' => $row['total'] ?? 0
        ];
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $checkIp = $pdo->prepare("SELECT id FROM feedback WHERE ip_address = :ip");
        $checkIp->execute([':ip' => $ip_address]);
        if ($checkIp->fetch()) {
            echo json_encode(['status' => 'error', 'message' => 'Anda sudah memberikan penilaian sebelumnya.']);
            exit;
        }

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        if (!isset($data['rating'])) throw new Exception("Rating wajib diisi.");

        $name = htmlspecialchars(strip_tags($data['name'] ?? 'Anonim'));
        $rating = (int)$data['rating'];
        $message = htmlspecialchars(strip_tags($data['message'] ?? ''));

        $stmt = $pdo->prepare("INSERT INTO feedback (name, rating, message, ip_address) VALUES (:name, :rating, :message, :ip)");
        $stmt->execute([':name' => $name, ':rating' => $rating, ':message' => $message, ':ip' => $ip_address]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Terima kasih atas penilaian Anda!',
            'stats' => getStats($pdo)
        ]);
    } else {
        $checkIp = $pdo->prepare("SELECT id FROM feedback WHERE ip_address = :ip");
        $checkIp->execute([':ip' => $ip_address]);
        $hasSubmitted = $checkIp->fetch() ? true : false;

        echo json_encode([
            'status' => 'ready',
            'has_submitted' => $hasSubmitted,
            'stats' => getStats($pdo)
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/import.php`

```
<?php
session_start();
header('Content-Type: application/json');
date_default_timezone_set('Asia/Jakarta');
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['admin_logged_in']) || ($_SESSION['user_role'] !== 'super_admin' && $_SESSION['user_role'] !== 'operator')) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak: User biasa tidak bisa melakukan import.']);
    exit;
}

set_time_limit(2);
ini_set('memory_limit', '2048M');

try {
    $pdo = getDBConnection();
    $action = $_GET['action'] ?? '';

    if ($action === 'template') {
        $type = $_GET['type'] ?? 'feedback';
        $filename = "template_import_{$type}.csv";

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');

        if ($type === 'feedback') {
            fputcsv($output, ['name', 'rating', 'message', 'created_at', 'ip_address']);
            fputcsv($output, ['Yahya Zulfikri', '5', 'Pelayanan sangat memuaskan.', '2022-07-01 08:00:00', '192.168.1.1']);
        } elseif ($type === 'survey') {
            fputcsv($output, [
                'respondent_name',
                'respondent_role',
                'score_zi',
                'score_service',
                'score_academic',
                'score_facilities',
                'score_management',
                'score_culture',
                'feedback',
                'created_at',
                'ip_address'
            ]);
            fputcsv($output, [
                'Siti Aminah',
                'Wali Murid',
                '5.0',
                '4.5',
                '5.0',
                '4.8',
                '5.0',
                '4.9',
                'Fasilitas sangat lengkap, pertahankan.',
                '2024-01-02 14:30:00',
                '192.168.1.2'
            ]);
        } elseif ($type === 'visits') {
            fputcsv($output, ['ip_address', 'user_agent', 'created_at']);
            fputcsv($output, ['192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...', '2024-02-01 08:00:00']);
        }
        fclose($output);
        exit;
    }

    if ($action === 'import' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("File CSV tidak ditemukan atau error saat upload.");
        }

        $type = $_POST['type'] ?? '';
        $fileTmpPath = $_FILES['file']['tmp_name'];

        $handle = fopen($fileTmpPath, "r");
        if ($handle === FALSE) throw new Exception("Gagal membaca file.");

        $headers = fgetcsv($handle, 1000, ",");
        if (!$headers) throw new Exception("File CSV kosong.");

        $cleanHeaders = array_map(function ($h) {
            return strtolower(trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h)));
        }, $headers);

        $successCount = 0;
        $pdo->beginTransaction();

        try {
            if ($type === 'feedback') {
                if (!in_array('rating', $cleanHeaders)) throw new Exception("Format salah.");
                $stmt = $pdo->prepare("INSERT INTO feedback (name, rating, message, created_at, ip_address) VALUES (:name, :rating, :message, :created_at, :ip_address)");
                while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                    if (count($data) < 5) continue;
                    $stmt->execute([
                        ':name' => $data[0] ?: 'Anonim',
                        ':rating' => (int)$data[1],
                        ':message' => $data[2] ?: '',
                        ':created_at' => $data[3] ?: date('Y-m-d H:i:s'),
                        ':ip_address' => $data[4] ?: '127.0.0.1'
                    ]);
                    $successCount++;
                }
            } elseif ($type === 'survey') {
                $stmt = $pdo->prepare("INSERT INTO survey_responses 
                    (respondent_name, respondent_role, score_zi, score_service, score_academic, score_facilities, score_management, score_culture, feedback, created_at, ip_address, details_json) 
                    VALUES (:name, :role, :zi, :service, :acad, :fac, :mgt, :cul, :feedback, :created, :ip, '{}')");

                while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                    if (count($data) < 11) continue;
                    $stmt->execute([
                        ':name' => $data[0] ?: 'Anonim',
                        ':role' => $data[1] ?: 'Umum',
                        ':zi' => (float)$data[2],
                        ':service' => (float)$data[3],
                        ':acad' => (float)$data[4],
                        ':fac' => (float)$data[5],
                        ':mgt' => (float)$data[6],
                        ':cul' => (float)$data[7],
                        ':feedback' => $data[8] ?: '',
                        ':created' => $data[9] ?: date('Y-m-d H:i:s'),
                        ':ip' => $data[10] ?: '127.0.0.1'
                    ]);
                    $successCount++;
                }
            } elseif ($type === 'visits') {
                $stmt = $pdo->prepare("INSERT INTO site_visit_logs (ip_address, user_agent, created_at) VALUES (:ip, :ua, :created)");
                while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                    if (count($data) < 3) continue;
                    $stmt->execute([
                        ':ip' => $data[0] ?: '127.0.0.1',
                        ':ua' => $data[1] ?: 'Imported',
                        ':created' => $data[2] ?: date('Y-m-d H:i:s')
                    ]);
                    $successCount++;
                }
                $pdo->exec("UPDATE global_stats SET value = value + $successCount WHERE `key` = 'site_visits'");
            }

            $pdo->commit();
            fclose($handle);
            echo json_encode(['status' => 'success', 'message' => "Berhasil mengimport $successCount data."]);
        } catch (Exception $ex) {
            $pdo->rollBack();
            throw $ex;
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/import_pengaduan.php`

```
<?php
session_start();
header('Content-Type: application/json');
date_default_timezone_set('Asia/Jakarta');
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['admin_logged_in']) || ($_SESSION['user_role'] !== 'super_admin' && $_SESSION['user_role'] !== 'operator')) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak']);
    exit;
}

set_time_limit(120);
ini_set('memory_limit', '512M');

function initPengaduanTable($pdo)
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS pengaduan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telepon VARCHAR(20),
        kategori VARCHAR(100) NOT NULL,
        judul VARCHAR(255) NOT NULL,
        isi_pengaduan TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Menunggu',
        tanggapan TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_status (status),
        INDEX idx_kategori (kategori)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

try {
    $pdo = getDBConnection();
    initPengaduanTable($pdo);

    $action = $_GET['action'] ?? '';

    if ($action === 'template') {
        $filename = "template_import_pengaduan.csv";

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

        fputcsv($output, ['nama', 'email', 'telepon', 'kategori', 'judul', 'isi_pengaduan', 'status', 'tanggapan', 'created_at', 'ip_address']);
        fputcsv($output, [
            'Budi Santoso',
            'budi.santoso@email.com',
            '081234567890',
            'Pelayanan',
            'Lambat dalam Pengurusan Surat',
            'Saya mengurus surat keterangan siswa sudah 1 minggu belum jadi. Mohon dipercepat prosesnya.',
            'Selesai',
            'Terima kasih atas laporannya. Surat sudah selesai dan dapat diambil.',
            '2024-12-01 09:00:00',
            '192.168.1.10'
        ]);
        fputcsv($output, [
            'Siti Nurhaliza',
            'siti.nur@email.com',
            '082345678901',
            'Fasilitas',
            'Toilet Rusak di Lantai 2',
            'Toilet wanita lantai 2 sudah beberapa hari tidak bisa digunakan karena rusak.',
            'Proses',
            'Sedang kami perbaiki, estimasi selesai 2 hari.',
            '2024-12-05 14:30:00',
            '192.168.1.11'
        ]);

        fclose($output);
        exit;
    }

    if ($action === 'import' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("File CSV tidak ditemukan atau error saat upload.");
        }

        $fileTmpPath = $_FILES['file']['tmp_name'];
        $handle = fopen($fileTmpPath, "r");
        if ($handle === FALSE) throw new Exception("Gagal membaca file.");

        $headers = fgetcsv($handle, 1000, ",");
        if (!$headers) throw new Exception("File CSV kosong.");

        $cleanHeaders = array_map(function ($h) {
            return strtolower(trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h)));
        }, $headers);

        if (!in_array('nama', $cleanHeaders) || !in_array('email', $cleanHeaders)) {
            throw new Exception("Format CSV salah. Kolom 'nama' dan 'email' wajib ada.");
        }

        $successCount = 0;
        $pdo->beginTransaction();

        try {
            $stmt = $pdo->prepare("INSERT INTO pengaduan 
                (nama, email, telepon, kategori, judul, isi_pengaduan, status, tanggapan, created_at, ip_address) 
                VALUES (:nama, :email, :telepon, :kategori, :judul, :isi, :status, :tanggapan, :created, :ip)");

            while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                if (count($data) < 6) continue;

                $stmt->execute([
                    ':nama' => $data[0] ?: 'Anonim',
                    ':email' => $data[1],
                    ':telepon' => $data[2] ?: '',
                    ':kategori' => $data[3] ?: 'Lainnya',
                    ':judul' => $data[4],
                    ':isi' => $data[5],
                    ':status' => $data[6] ?: 'Menunggu',
                    ':tanggapan' => $data[7] ?? '',
                    ':created' => $data[8] ?? date('Y-m-d H:i:s'),
                    ':ip' => $data[9] ?? '127.0.0.1'
                ]);
                $successCount++;
            }

            $pdo->commit();
            fclose($handle);

            echo json_encode([
                'status' => 'success',
                'message' => "Berhasil mengimport $successCount pengaduan."
            ]);
        } catch (Exception $ex) {
            $pdo->rollBack();
            throw $ex;
        }
    }

    if ($action === 'generate_dummy') {
        $dataDummy = [
            [
                'nama' => 'Ahmad Fauzi',
                'email' => 'ahmad.fauzi@email.com',
                'telepon' => '081234567890',
                'kategori' => 'Pelayanan',
                'judul' => 'Pelayanan PPDB Kurang Informatif',
                'isi' => 'Mohon informasi PPDB diperjelas di website. Banyak orang tua yang bingung.',
                'status' => 'Selesai',
                'tanggapan' => 'Terima kasih, sudah kami update di website.'
            ],
            [
                'nama' => 'Dewi Lestari',
                'email' => 'dewi.lestari@email.com',
                'telepon' => '082345678901',
                'kategori' => 'Fasilitas',
                'judul' => 'AC Kelas 8A Tidak Dingin',
                'isi' => 'AC di kelas 8A sudah lama tidak dingin. Siswa kepanasan saat belajar.',
                'status' => 'Proses',
                'tanggapan' => 'Sedang dalam perbaikan, estimasi selesai minggu depan.'
            ],
            [
                'nama' => 'Rudi Hermawan',
                'email' => 'rudi.h@email.com',
                'telepon' => '083456789012',
                'kategori' => 'Akademik',
                'judul' => 'Jadwal Pelajaran Sering Berubah',
                'isi' => 'Jadwal pelajaran sering berubah mendadak tanpa pemberitahuan yang jelas.',
                'status' => 'Menunggu',
                'tanggapan' => ''
            ],
            [
                'nama' => 'Nia Ramadhani',
                'email' => 'nia.rama@email.com',
                'telepon' => '084567890123',
                'kategori' => 'Keuangan',
                'judul' => 'Pembayaran SPP via Transfer Sulit',
                'isi' => 'Sistem pembayaran SPP via transfer sering error. Mohon diperbaiki.',
                'status' => 'Proses',
                'tanggapan' => 'Tim IT sedang memperbaiki sistem pembayaran.'
            ],
            [
                'nama' => 'Hendra Wijaya',
                'email' => 'hendra.w@email.com',
                'telepon' => '085678901234',
                'kategori' => 'SDM',
                'judul' => 'Guru Sering Terlambat Masuk Kelas',
                'isi' => 'Beberapa guru sering terlambat masuk kelas. Mohon ditindaklanjuti.',
                'status' => 'Selesai',
                'tanggapan' => 'Sudah kami tegur dan akan kami awasi kedisiplinannya.'
            ]
        ];

        $stmt = $pdo->prepare("INSERT INTO pengaduan 
            (nama, email, telepon, kategori, judul, isi_pengaduan, status, tanggapan, ip_address) 
            VALUES (:nama, :email, :telepon, :kategori, :judul, :isi, :status, :tanggapan, :ip)");

        $count = 0;
        foreach ($dataDummy as $dummy) {
            $stmt->execute([
                ':nama' => $dummy['nama'],
                ':email' => $dummy['email'],
                ':telepon' => $dummy['telepon'],
                ':kategori' => $dummy['kategori'],
                ':judul' => $dummy['judul'],
                ':isi' => $dummy['isi'],
                ':status' => $dummy['status'],
                ':tanggapan' => $dummy['tanggapan'],
                ':ip' => '127.0.0.1'
            ]);
            $count++;
        }

        echo json_encode([
            'status' => 'success',
            'message' => "Berhasil generate $count data dummy pengaduan."
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/pengaduan.php`

```
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
require_once __DIR__ . '/config.php';

function getClientIP()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return $_SERVER['HTTP_X_FORWARDED_FOR'];
    return $_SERVER['REMOTE_ADDR'];
}

function initPengaduanTable($pdo)
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS pengaduan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telepon VARCHAR(20),
        kategori VARCHAR(100) NOT NULL,
        judul VARCHAR(255) NOT NULL,
        isi_pengaduan TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Menunggu',
        tanggapan TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_status (status),
        INDEX idx_kategori (kategori)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

try {
    $pdo = getDBConnection();
    initPengaduanTable($pdo);
    $ip_address = getClientIP();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        // Validasi
        if (
            empty($data['nama']) || empty($data['email']) || empty($data['kategori']) ||
            empty($data['judul']) || empty($data['isi_pengaduan'])
        ) {
            throw new Exception("Semua field wajib diisi.");
        }

        // Sanitasi
        $nama = htmlspecialchars(strip_tags($data['nama']));
        $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
        if (!$email) throw new Exception("Format email tidak valid.");

        $telepon = htmlspecialchars(strip_tags($data['telepon'] ?? ''));
        $kategori = htmlspecialchars(strip_tags($data['kategori']));
        $judul = htmlspecialchars(strip_tags($data['judul']));
        $isi = htmlspecialchars(strip_tags($data['isi_pengaduan']));

        // Insert
        $stmt = $pdo->prepare("INSERT INTO pengaduan 
            (nama, email, telepon, kategori, judul, isi_pengaduan, ip_address) 
            VALUES (:nama, :email, :telepon, :kategori, :judul, :isi, :ip)");

        $stmt->execute([
            ':nama' => $nama,
            ':email' => $email,
            ':telepon' => $telepon,
            ':kategori' => $kategori,
            ':judul' => $judul,
            ':isi' => $isi,
            ':ip' => $ip_address
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Pengaduan Anda telah kami terima. Terima kasih atas partisipasi Anda. Kami akan segera menindaklanjuti.'
        ]);
    } else {
        // GET request (optional: untuk cek statistik publik)
        $total = $pdo->query("SELECT COUNT(*) FROM pengaduan")->fetchColumn();
        $selesai = $pdo->query("SELECT COUNT(*) FROM pengaduan WHERE status = 'Selesai'")->fetchColumn();

        echo json_encode([
            'status' => 'ready',
            'stats' => [
                'total' => $total,
                'selesai' => $selesai
            ]
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/print_pdf.php`

```
<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
session_start();
date_default_timezone_set('Asia/Jakarta');
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    die("Akses Ditolak.");
}
if (!file_exists(__DIR__ . '/lib/fpdf.php')) {
    die("Error: Library FPDF tidak ditemukan.");
}
require('lib/fpdf.php');

try {
    $pdo = getDBConnection();
} catch (Exception $e) {
    die("Error DB: " . $e->getMessage());
}

$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('m');
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
$bulanIndo = [1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
$periodeText = strtoupper($bulanIndo[$month] . ' ' . $year);

function getIndonesianDate($timestamp = null)
{
    $dt = new DateTime($timestamp ?? 'now');
    $bulan = [1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return $dt->format('d') . ' ' . $bulan[(int)$dt->format('m')] . ' ' . $dt->format('Y');
}

function formatFullTime($timestamp)
{
    return getIndonesianDate($timestamp) . ' ' . date('H:i', strtotime($timestamp)) . ' WIB';
}

class PDF extends FPDF
{
    var $widths;
    var $aligns;
    var $tableHeaderCallback = null;
    var $isPrintingTable = false;

    function setPageBreakTrigger($val)
    {
        $this->PageBreakTrigger = $val;
    }

    function getPageBreakTrigger()
    {
        return $this->PageBreakTrigger;
    }

    function SetWidths($w)
    {
        $this->widths = $w;
    }

    function SetAligns($a)
    {
        $this->aligns = $a;
    }

    function SetTableHeaderCallback($callback)
    {
        $this->tableHeaderCallback = $callback;
    }

    function ImageRemote($url, $x, $y, $w, $h)
    {
        $tmpFile = sys_get_temp_dir() . '/qr_' . md5($url) . '.png';
        if (file_exists($tmpFile) && filesize($tmpFile) > 0) {
            $this->Image($tmpFile, $x, $y, $w, $h);
            return;
        }
        $ch = curl_init($url);
        $fp = fopen($tmpFile, 'wb');
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        fclose($fp);
        if ($code == 200 && filesize($tmpFile) > 0) {
            $this->Image($tmpFile, $x, $y, $w, $h);
        } else {
            $this->SetXY($x, $y);
            $this->SetFont('Arial', 'I', 7);
            $this->Cell($w, $h, 'QR Error', 0, 0, 'C');
        }
    }

    function Header()
    {
        $path = '../images/instansi/';
        $logoSize = 24;
        if (file_exists($path . 'logo-institusi.png')) $this->Image($path . 'logo-institusi.png', 10, 10, $logoSize);
        if (file_exists($path . 'logo-instansi.png')) $this->Image($path . 'logo-instansi.png', 176, 10, $logoSize);
        $this->SetY(12);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(0, 5, 'KEMENTERIAN AGAMA REPUBLIK INDONESIA', 0, 1, 'C');
        $this->SetFont('Arial', 'B', 12);
        $this->Cell(0, 6, 'KANTOR KEMENTERIAN AGAMA KABUPATEN PANDEGLANG', 0, 1, 'C');
        $this->SetFont('Arial', 'B', 14);
        $this->Cell(0, 6, 'MADRASAH TSANAWIYAH NEGERI 1 PANDEGLANG', 0, 1, 'C');
        $this->SetFont('Arial', '', 9);
        $this->Cell(0, 4, 'Jl. Raya Labuan Km. 5,7 Palurahan, Kaduhejo, Pandeglang - Banten 42253', 0, 1, 'C');
        $this->Cell(0, 4, 'Website: https://mtsn1pandeglang.sch.id | Email: adm@mtsn1pandeglang.sch.id', 0, 1, 'C');
        $this->SetLineWidth(0.5);
        $this->Line(10, 39, 200, 39);
        $this->SetLineWidth(0.2);
        $this->Line(10, 40, 200, 40);
        $this->Ln(6);
    }

    function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, 'Hal ' . $this->PageNo() . '/{nb} | Sistem Informasi MTsN 1 Pandeglang | Dicetak: ' . date('d/m/Y H:i') . ' WIB', 0, 0, 'C');
    }

    function Row($data, $fill = false)
    {
        $nb = 0;
        for ($i = 0; $i < count($data); $i++) $nb = max($nb, $this->NbLines($this->widths[$i], $data[$i]));
        $h = 5 * $nb;
        $this->CheckPageBreak($h);
        for ($i = 0; $i < count($data); $i++) {
            $w = $this->widths[$i];
            $a = isset($this->aligns[$i]) ? $this->aligns[$i] : 'L';
            $x = $this->GetX();
            $y = $this->GetY();
            $this->Rect($x, $y, $w, $h, $fill ? 'DF' : 'D');
            $this->MultiCell($w, 5, $data[$i], 0, $a);
            $this->SetXY($x + $w, $y);
        }
        $this->Ln($h);
    }

    function CheckPageBreak($h)
    {
        if ($this->GetY() + $h > $this->PageBreakTrigger) {
            $this->AddPage($this->CurOrientation);
            if ($this->isPrintingTable && is_callable($this->tableHeaderCallback)) {
                call_user_func($this->tableHeaderCallback);
            }
        }
    }

    function NbLines($w, $txt)
    {
        $cw = &$this->CurrentFont['cw'];
        if ($w == 0) $w = $this->w - $this->rMargin - $this->x;
        $wmax = ($w - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $s = str_replace("\r", '', $txt);
        $nb = strlen($s);
        if ($nb > 0 && $s[$nb - 1] == "\n") $nb--;
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $nl = 1;
        while ($i < $nb) {
            $c = $s[$i];
            if ($c == "\n") {
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
                continue;
            }
            if ($c == ' ') $sep = $i;
            $l += $cw[$c];
            if ($l > $wmax) {
                if ($sep == -1) {
                    if ($i == $j) $i++;
                } else $i = $sep + 1;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
            } else $i++;
        }
        return $nl;
    }
}

try {
    $pdf = new PDF();
    $pdf->AliasNbPages();
    $pdf->SetMargins(10, 10, 10);
    $pdf->SetAutoPageBreak(false);
    $pdf->setPageBreakTrigger(277);
    $pdf->AddPage();

    $m = str_pad($month, 2, '0', STR_PAD_LEFT);
    $y = $year;

    $visits = $pdo->query("SELECT value FROM global_stats WHERE `key` = 'site_visits'")->fetchColumn() ?: 0;
    $feedbackCount = $pdo->query("SELECT COUNT(*) FROM feedback WHERE MONTH(created_at) = $m AND YEAR(created_at) = $y")->fetchColumn() ?: 0;
    $surveyCount = $pdo->query("SELECT COUNT(*) FROM survey_responses WHERE MONTH(created_at) = $m AND YEAR(created_at) = $y")->fetchColumn() ?: 0;
    $articleViews = $pdo->query("SELECT SUM(views) FROM post_stats")->fetchColumn() ?: 0;

    $indices = $pdo->query("SELECT 
        AVG(score_zi) as zi, 
        AVG(score_service) as service, 
        AVG(score_academic) as academic,
        AVG(score_facilities) as facilities,
        AVG(score_management) as management,
        AVG(score_culture) as culture 
        FROM survey_responses 
        WHERE MONTH(created_at) = $m AND YEAR(created_at) = $y")->fetch();

    $idxZI = $indices ? round($indices['zi'] ?? 0, 2) : 0;
    $idxService = $indices ? round($indices['service'] ?? 0, 2) : 0;
    $idxAcademic = $indices ? round($indices['academic'] ?? 0, 2) : 0;
    $idxFacilities = $indices ? round($indices['facilities'] ?? 0, 2) : 0;
    $idxManagement = $indices ? round($indices['management'] ?? 0, 2) : 0;
    $idxCulture = $indices ? round($indices['culture'] ?? 0, 2) : 0;

    $ikmValue = 0;
    if ($surveyCount > 0) {
        $ikmValue = round(($idxZI + $idxService + $idxAcademic + $idxFacilities + $idxManagement + $idxCulture) / 6, 2);
    }

    $avgRatingRaw = $pdo->query("SELECT AVG(rating) FROM feedback WHERE MONTH(created_at) = $m AND YEAR(created_at) = $y")->fetchColumn();
    $avgRatingVal = $avgRatingRaw ? round($avgRatingRaw, 2) : 0;
    $avgRatingText = ($avgRatingVal > 0) ? "$avgRatingVal / 5.00" : "-";

    function getPredikat($val)
    {
        if ($val >= 4.5) return "Sangat Baik (A)";
        if ($val >= 4.0) return "Baik (B)";
        if ($val >= 3.0) return "Cukup (C)";
        if ($val > 0) return "Kurang (D)";
        return "-";
    }

    $ikmText = ($ikmValue > 0) ? "$ikmValue / 5.00 (" . getPredikat($ikmValue) . ")" : "-";

    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(0, 6, 'LAPORAN REKAPITULASI PELAYANAN DIGITAL', 0, 1, 'C');
    $pdf->SetFont('Arial', '', 10);
    $pdf->Cell(0, 5, 'Periode Laporan: ' . $periodeText, 0, 1, 'C');
    $pdf->Ln(5);

    $startX = 10;
    $startY = $pdf->GetY();
    $rowH = 7;
    $wQR = 35;
    $wTable1 = 155;

    $pdf->SetFont('Arial', 'B', 9);
    $pdf->SetFillColor(230, 230, 230);
    $pdf->Cell($wTable1, $rowH, ' I. RINGKASAN TRAFIK WEBSITE', 1, 0, 'L', true);
    $pdf->Cell($wQR, $rowH * 4, '', 1, 0, 'C');

    $qrContent = urlencode("MTSN1PDG|{$m}/{$y}|V:{$visits}|A:{$articleViews}|S:{$surveyCount}|F:{$feedbackCount}|IKM:{$ikmValue}");
    $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={$qrContent}&bgcolor=ffffff";
    $pdf->ImageRemote($qrUrl, ($startX + $wTable1) + 5.5, $startY + 2, 24, 24);
    $pdf->Ln($rowH);

    $wLabel = 65;
    $wValue = 90;
    $pdf->SetFont('Arial', '', 9);
    $pdf->SetFillColor(250, 250, 250);
    $pdf->Cell($wLabel, $rowH, ' Bulan Pelaporan', 1, 0, 'L', true);
    $pdf->Cell($wValue, $rowH, '  ' . $periodeText, 1, 1, 'L');
    $pdf->Cell($wLabel, $rowH, ' Total Kunjungan', 1, 0, 'L', true);
    $pdf->Cell($wValue, $rowH, '  ' . number_format($visits) . ' Pengunjung', 1, 1, 'L');
    $pdf->Cell($wLabel, $rowH, ' Total Artikel Dibaca', 1, 0, 'L', true);
    $pdf->Cell($wValue, $rowH, '  ' . number_format($articleViews) . ' Kali Dibaca', 1, 1, 'L');
    $pdf->Ln(5);

    $pdf->SetFont('Arial', 'B', 9);
    $pdf->SetFillColor(230, 230, 230);
    $pdf->Cell(190, $rowH, ' II. KUALITAS PELAYANAN & PARTISIPASI PUBLIK', 1, 1, 'L', true);
    $pdf->SetFont('Arial', '', 9);
    $pdf->SetFillColor(250, 250, 250);

    $wLabelFull = 70;
    $wValueFull = 120;
    $pdf->Cell($wLabelFull, $rowH, ' Jumlah Ulasan Masuk', 1, 0, 'L', true);
    $pdf->Cell($wValueFull, $rowH, ' ' . number_format($feedbackCount) . ' Pesan', 1, 1, 'L');
    $pdf->Cell($wLabelFull, $rowH, ' Rata-rata Rating Ulasan', 1, 0, 'L', true);
    $pdf->Cell($wValueFull, $rowH, ' ' . $avgRatingText, 1, 1, 'L');
    $pdf->Cell($wLabelFull, $rowH, ' Jumlah Responden Survei', 1, 0, 'L', true);
    $pdf->Cell($wValueFull, $rowH, ' ' . number_format($surveyCount) . ' Orang', 1, 1, 'L');

    $wSub = 190 / 3;
    $pdf->Cell($wSub, $rowH, ' Indeks ZI: ' . ($idxZI > 0 ? $idxZI : '-'), 1, 0, 'C', true);
    $pdf->Cell($wSub, $rowH, ' Indeks Layanan: ' . ($idxService > 0 ? $idxService : '-'), 1, 0, 'C', true);
    $pdf->Cell($wSub, $rowH, ' Indeks Akademik: ' . ($idxAcademic > 0 ? $idxAcademic : '-'), 1, 1, 'C', true);
    $pdf->Cell($wSub, $rowH, ' Indeks Sarpras: ' . ($idxFacilities > 0 ? $idxFacilities : '-'), 1, 0, 'C', true);
    $pdf->Cell($wSub, $rowH, ' Indeks Manajemen: ' . ($idxManagement > 0 ? $idxManagement : '-'), 1, 0, 'C', true);
    $pdf->Cell($wSub, $rowH, ' Indeks Budaya: ' . ($idxCulture > 0 ? $idxCulture : '-'), 1, 1, 'C', true);

    $pdf->SetFont('Arial', 'B', 9);
    $pdf->SetFillColor(240, 240, 240);
    $pdf->Cell($wLabelFull, $rowH, ' Indeks Kepuasan Masy. (IKM)', 1, 0, 'L', true);
    $pdf->Cell($wValueFull, $rowH, ' ' . $ikmText, 1, 1, 'L', true);
    $pdf->Ln(5);

    $drawSurveyHeader = function () use ($pdf) {
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->SetFillColor(0, 150, 100);
        $pdf->SetTextColor(255);
        $pdf->Cell(8, 7, 'No', 1, 0, 'C', true);
        $pdf->Cell(30, 7, 'Waktu', 1, 0, 'C', true);
        $pdf->Cell(35, 7, 'Nama', 1, 0, 'L', true);
        $pdf->Cell(9, 7, 'ZI', 1, 0, 'C', true);
        $pdf->Cell(9, 7, 'LYN', 1, 0, 'C', true);
        $pdf->Cell(9, 7, 'AKD', 1, 0, 'C', true);
        $pdf->Cell(9, 7, 'SAR', 1, 0, 'C', true);
        $pdf->Cell(9, 7, 'MGT', 1, 0, 'C', true);
        $pdf->Cell(9, 7, 'BUD', 1, 0, 'C', true);
        $pdf->Cell(10, 7, 'IDX', 1, 0, 'C', true);
        $pdf->Cell(53, 7, 'Masukan', 1, 1, 'L', true);
        $pdf->SetTextColor(0);
        $pdf->SetFont('Arial', '', 7);
    };

    $pdf->SetFont('Arial', 'B', 10);
    $pdf->Cell(0, 7, 'A. DATA DETAIL SURVEI KEPUASAN', 0, 1, 'L');
    $pdf->SetWidths([8, 30, 35, 9, 9, 9, 9, 9, 9, 10, 53]);
    $pdf->SetAligns(['C', 'C', 'L', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'L']);
    $drawSurveyHeader();
    $pdf->SetTableHeaderCallback($drawSurveyHeader);
    $pdf->isPrintingTable = true;

    $resSurv = $pdo->query("SELECT * FROM survey_responses WHERE MONTH(created_at) = $m AND YEAR(created_at) = $y ORDER BY created_at ASC");
    $no = 1;
    $found1 = false;
    while ($row = $resSurv->fetch()) {
        $found1 = true;
        $idxIndividual = round(
            ($row['score_zi'] + $row['score_service'] + $row['score_academic'] +
                $row['score_facilities'] + $row['score_management'] + $row['score_culture']) / 6,
            2
        );
        $pdf->Row([
            $no++,
            formatFullTime($row['created_at']),
            $row['respondent_name'] . "\n(" . $row['respondent_role'] . ")",
            $row['score_zi'],
            $row['score_service'],
            $row['score_academic'],
            $row['score_facilities'],
            $row['score_management'],
            $row['score_culture'],
            $idxIndividual,
            $row['feedback'] ?: '-'
        ]);
    }
    $pdf->isPrintingTable = false;
    if (!$found1) $pdf->Cell(190, 8, 'Tidak ada data pada periode ini.', 1, 1, 'C');
    $pdf->Ln(6);

    $drawFeedbackHeader = function () use ($pdf) {
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->SetFillColor(255, 193, 7);
        $pdf->SetTextColor(0);
        $pdf->Cell(8, 7, 'No', 1, 0, 'C', true);
        $pdf->Cell(35, 7, 'Waktu', 1, 0, 'C', true);
        $pdf->Cell(45, 7, 'Nama Lengkap', 1, 0, 'L', true);
        $pdf->Cell(20, 7, 'Rating', 1, 0, 'C', true);
        $pdf->Cell(82, 7, 'Pesan', 1, 1, 'L', true);
        $pdf->SetFont('Arial', '', 8);
    };

    $pdf->SetFont('Arial', 'B', 10);
    if ($pdf->GetY() + 15 > $pdf->getPageBreakTrigger()) $pdf->AddPage();
    $pdf->Cell(0, 7, 'B. DATA DETAIL ULASAN MASUK', 0, 1, 'L');
    $pdf->SetWidths([8, 35, 45, 20, 82]);
    $pdf->SetAligns(['C', 'C', 'L', 'C', 'L']);
    $drawFeedbackHeader();
    $pdf->SetTableHeaderCallback($drawFeedbackHeader);
    $pdf->isPrintingTable = true;

    $resFeed = $pdo->query("SELECT * FROM feedback WHERE MONTH(created_at) = $m AND YEAR(created_at) = $y ORDER BY created_at ASC");
    $no = 1;
    $found2 = false;
    while ($row = $resFeed->fetch()) {
        $found2 = true;
        $pdf->Row([$no++, formatFullTime($row['created_at']), $row['name'] ?: 'Anonim', $row['rating'] . ' / 5', $row['message'] ?: '-']);
    }
    $pdf->isPrintingTable = false;
    if (!$found2) $pdf->Cell(190, 8, 'Tidak ada data pada periode ini.', 1, 1, 'C');
    $pdf->Ln(8);

    $signatureBlockHeight = 80;
    if ($pdf->GetY() + $signatureBlockHeight > $pdf->getPageBreakTrigger()) {
        $pdf->AddPage();
    }

    $path = '../images/instansi/';
    $tglCetak = getIndonesianDate();
    $qrSize = 18;
    $yStart = $pdf->GetY();

    $pdf->SetXY(120, $yStart);
    $pdf->SetFont('Arial', '', 11);
    $pdf->Cell(70, 5, 'Pandeglang, ' . $tglCetak, 0, 1, 'C');
    $pdf->Ln(5);

    $yJabatan = $pdf->GetY();
    $pdf->SetXY(20, $yJabatan);
    $pdf->Cell(70, 5, 'Kepala Tata Usaha,', 0, 0, 'C');
    $pdf->SetXY(120, $yJabatan);
    $pdf->Cell(70, 5, 'Koordinator Tim Pusdatin,', 0, 1, 'C');

    $yImage = $pdf->GetY() + 1;
    if (file_exists($path . 'tte-kepala-tata-usaha.png')) $pdf->Image($path . 'tte-kepala-tata-usaha.png', 46, $yImage, $qrSize);
    if (file_exists($path . 'tte-koordinator-tim-pusdatin.png')) $pdf->Image($path . 'tte-koordinator-tim-pusdatin.png', 146, $yImage, $qrSize);

    $pdf->SetY($yImage + 19);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->SetX(20);
    $pdf->Cell(70, 5, "UMAR MU'TAMAR, S.Ag.", 0, 0, 'C');
    $pdf->SetX(120);
    $pdf->Cell(70, 5, 'YAHYA ZULFIKRI', 0, 1, 'C');

    $pdf->SetFont('Arial', '', 10);
    $pdf->SetX(20);
    $pdf->Cell(70, 4, 'NIP. 196903061998031004', 0, 0, 'C');
    $pdf->SetX(120);
    $pdf->Cell(70, 4, 'NIP. 200001142025211016', 0, 1, 'C');
    $pdf->Ln(8);

    $pdf->SetFont('Arial', '', 11);
    $pdf->Cell(0, 5, 'Mengetahui,', 0, 1, 'C');
    $pdf->Cell(0, 5, 'Kepala Madrasah,', 0, 1, 'C');

    $yImageKamad = $pdf->GetY() + 1;
    if (file_exists($path . 'tte-kepala-madrasah.png')) $pdf->Image($path . 'tte-kepala-madrasah.png', 96, $yImageKamad, $qrSize);

    $pdf->SetY($yImageKamad + 19);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(0, 5, 'H. EMAN SULAIMAN, S.Ag., M.Pd.', 0, 1, 'C');
    $pdf->SetFont('Arial', '', 10);
    $pdf->Cell(0, 4, 'NIP. 197006032000031002', 0, 1, 'C');

    $pdf->Output('I', 'Laporan_Statistik_Website_' . $month . '_' . $year . '.pdf');
} catch (Exception $e) {
    die("PDF Error: " . $e->getMessage());
}

```

---

### File: `./public/api/print_pengaduan_pdf.php`

```
<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
session_start();
date_default_timezone_set('Asia/Jakarta');
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    die("Akses Ditolak.");
}
if (!file_exists(__DIR__ . '/lib/fpdf.php')) {
    die("Error: Library FPDF tidak ditemukan.");
}
require('lib/fpdf.php');

try {
    $pdo = getDBConnection();
} catch (Exception $e) {
    die("Error DB: " . $e->getMessage());
}

$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('m');
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
$status = isset($_GET['status']) ? $_GET['status'] : 'all';

$bulanIndo = [1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
$periodeText = strtoupper($bulanIndo[$month] . ' ' . $year);

function getIndonesianDate($timestamp = null)
{
    $dt = new DateTime($timestamp ?? 'now');
    $bulan = [1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return $dt->format('d') . ' ' . $bulan[(int)$dt->format('m')] . ' ' . $dt->format('Y');
}

function formatFullTime($timestamp)
{
    return getIndonesianDate($timestamp) . ' ' . date('H:i', strtotime($timestamp)) . ' WIB';
}

class PDF extends FPDF
{
    var $widths;
    var $aligns;
    var $tableHeaderCallback = null;
    var $isPrintingTable = false;

    function setPageBreakTrigger($val)
    {
        $this->PageBreakTrigger = $val;
    }

    function getPageBreakTrigger()
    {
        return $this->PageBreakTrigger;
    }

    function SetWidths($w)
    {
        $this->widths = $w;
    }

    function SetAligns($a)
    {
        $this->aligns = $a;
    }

    function SetTableHeaderCallback($callback)
    {
        $this->tableHeaderCallback = $callback;
    }

    function Header()
    {
        $path = '../images/instansi/';
        $logoSize = 24;
        if (file_exists($path . 'logo-institusi.png')) $this->Image($path . 'logo-institusi.png', 10, 10, $logoSize);
        if (file_exists($path . 'logo-instansi.png')) $this->Image($path . 'logo-instansi.png', 176, 10, $logoSize);

        $this->SetY(12);
        $this->SetFont('Arial', 'B', 10);
        $this->Cell(0, 5, 'KEMENTERIAN AGAMA REPUBLIK INDONESIA', 0, 1, 'C');
        $this->SetFont('Arial', 'B', 12);
        $this->Cell(0, 6, 'KANTOR KEMENTERIAN AGAMA KABUPATEN PANDEGLANG', 0, 1, 'C');
        $this->SetFont('Arial', 'B', 14);
        $this->Cell(0, 6, 'MADRASAH TSANAWIYAH NEGERI 1 PANDEGLANG', 0, 1, 'C');
        $this->SetFont('Arial', '', 9);
        $this->Cell(0, 4, 'Jl. Raya Labuan Km. 5,7 Palurahan, Kaduhejo, Pandeglang - Banten 42253', 0, 1, 'C');
        $this->Cell(0, 4, 'Website: https://mtsn1pandeglang.sch.id | Email: adm@mtsn1pandeglang.sch.id', 0, 1, 'C');

        $this->SetLineWidth(0.5);
        $this->Line(10, 39, 200, 39);
        $this->SetLineWidth(0.2);
        $this->Line(10, 40, 200, 40);
        $this->Ln(6);
    }

    function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, 'Hal ' . $this->PageNo() . '/{nb} | Dicetak: ' . date('d/m/Y H:i') . ' WIB', 0, 0, 'C');
    }

    function Row($data, $fill = false)
    {
        $nb = 0;
        for ($i = 0; $i < count($data); $i++)
            $nb = max($nb, $this->NbLines($this->widths[$i], $data[$i]));

        $h = 5 * $nb;
        $this->CheckPageBreak($h);

        for ($i = 0; $i < count($data); $i++) {
            $w = $this->widths[$i];
            $a = isset($this->aligns[$i]) ? $this->aligns[$i] : 'L';
            $x = $this->GetX();
            $y = $this->GetY();
            $this->Rect($x, $y, $w, $h, $fill ? 'DF' : 'D');
            $this->MultiCell($w, 5, $data[$i], 0, $a);
            $this->SetXY($x + $w, $y);
        }
        $this->Ln($h);
    }

    function CheckPageBreak($h)
    {
        if ($this->GetY() + $h > $this->PageBreakTrigger) {
            $this->AddPage($this->CurOrientation);
            if ($this->isPrintingTable && is_callable($this->tableHeaderCallback)) {
                call_user_func($this->tableHeaderCallback);
            }
        }
    }

    function NbLines($w, $txt)
    {
        $cw = &$this->CurrentFont['cw'];
        if ($w == 0) $w = $this->w - $this->rMargin - $this->x;
        $wmax = ($w - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $s = str_replace("\r", '', $txt);
        $nb = strlen($s);
        if ($nb > 0 && $s[$nb - 1] == "\n") $nb--;
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $nl = 1;
        while ($i < $nb) {
            $c = $s[$i];
            if ($c == "\n") {
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
                continue;
            }
            if ($c == ' ') $sep = $i;
            $l += $cw[$c];
            if ($l > $wmax) {
                if ($sep == -1) {
                    if ($i == $j) $i++;
                } else $i = $sep + 1;
                $sep = -1;
                $j = $i;
                $l = 0;
                $nl++;
            } else $i++;
        }
        return $nl;
    }
}

try {
    $pdf = new PDF();
    $pdf->AliasNbPages();
    $pdf->SetMargins(10, 10, 10);
    $pdf->SetAutoPageBreak(false);
    $pdf->setPageBreakTrigger(277);
    $pdf->AddPage();

    // Filter query
    $whereClause = "WHERE MONTH(created_at) = :month AND YEAR(created_at) = :year";
    $params = [':month' => $month, ':year' => $year];

    if ($status !== 'all') {
        $whereClause .= " AND status = :status";
        $params[':status'] = $status;
    }

    // Stats
    $totalQuery = $pdo->prepare("SELECT COUNT(*) FROM pengaduan $whereClause");
    $totalQuery->execute($params);
    $totalPengaduan = $totalQuery->fetchColumn();

    $menunggu = $pdo->prepare("SELECT COUNT(*) FROM pengaduan $whereClause AND status = 'Menunggu'");
    $menunggu->execute($params);
    $jmlMenunggu = $menunggu->fetchColumn();

    $proses = $pdo->prepare("SELECT COUNT(*) FROM pengaduan $whereClause AND status = 'Proses'");
    $proses->execute($params);
    $jmlProses = $proses->fetchColumn();

    $selesai = $pdo->prepare("SELECT COUNT(*) FROM pengaduan $whereClause AND status = 'Selesai'");
    $selesai->execute($params);
    $jmlSelesai = $selesai->fetchColumn();

    // Header
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(0, 6, 'LAPORAN PENGADUAN MASYARAKAT', 0, 1, 'C');
    $pdf->SetFont('Arial', '', 10);
    $pdf->Cell(0, 5, 'Periode: ' . $periodeText, 0, 1, 'C');
    if ($status !== 'all') {
        $pdf->Cell(0, 5, 'Status: ' . strtoupper($status), 0, 1, 'C');
    }
    $pdf->Ln(5);

    // Statistik
    $pdf->SetFont('Arial', 'B', 9);
    $pdf->SetFillColor(230, 230, 230);
    $pdf->Cell(190, 7, ' RINGKASAN STATISTIK', 1, 1, 'L', true);

    $pdf->SetFont('Arial', '', 9);
    $pdf->SetFillColor(250, 250, 250);
    $wLabel = 95;
    $wValue = 95;

    $pdf->Cell($wLabel, 7, ' Total Pengaduan', 1, 0, 'L', true);
    $pdf->Cell($wValue, 7, ' ' . $totalPengaduan . ' Pengaduan', 1, 1, 'L');

    $pdf->Cell($wLabel, 7, ' Status Menunggu', 1, 0, 'L', true);
    $pdf->Cell($wValue, 7, ' ' . $jmlMenunggu . ' Pengaduan', 1, 1, 'L');

    $pdf->Cell($wLabel, 7, ' Status Proses', 1, 0, 'L', true);
    $pdf->Cell($wValue, 7, ' ' . $jmlProses . ' Pengaduan', 1, 1, 'L');

    $pdf->Cell($wLabel, 7, ' Status Selesai', 1, 0, 'L', true);
    $pdf->Cell($wValue, 7, ' ' . $jmlSelesai . ' Pengaduan', 1, 1, 'L');

    $pdf->Ln(5);

    // Table Header Function
    $drawHeader = function () use ($pdf) {
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->SetFillColor(0, 120, 215);
        $pdf->SetTextColor(255);
        $pdf->Cell(8, 7, 'No', 1, 0, 'C', true);
        $pdf->Cell(28, 7, 'Tanggal', 1, 0, 'C', true);
        $pdf->Cell(35, 7, 'Nama', 1, 0, 'L', true);
        $pdf->Cell(25, 7, 'Kategori', 1, 0, 'C', true);
        $pdf->Cell(40, 7, 'Judul', 1, 0, 'L', true);
        $pdf->Cell(20, 7, 'Status', 1, 0, 'C', true);
        $pdf->Cell(34, 7, 'Tanggapan', 1, 1, 'L', true);
        $pdf->SetTextColor(0);
        $pdf->SetFont('Arial', '', 7);
    };

    $pdf->SetFont('Arial', 'B', 10);
    $pdf->Cell(0, 7, 'DETAIL PENGADUAN', 0, 1, 'L');

    $pdf->SetWidths([8, 28, 35, 25, 40, 20, 34]);
    $pdf->SetAligns(['C', 'C', 'L', 'C', 'L', 'C', 'L']);
    $drawHeader();
    $pdf->SetTableHeaderCallback($drawHeader);
    $pdf->isPrintingTable = true;

    $stmt = $pdo->prepare("SELECT * FROM pengaduan $whereClause ORDER BY created_at DESC");
    $stmt->execute($params);

    $no = 1;
    $found = false;
    while ($row = $stmt->fetch()) {
        $found = true;
        $pdf->Row([
            $no++,
            formatFullTime($row['created_at']),
            $row['nama'] . "\n" . $row['email'],
            $row['kategori'],
            $row['judul'],
            $row['status'],
            $row['tanggapan'] ?: '-'
        ]);
    }

    $pdf->isPrintingTable = false;
    if (!$found) {
        $pdf->Cell(190, 8, 'Tidak ada data pada periode ini.', 1, 1, 'C');
    }

    $pdf->Ln(8);

    // Tanda Tangan
    $path = '../images/instansi/';
    $tglCetak = getIndonesianDate();
    $qrSize = 18;

    $pdf->Cell(95, 5, '', 0, 0);
    $pdf->Cell(95, 5, 'Pandeglang, ' . $tglCetak, 0, 1, 'C');
    $pdf->Ln(5);

    $pdf->Cell(95, 5, 'Kepala Tata Usaha,', 0, 0, 'C');
    $pdf->Cell(95, 5, 'Koordinator Tim Pusdatin,', 0, 1, 'C');

    $yImage = $pdf->GetY() + 1;
    if (file_exists($path . 'tte-kepala-tata-usaha.png'))
        $pdf->Image($path . 'tte-kepala-tata-usaha.png', 46, $yImage, $qrSize);
    if (file_exists($path . 'tte-koordinator-tim-pusdatin.png'))
        $pdf->Image($path . 'tte-koordinator-tim-pusdatin.png', 146, $yImage, $qrSize);

    $pdf->SetY($yImage + 19);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(95, 5, "UMAR MU'TAMAR, S.Ag.", 0, 0, 'C');
    $pdf->Cell(95, 5, 'YAHYA ZULFIKRI', 0, 1, 'C');

    $pdf->SetFont('Arial', '', 10);
    $pdf->Cell(95, 4, 'NIP. 196903061998031004', 0, 0, 'C');
    $pdf->Cell(95, 4, 'NIP. 200001142025211016', 0, 1, 'C');

    $pdf->Output('I', 'Laporan_Pengaduan_' . $month . '_' . $year . '.pdf');
} catch (Exception $e) {
    die("PDF Error: " . $e->getMessage());
}

```

---

### File: `./public/api/stats.php`

```
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
session_start();
require_once __DIR__ . '/config.php';

function getClientIP()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return $_SERVER['HTTP_X_FORWARDED_FOR'];
    return $_SERVER['REMOTE_ADDR'];
}

try {
    $pdo = getDBConnection();
    initializeTables($pdo);

    $action = $_GET['action'] ?? '';
    $slug   = $_GET['slug'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];

    $response = ['value' => 0];

    if ($action === 'visit') {
        if ($method === 'POST') {
            if (!isset($_SESSION['has_visited_site'])) {
                $pdo->exec("UPDATE global_stats SET value = value + 1 WHERE `key` = 'site_visits'");

                $ip = getClientIP();
                $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

                $stmt = $pdo->prepare("INSERT INTO site_visit_logs (ip_address, user_agent) VALUES (:ip, :ua)");
                $stmt->execute([':ip' => $ip, ':ua' => $ua]);

                $_SESSION['has_visited_site'] = true;
            }
        }
        $result = $pdo->query("SELECT value FROM global_stats WHERE `key` = 'site_visits'")->fetchColumn();
        $response['value'] = $result ? $result : 0;
    } elseif ($action === 'view' && !empty($slug)) {
        $slug = preg_replace('/[^a-zA-Z0-9_-]/', '', $slug);
        $sessionKey = 'viewed_' . $slug;
        if ($method === 'POST') {
            if (!isset($_SESSION[$sessionKey])) {
                $stmt = $pdo->prepare("INSERT INTO post_stats (slug, views) VALUES (:slug, 1) ON DUPLICATE KEY UPDATE views = views + 1");
                $stmt->execute([':slug' => $slug]);
                $_SESSION[$sessionKey] = true;
            }
        }
        $stmt = $pdo->prepare("SELECT views FROM post_stats WHERE slug = :slug");
        $stmt->execute([':slug' => $slug]);
        $row = $stmt->fetch();
        $response['value'] = $row ? $row['views'] : 0;
    }
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

```

---

### File: `./public/api/survey.php`

```
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
require_once __DIR__ . '/config.php';

function getClientIP()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return $_SERVER['HTTP_X_FORWARDED_FOR'];
    return $_SERVER['REMOTE_ADDR'];
}

try {
    $pdo = getDBConnection();
    initializeTables($pdo);
    $ip_address = getClientIP();

    function getSurveyStats($pdo)
    {
        $stmt = $pdo->query("SELECT
            AVG(score_zi) as zi,
            AVG(score_service) as service,
            AVG(score_academic) as academic,
            AVG(score_facilities) as facilities,
            AVG(score_management) as management,
            AVG(score_culture) as culture,
            COUNT(*) as total
            FROM survey_responses");
        $row = $stmt->fetch();

        return [
            'zi' => round($row['zi'] ?? 0, 2),
            'service' => round($row['service'] ?? 0, 2),
            'academic' => round($row['academic'] ?? 0, 2),
            'facilities' => round($row['facilities'] ?? 0, 2),
            'management' => round($row['management'] ?? 0, 2),
            'culture' => round($row['culture'] ?? 0, 2),
            'total' => $row['total'] ?? 0
        ];
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $checkIp = $pdo->prepare("SELECT id FROM survey_responses WHERE ip_address = :ip");
        $checkIp->execute([':ip' => $ip_address]);
        if ($checkIp->fetch()) {
            echo json_encode(['status' => 'error', 'message' => 'Anda sudah mengisi survei ini.']);
            exit;
        }

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['answers'])) throw new Exception("Data jawaban kosong.");

        $name = htmlspecialchars(strip_tags($data['profile']['name'] ?? 'Anonim'));
        $role = htmlspecialchars(strip_tags($data['profile']['role'] ?? 'Umum'));
        $feedback = htmlspecialchars(strip_tags($data['feedback'] ?? ''));

        $s = $data['scores'] ?? [];
        $details = json_encode($data['answers']);

        $stmt = $pdo->prepare("INSERT INTO survey_responses
            (respondent_name, respondent_role, score_zi, score_service, score_academic, score_facilities, score_management, score_culture, feedback, details_json, ip_address)
            VALUES (:name, :role, :zi, :service, :acd, :fac, :mgt, :cul, :feedback, :details, :ip)");

        $stmt->execute([
            ':name' => $name,
            ':role' => $role,
            ':zi' => $s['zi'] ?? 0,
            ':service' => $s['service'] ?? 0,
            ':acd' => $s['academic'] ?? 0,
            ':fac' => $s['facilities'] ?? 0,
            ':mgt' => $s['management'] ?? 0,
            ':cul' => $s['culture'] ?? 0,
            ':feedback' => $feedback,
            ':details' => $details,
            ':ip' => $ip_address
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Survei berhasil dikirim.', 'stats' => getSurveyStats($pdo)]);
    } else {
        $checkIp = $pdo->prepare("SELECT id FROM survey_responses WHERE ip_address = :ip");
        $checkIp->execute([':ip' => $ip_address]);
        $hasSubmitted = $checkIp->fetch() ? true : false;
        echo json_encode(['status' => 'ready', 'has_submitted' => $hasSubmitted, 'stats' => getSurveyStats($pdo)]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

### File: `./public/api/users.php`

```
<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['user_role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access Denied: Super Admin Only']);
    exit;
}

try {
    $pdo = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, email, name, picture, role, status, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $users]);
    } elseif ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'update') {
        $id = (int)$data['id'];
        $role = $data['role'];
        $status = $data['status'];

        if ($id === $_SESSION['user_id'] && ($status !== 'active' || $role !== 'super_admin')) {
            throw new Exception("Anda tidak bisa menurunkan hak akses atau menonaktifkan akun sendiri.");
        }

        $stmt = $pdo->prepare("UPDATE users SET role = :role, status = :status WHERE id = :id");
        $stmt->execute([':role' => $role, ':status' => $status, ':id' => $id]);

        echo json_encode(['status' => 'success', 'message' => 'User berhasil diperbarui']);
    } elseif ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete') {
        $id = (int)$data['id'];

        if ($id === $_SESSION['user_id']) {
            throw new Exception("Tidak bisa menghapus akun sendiri.");
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['status' => 'success', 'message' => 'User dihapus permanen.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

## Direktori: ROOT

### File: `./.env.example`

```
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

# Google Auth
PUBLIC_GOOGLE_CLIENT_ID=
ADMIN_EMAIL=
```

---

### File: `./astro.config.mjs`

```javascript
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import sharp from "sharp";
import config from "./src/config/config.json";
import AstroPWA from "@vite-pwa/astro";

export default defineConfig({
  site: config.site.base_url
    ? config.site.base_url
    : "https://mtsn1pandeglang.sch.id",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  image: { service: sharp() },
  vite: { plugins: [tailwindcss()] },
  integrations: [
    react(),
    sitemap(),
    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Accordion",
        "@/shortcodes/Notice",
        "@/shortcodes/Video",
        "@/shortcodes/Youtube",
        "@/shortcodes/Tabs",
        "@/shortcodes/Tab",
      ],
    }),
    mdx(),
    AstroPWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Madrasah Tsanawiyah Negeri 1 Pandeglang",
        short_name: "MTs Negeri 1 Pandeglang",
        description: "Mandiri, Takwa, Peduli Lingkungan, Prestasi.",
        theme_color: "#00dc82",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/images/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/images/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/",
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}",
        ],
        maximumFileSizeToCacheInBytes: 60 * 1024 * 1024,
        globIgnores: ["**/videos/artikel/plp-kkn/**"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: { theme: "one-dark-pro", wrap: true },
    extendDefaultPlugins: true,
  },
});

```

---

### File: `./deploy.sh`

```bash
#!/bin/bash

# --- KONFIGURASI ---
MAX_RETRIES=3
DELAY=5
PROJECT_DIR="/var/www/mtsn1pandeglang.sch.id"
BRANCH="static"
LOG_FILE="/var/log/web_build.log"

sudo chown -R $USER:$USER /var/www/mtsn1pandeglang.sch.id

# Fungsi Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== MEMULAI SMART DEPLOYMENT ==="

cd $PROJECT_DIR || exit

# Setup Git
git config --global --add safe.directory $PROJECT_DIR
git config user.email "zulfikriyahya@gmail.com"
git config user.name "Server AutoDeploy"

# Stash & Pull
log "--- Menyimpan perubahan lokal ---"
git stash save "AutoSave before Pull"

log "--- Pulling dari GitHub ---"
git pull origin $BRANCH --no-edit

log "--- Mengembalikan perubahan lokal ---"
git stash pop

# Push jika ada konten baru
if [[ -n $(git status -s) ]]; then
    log "--- Sync konten ke GitHub ---"
    git add .
    git commit -m "AutoSync: Konten baru [Skip CI]"
    git push origin $BRANCH
fi

# Build
log "--- Installing Dependencies ---"
yarn install --check-files || { log "Yarn install gagal!"; exit 1; }

rm -rf dist/
ATTEMPT=1
SUCCESS=0

while [ $ATTEMPT -le $MAX_RETRIES ]; do
    log "--- Build Attempt $ATTEMPT of $MAX_RETRIES ---"
    yarn build
    if [ $? -eq 0 ]; then
        SUCCESS=1
        break
    else
        sleep $DELAY
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

if [ $SUCCESS -eq 0 ]; then
    log "DEPLOYMENT GAGAL!"
    exit 1
fi

# Database
DB_FILE="$PROJECT_DIR/database.db"
[ ! -f "$DB_FILE" ] && touch "$DB_FILE" && chmod 664 "$DB_FILE"

sudo chown -R www-data:www-data /var/www/mtsn1pandeglang.sch.id
sudo chown $USER:$USER /var/www/mtsn1pandeglang.sch.id/deploy.sh
chmod +x /var/www/mtsn1pandeglang.sch.id/deploy.sh

log "=== DEPLOYMENT SUKSES! ==="
```

---

### File: `./package.json`

```json
{
  "name": "mtsn1pandeglang",
  "version": "0.0.1",
  "description": "Mandiri, Takwa, Peduli Lingkungan, Prestasi",
  "author": "Yahya Zulfikri",
  "license": "MIT",
  "private": true,
  "packageManager": "yarn@1.22.22",
  "type": "module",
  "scripts": {
    "dev": "yarn generate-json && astro dev",
    "build": "yarn generate-json && astro build",
    "preview": "astro preview",
    "check": "astro check",
    "format": "prettier -w ./src",
    "generate-json": "node scripts/jsonGenerator.js",
    "remove-darkmode": "node scripts/removeDarkmode.js && yarn format"
  },
  "dependencies": {
    "@astrojs/check": "0.9.6",
    "@astrojs/mdx": "4.3.13",
    "@astrojs/node": "^9.5.1",
    "@astrojs/react": "4.4.2",
    "@astrojs/sitemap": "3.6.0",
    "@digi4care/astro-google-tagmanager": "^1.6.0",
    "@giscus/react": "^3.1.0",
    "@justinribeiro/lite-youtube": "^1.8.2",
    "astro": "5.16.6",
    "astro-auto-import": "^0.4.5",
    "astro-font": "^1.1.0",
    "better-sqlite3": "^12.6.0",
    "chart.js": "^4.5.1",
    "date-fns": "^4.1.0",
    "github-slugger": "^2.0.0",
    "gray-matter": "^4.0.3",
    "gsap": "^3.14.2",
    "lenis": "^1.3.17",
    "marked": "^16.4.0",
    "prop-types": "^15.8.1",
    "react": "^19.2.0",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "^19.2.0",
    "react-icons": "^5.5.0",
    "remark-collapse": "^0.1.2",
    "remark-toc": "^9.0.0",
    "swiper": "^12.0.2",
    "vite": "^7.1.9"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.10",
    "@tailwindcss/typography": "^0.5.19",
    "@tailwindcss/vite": "^4.1.14",
    "@types/better-sqlite3": "^7.6.13",
    "@types/node": "22.15.3",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "@vite-pwa/astro": "^1.1.1",
    "eslint": "^9.37.0",
    "prettier": "^3.6.2",
    "prettier-plugin-astro": "^0.14.1",
    "prettier-plugin-tailwindcss": "^0.7.0",
    "sharp": "0.34.4",
    "tailwindcss": "^4.1.14",
    "typescript": "^5.9.3",
    "vite-plugin-pwa": "^1.1.0",
    "workbox-build": "^7.3.0",
    "workbox-window": "^7.3.0"
  }
}

```

---

### File: `./tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "target": "es6",
    "allowJs": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "isolatedModules": true,
    "incremental": true,
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@/components/*": ["./src/layouts/components/*"],
      "@/shortcodes/*": ["./src/layouts/shortcodes/*"],
      "@/helpers/*": ["./src/layouts/helpers/*"],
      "@/partials/*": ["./src/layouts/partials/*"],
      "@/*": ["./src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*.ts", "**/*.tsx", "**/*.astro"],
  "exclude": ["node_modules", "dist"]
}

```

---





saya ingin kamu menyempurnakan fitur pengaduan dengan :
- import data pengaduan dan tindak lanjut pengajuan,
- print pdf laporan pengaduan dan tindak lanjut seperti pdf laporan statistik
- admin dashboard. 