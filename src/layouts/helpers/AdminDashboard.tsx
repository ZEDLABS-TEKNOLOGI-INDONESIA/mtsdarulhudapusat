import { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  email: string;
  name: string;
  picture: string;
  role: string;
  status: string;
}

interface Pengaduan {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  kategori: string;
  judul: string;
  isi_pengaduan: string;
  status: string;
  tanggapan: string | null;
  ip_address: string;
  created_at: string;
  updated_at: string;
}

interface PengaduanStats {
  total: number;
  menunggu: number;
  diproses: number;
  selesai: number;
  ditolak: number;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats states
  const [stats, setStats] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [visitsData, setVisitsData] = useState<any>(null);
  const [ratingData, setRatingData] = useState<any>(null);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [surveyAvgData, setSurveyAvgData] = useState<any>(null);
  
  // Feedback states
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState({ month: '', year: '', rating: '' });
  
  // Survey states
  const [surveys, setSurveys] = useState<any[]>([]);
  const [surveyFilter, setSurveyFilter] = useState({ month: '', year: '', category: '' });
  
  // Visits states
  const [visits, setVisits] = useState<any[]>([]);
  const [visitsFilter, setVisitsFilter] = useState({ month: '', year: '' });
  
  // Posts states
  const [posts, setPosts] = useState<any[]>([]);
  const [postsFilter, setPostsFilter] = useState({ month: '', year: '' });
  
  // Pengaduan states
  const [pengaduans, setPengaduans] = useState<Pengaduan[]>([]);
  const [pengaduanStats, setPengaduanStats] = useState<PengaduanStats | null>(null);
  const [pengaduanFilter, setPengaduanFilter] = useState({ month: '', year: '', status: '', kategori: '' });
  const [selectedPengaduan, setSelectedPengaduan] = useState<Pengaduan | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ status: '', tanggapan: '' });
  
  // Users states
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({ email: '', name: '', role: 'user', status: 'active' });
  
  // Content states
  const [artikelFiles, setArtikelFiles] = useState<any[]>([]);
  const [gambarFiles, setGambarFiles] = useState<any[]>([]);
  const [videoFiles, setVideoFiles] = useState<any[]>([]);
  const [uploadType, setUploadType] = useState<'artikel' | 'gambar' | 'video'>('artikel');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Import modal states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'feedback' | 'survey' | 'visits' | 'pengaduan'>('feedback');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth.php?action=check');
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.role === 'operator' || data.user.role === 'super_admin') {
          loadDashboardData();
        }
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin.php?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setActivityData(data.activityData);
        setVisitsData(data.visitsData);
        setRatingData(data.ratingData);
        setSurveyData(data.surveyData);
        setSurveyAvgData(data.surveyAvgData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const params = new URLSearchParams({
        action: 'feedback',
        ...feedbackFilter
      });
      const response = await fetch(`/api/admin.php?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (error) {
      console.error('Failed to load feedbacks:', error);
    }
  };

  const loadSurveys = async () => {
    try {
      const params = new URLSearchParams({
        action: 'survey',
        ...surveyFilter
      });
      const response = await fetch(`/api/admin.php?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSurveys(data.data);
      }
    } catch (error) {
      console.error('Failed to load surveys:', error);
    }
  };

  const loadVisits = async () => {
    try {
      const params = new URLSearchParams({
        action: 'visits',
        ...visitsFilter
      });
      const response = await fetch(`/api/admin.php?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setVisits(data.data);
      }
    } catch (error) {
      console.error('Failed to load visits:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const params = new URLSearchParams({
        action: 'posts',
        ...postsFilter
      });
      const response = await fetch(`/api/admin.php?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const loadPengaduans = async () => {
    try {
      const params = new URLSearchParams({
        action: 'list',
        ...pengaduanFilter
      });
      const response = await fetch(`/api/admin_pengaduan.php?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPengaduans(data.data);
        setPengaduanStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load pengaduans:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin.php?action=users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadContentFiles = async () => {
    try {
      const response = await fetch('/api/admin.php?action=content_list');
      const data = await response.json();
      
      if (data.success) {
        setArtikelFiles(data.artikel || []);
        setGambarFiles(data.gambar || []);
        setVideoFiles(data.video || []);
      }
    } catch (error) {
      console.error('Failed to load content files:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'feedback') loadFeedbacks();
    else if (activeTab === 'surveys') loadSurveys();
    else if (activeTab === 'visits') loadVisits();
    else if (activeTab === 'posts') loadPosts();
    else if (activeTab === 'pengaduan') loadPengaduans();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'content') loadContentFiles();
  }, [activeTab, feedbackFilter, surveyFilter, visitsFilter, postsFilter, pengaduanFilter]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth.php?action=logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleExport = async (type: string) => {
    try {
      let params: any = { action: 'export', type };
      
      if (type === 'feedback') params = { ...params, ...feedbackFilter };
      else if (type === 'survey') params = { ...params, ...surveyFilter };
      else if (type === 'visits') params = { ...params, ...visitsFilter };
      else if (type === 'posts') params = { ...params, ...postsFilter };
      else if (type === 'pengaduan') params = { ...params, ...pengaduanFilter };
      
      const queryString = new URLSearchParams(params).toString();
      const endpoint = type === 'pengaduan' ? '/api/admin_pengaduan.php' : '/api/admin.php';
      window.open(`${endpoint}?${queryString}`, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePrint = (type: string) => {
    let params: any = {};
    
    if (type === 'feedback') params = { ...feedbackFilter };
    else if (type === 'survey') params = { ...surveyFilter };
    else if (type === 'visits') params = { ...visitsFilter };
    else if (type === 'posts') params = { ...postsFilter };
    else if (type === 'pengaduan') params = { ...pengaduanFilter };
    
    const queryString = new URLSearchParams(params).toString();
    const endpoint = type === 'pengaduan' ? '/api/print_pengaduan_pdf.php' : '/api/print_pdf.php';
    window.open(`${endpoint}?type=${type}&${queryString}`, '_blank');
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Pilih file CSV terlebih dahulu');
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('action', 'import');

    try {
      const endpoint = importType === 'pengaduan' ? '/api/import_pengaduan.php' : '/api/import.php';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Berhasil import ${data.imported || 0} data`);
        setImportModalOpen(false);
        setImportFile(null);
        
        if (importType === 'feedback') loadFeedbacks();
        else if (importType === 'survey') loadSurveys();
        else if (importType === 'visits') loadVisits();
        else if (importType === 'pengaduan') loadPengaduans();
      } else {
        alert('Import gagal: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import gagal');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (type: string) => {
    const endpoint = type === 'pengaduan' ? '/api/import_pengaduan.php' : '/api/import.php';
    window.open(`${endpoint}?action=template&type=${type}`, '_blank');
  };

  const handleDeleteFeedback = async (id: number) => {
    if (!confirm('Hapus feedback ini?')) return;
    
    try {
      const response = await fetch('/api/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_feedback', id })
      });
      
      const data = await response.json();
      if (data.success) {
        loadFeedbacks();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDeleteSurvey = async (id: number) => {
    if (!confirm('Hapus survey ini?')) return;
    
    try {
      const response = await fetch('/api/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_survey', id })
      });
      
      const data = await response.json();
      if (data.success) {
        loadSurveys();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDeletePengaduan = async (id: number) => {
    if (user?.role !== 'super_admin') {
      alert('Hanya Super Admin yang bisa menghapus pengaduan');
      return;
    }
    
    if (!confirm('Hapus pengaduan ini?')) return;
    
    try {
      const response = await fetch('/api/admin_pengaduan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      
      const data = await response.json();
      if (data.success) {
        loadPengaduans();
      } else {
        alert('Gagal menghapus: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Gagal menghapus pengaduan');
    }
  };

  const openEditPengaduan = (pengaduan: Pengaduan) => {
    setSelectedPengaduan(pengaduan);
    setEditForm({
      status: pengaduan.status,
      tanggapan: pengaduan.tanggapan || ''
    });
    setEditModalOpen(true);
  };

  const handleUpdatePengaduan = async () => {
    if (!selectedPengaduan) return;
    
    try {
      const response = await fetch('/api/admin_pengaduan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: selectedPengaduan.id,
          status: editForm.status,
          tanggapan: editForm.tanggapan
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setEditModalOpen(false);
        loadPengaduans();
        alert('Pengaduan berhasil diupdate');
      } else {
        alert('Gagal update: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Gagal update pengaduan');
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const action = editingUser ? 'update_user' : 'create_user';
      const payload = editingUser 
        ? { action, id: editingUser.id, ...userFormData }
        : { action, ...userFormData };
      
      const response = await fetch('/api/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        setEditingUser(null);
        setUserFormData({ email: '', name: '', role: 'user', status: 'active' });
        loadUsers();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('User operation failed:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    
    try {
      const response = await fetch('/api/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', id })
      });
      
      const data = await response.json();
      if (data.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', uploadType);

    try {
      const response = await fetch('/api/admin.php?action=upload_content', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Upload berhasil');
        setSelectedFile(null);
        loadContentFiles();
      } else {
        alert('Upload gagal: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteContent = async (filename: string, type: string) => {
    if (!confirm(`Hapus ${filename}?`)) return;
    
    try {
      const response = await fetch('/api/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_content', filename, type })
      });
      
      const data = await response.json();
      if (data.success) {
        loadContentFiles();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleRebuildSite = async () => {
    if (!confirm('Rebuild website? Proses ini akan memakan waktu beberapa menit.')) return;
    
    try {
      const response = await fetch('/api/admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rebuild_site' })
      });
      
      const data = await response.json();
      alert(data.message || 'Rebuild complete');
    } catch (error) {
      console.error('Rebuild failed:', error);
      alert('Rebuild failed');
    }
  };

  const formatDateIndo = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Oct', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getMonthFromDate = (dateString: string) => {
    return new Date(dateString).getMonth() + 1;
  };

  const getYearFromDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'operator' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <button onClick={handleLogout} className="bg-blue-600 text-white px-4 py-2 rounded">
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">{user.name} ({user.role})</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {['overview', 'content', 'posts', 'visits', 'feedback', 'surveys', 'pengaduan', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'content' && 'Content Manager'}
                {tab === 'posts' && 'Posts Stats'}
                {tab === 'visits' && 'Site Visits'}
                {tab === 'feedback' && 'Feedback'}
                {tab === 'surveys' && 'Surveys'}
                {tab === 'pengaduan' && 'Pengaduan'}
                {tab === 'users' && 'Users'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Posts</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPosts || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Visits</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVisits || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Feedback</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFeedback || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Survey</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSurvey || 0}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activityData && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Activity Trend (30 Days)</h3>
                  <Line data={activityData} />
                </div>
              )}
              
              {visitsData && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Site Visits (7 Days)</h3>
                  <Line data={visitsData} />
                </div>
              )}
              
              {ratingData && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Feedback Rating Distribution</h3>
                  <Pie data={ratingData} />
                </div>
              )}
              
              {surveyData && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Survey Score Distribution</h3>
                  <Pie data={surveyData} />
                </div>
              )}
            </div>

            {surveyAvgData && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Average Survey Scores by Category</h3>
                <Bar data={surveyAvgData} />
              </div>
            )}
          </div>
        )}

        {/* Content Manager Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="artikel">Artikel (.md)</option>
                    <option value="gambar">Gambar (.jpg, .png, .gif)</option>
                    <option value="video">Video (.mp4, .webm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full border rounded px-3 py-2"
                    accept={
                      uploadType === 'artikel' ? '.md' :
                      uploadType === 'gambar' ? 'image/*' :
                      'video/*'
                    }
                  />
                </div>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>

            {/* File Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Artikel */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Artikel Files</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {artikelFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm truncate">{file}</span>
                      <button
                        onClick={() => handleDeleteContent(file, 'artikel')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {artikelFiles.length === 0 && (
                    <p className="text-gray-500 text-sm">No files</p>
                  )}
                </div>
              </div>

              {/* Gambar */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Gambar Files</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {gambarFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm truncate">{file}</span>
                      <button
                        onClick={() => handleDeleteContent(file, 'gambar')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {gambarFiles.length === 0 && (
                    <p className="text-gray-500 text-sm">No files</p>
                  )}
                </div>
              </div>

              {/* Video */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Video Files</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {videoFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm truncate">{file}</span>
                      <button
                        onClick={() => handleDeleteContent(file, 'video')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {videoFiles.length === 0 && (
                    <p className="text-gray-500 text-sm">No files</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Rebuild Website</h3>
              <p className="text-gray-600 mb-4">
                Rebuild the Astro static site to apply content changes. This may take a few minutes.
              </p>
              <button
                onClick={handleRebuildSite}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Rebuild Site
              </button>
            </div>
          </div>
        )}

        {/* Posts Stats Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Posts Statistics</h2>
                <div className="flex gap-2">
                  <select
                    value={postsFilter.month}
                    onChange={(e) => setPostsFilter({ ...postsFilter, month: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Months</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={postsFilter.year}
                    onChange={(e) => setPostsFilter({ ...postsFilter, year: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Years</option>
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleExport('posts')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handlePrint('posts')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Print PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{post.slug}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{post.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Site Visits Log</h2>
                <div className="flex gap-2">
                  <select
                    value={visitsFilter.month}
                    onChange={(e) => setVisitsFilter({ ...visitsFilter, month: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Months</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={visitsFilter.year}
                    onChange={(e) => setVisitsFilter({ ...visitsFilter, year: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Years</option>
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setImportType('visits');
                      setImportModalOpen(true);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                  >
                    Import CSV
                  </button>
                  <button
                    onClick={() => handleExport('visits')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handlePrint('visits')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Print PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visits.map((visit, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{visit.ip_address}</td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">{visit.user_agent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateIndo(visit.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Feedback Data</h2>
                <div className="flex gap-2">
                  <select
                    value={feedbackFilter.month}
                    onChange={(e) => setFeedbackFilter({ ...feedbackFilter, month: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Months</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={feedbackFilter.year}
                    onChange={(e) => setFeedbackFilter({ ...feedbackFilter, year: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Years</option>
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    value={feedbackFilter.rating}
                    onChange={(e) => setFeedbackFilter({ ...feedbackFilter, rating: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Ratings</option>
                    {[1,2,3,4,5].map(r => (
                      <option key={r} value={r}>{r} ★</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setImportType('feedback');
                      setImportModalOpen(true);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                  >
                    Import CSV
                  </button>
                  <button
                    onClick={() => handleExport('feedback')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handlePrint('feedback')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Print PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      {user.role === 'super_admin' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedbacks.map((fb) => (
                      <tr key={fb.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{fb.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{'★'.repeat(fb.rating)}</td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">{fb.message}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{fb.ip_address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateIndo(fb.created_at)}</td>
                        {user.role === 'super_admin' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteFeedback(fb.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Surveys Tab */}
        {activeTab === 'surveys' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Survey Responses</h2>
                <div className="flex gap-2">
                  <select
                    value={surveyFilter.month}
                    onChange={(e) => setSurveyFilter({ ...surveyFilter, month: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Months</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={surveyFilter.year}
                    onChange={(e) => setSurveyFilter({ ...surveyFilter, year: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Years</option>
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    value={surveyFilter.category}
                    onChange={(e) => setSurveyFilter({ ...surveyFilter, category: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="zi">Zona Integritas</option>
                    <option value="service">Pelayanan</option>
                    <option value="academic">Akademik</option>
                    <option value="facilities">Fasilitas</option>
                    <option value="management">Manajemen</option>
                    <option value="culture">Budaya</option>
                  </select>
                  <button
                    onClick={() => {
                      setImportType('survey');
                      setImportModalOpen(true);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                  >
                    Import CSV
                  </button>
                  <button
                    onClick={() => handleExport('survey')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handlePrint('survey')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Print PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ZI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facilities</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Management</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Culture</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      {user.role === 'super_admin' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {surveys.map((survey) => (
                      <tr key={survey.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{survey.respondent_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{survey.respondent_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{survey.score_zi}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{survey.score_service}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{survey.score_academic}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{survey.score_facilities}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{survey.score_management}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{survey.score_culture}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateIndo(survey.created_at)}</td>
                        {user.role === 'super_admin' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteSurvey(survey.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pengaduan Tab */}
        {activeTab === 'pengaduan' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {pengaduanStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm font-medium">Total Pengaduan</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{pengaduanStats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm font-medium">Menunggu</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{pengaduanStats.menunggu}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm font-medium">Diproses</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{pengaduanStats.diproses}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm font-medium">Selesai</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{pengaduanStats.selesai}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-gray-500 text-sm font-medium">Ditolak</h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">{pengaduanStats.ditolak}</p>
                </div>
              </div>
            )}

            {/* Status Chart */}
            {pengaduanStats && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Status Pengaduan</h3>
                <Pie
                  data={{
                    labels: ['Menunggu', 'Diproses', 'Selesai', 'Ditolak'],
                    datasets: [{
                      data: [
                        pengaduanStats.menunggu,
                        pengaduanStats.diproses,
                        pengaduanStats.selesai,
                        pengaduanStats.ditolak
                      ],
                      backgroundColor: ['#EAB308', '#3B82F6', '#10B981', '#EF4444']
                    }]
                  }}
                />
              </div>
            )}

            {/* Data Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Data Pengaduan</h2>
                <div className="flex gap-2">
                  <select
                    value={pengaduanFilter.month}
                    onChange={(e) => setPengaduanFilter({ ...pengaduanFilter, month: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Months</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={pengaduanFilter.year}
                    onChange={(e) => setPengaduanFilter({ ...pengaduanFilter, year: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Years</option>
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    value={pengaduanFilter.status}
                    onChange={(e) => setPengaduanFilter({ ...pengaduanFilter, status: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="menunggu">Menunggu</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                  <select
                    value={pengaduanFilter.kategori}
                    onChange={(e) => setPengaduanFilter({ ...pengaduanFilter, kategori: e.target.value })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Kategori</option>
                    <option value="Pelayanan">Pelayanan</option>
                    <option value="Fasilitas">Fasilitas</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Administrasi">Administrasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <button
                    onClick={() => {
                      setImportType('pengaduan');
                      setImportModalOpen(true);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                  >
                    Import CSV
                  </button>
                  <button
                    onClick={() => handleExport('pengaduan')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handlePrint('pengaduan')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Print PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelapor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pengaduans.map((p) => (
                      <tr key={p.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDateIndo(p.created_at)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div>{p.nama}</div>
                          <div className="text-gray-500 text-xs">{p.email}</div>
                          <div className="text-gray-500 text-xs">{p.telepon}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{p.kategori}</td>
                        <td className="px-6 py-4 text-sm max-w-xs">
                          <div className="font-medium">{p.judul}</div>
                          <div className="text-gray-500 text-xs truncate">{p.isi_pengaduan}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            p.status === 'menunggu' ? 'bg-yellow-100 text-yellow-800' :
                            p.status === 'diproses' ? 'bg-blue-100 text-blue-800' :
                            p.status === 'selesai' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openEditPengaduan(p)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Edit
                          </button>
                          {user.role === 'super_admin' && (
                            <button
                              onClick={() => handleDeletePengaduan(p.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && user.role === 'super_admin' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    disabled={!!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="operator">Operator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setUserFormData({ email: '', name: '', role: 'user', status: 'active' });
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Users List</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            u.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'operator' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserFormData({
                                email: u.email,
                                name: u.name,
                                role: u.role,
                                status: u.status
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Import {importType.toUpperCase()} Data</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Download template CSV terlebih dahulu, isi data, kemudian upload kembali.
                </p>
                <button
                  onClick={() => downloadTemplate(importType)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm w-full"
                >
                  Download Template CSV
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
                <button
                  onClick={() => {
                    setImportModalOpen(false);
                    setImportFile(null);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pengaduan Modal */}
      {editModalOpen && selectedPengaduan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Pengaduan</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">Detail Pengaduan:</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Nama:</span> {selectedPengaduan.nama}</p>
                  <p><span className="font-medium">Email:</span> {selectedPengaduan.email}</p>
                  <p><span className="font-medium">Telepon:</span> {selectedPengaduan.telepon}</p>
                  <p><span className="font-medium">Kategori:</span> {selectedPengaduan.kategori}</p>
                  <p><span className="font-medium">Judul:</span> {selectedPengaduan.judul}</p>
                  <p><span className="font-medium">Isi Pengaduan:</span></p>
                  <p className="whitespace-pre-wrap bg-white p-2 rounded">{selectedPengaduan.isi_pengaduan}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="menunggu">Menunggu</option>
                  <option value="diproses">Diproses</option>
                  <option value="selesai">Selesai</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggapan</label>
                <textarea
                  value={editForm.tanggapan}
                  onChange={(e) => setEditForm({ ...editForm, tanggapan: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  placeholder="Masukkan tanggapan terhadap pengaduan ini..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdatePengaduan}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;