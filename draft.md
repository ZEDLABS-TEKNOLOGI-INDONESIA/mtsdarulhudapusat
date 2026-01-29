
## Direktori: public

### File: `./public/api/admin.php`

```php
<?php
session_start();
date_default_timezone_set('Asia/Jakarta');
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}
$dbPath = __DIR__ . '/../../database.db';
try {
    if (!class_exists('SQLite3')) {
        throw new Exception("SQLite3 driver not installed.");
    }
    $db = new SQLite3($dbPath);
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
    function getSafeDailyActivity($db, $table, $days = 30)
    {
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $data[$date] = 0;
        }
        try {
            $check = $db->querySingle("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='$table'");
            if (!$check) return $data;
            $query = "SELECT substr(datetime(created_at, '+7 hours'), 1, 10) as date, COUNT(*) as count FROM $table WHERE created_at >= date('now', '-$days days', '-7 hours') GROUP BY date";
            $res = $db->query($query);
            if ($res) {
                while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
                    if (isset($data[$row['date']])) $data[$row['date']] = $row['count'];
                }
            }
        } catch (Exception $e) {
        }
        return $data;
    }
    if ($action === 'stats') {
        header('Content-Type: application/json');
        $visits = $db->querySingle("SELECT value FROM global_stats WHERE key = 'site_visits'") ?: 0;
        $total_posts = $db->querySingle("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='post_stats'") ? ($db->querySingle("SELECT COUNT(*) FROM post_stats") ?: 0) : 0;
        $total_feedback = $db->querySingle("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='feedback'") ? ($db->querySingle("SELECT COUNT(*) FROM feedback") ?: 0) : 0;
        $total_survey = $db->querySingle("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='survey_responses'") ? ($db->querySingle("SELECT COUNT(*) FROM survey_responses") ?: 0) : 0;
        $stars = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        if ($total_feedback > 0) {
            $resStar = $db->query("SELECT rating, COUNT(*) as count FROM feedback GROUP BY rating");
            while ($row = $resStar->fetchArray(SQLITE3_ASSOC)) $stars[$row['rating']] = $row['count'];
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
            $cols = [];
            $resCol = $db->query("PRAGMA table_info(survey_responses)");
            while ($rowC = $resCol->fetchArray(SQLITE3_ASSOC)) $cols[] = $rowC['name'];
            $selects = ["AVG(score_zi) as zi", "AVG(score_service) as service", "AVG(score_academic) as academic"];
            if (in_array('score_facilities', $cols)) $selects[] = "AVG(score_facilities) as facilities";
            if (in_array('score_management', $cols)) $selects[] = "AVG(score_management) as management";
            if (in_array('score_culture', $cols)) $selects[] = "AVG(score_culture) as culture";
            $sql = "SELECT " . implode(', ', $selects) . " FROM survey_responses";
            $avgQuery = $db->querySingle($sql, true);
            if ($avgQuery) {
                $survey_avg['zi'] = round($avgQuery['zi'] ?? 0, 2);
                $survey_avg['service'] = round($avgQuery['service'] ?? 0, 2);
                $survey_avg['academic'] = round($avgQuery['academic'] ?? 0, 2);
                $survey_avg['facilities'] = round($avgQuery['facilities'] ?? 0, 2);
                $survey_avg['management'] = round($avgQuery['management'] ?? 0, 2);
                $survey_avg['culture'] = round($avgQuery['culture'] ?? 0, 2);
            }
        }
        $activity_feedback = getSafeDailyActivity($db, 'feedback');
        $activity_survey = getSafeDailyActivity($db, 'survey_responses');
        $posts = [];
        if ($total_posts > 0) {
            $res = $db->query("SELECT slug, views FROM post_stats ORDER BY views DESC");
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) $posts[] = $row;
        }
        $feedbacks = [];
        if ($total_feedback > 0) {
            $res = $db->query("SELECT * FROM feedback ORDER BY created_at DESC");
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) $feedbacks[] = $row;
        }
        $surveys = [];
        if ($total_survey > 0) {
            $res = $db->query("SELECT * FROM survey_responses ORDER BY created_at DESC");
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) $surveys[] = $row;
        }
        $visit_logs = [];
        if ($db->querySingle("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='site_visit_logs'")) {
            $res = $db->query("SELECT * FROM site_visit_logs ORDER BY created_at DESC LIMIT 1000");
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) $visit_logs[] = $row;
        }
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
            $res = $db->query("SELECT id, created_at, name, rating, message, ip_address FROM feedback ORDER BY created_at DESC");
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
                $row['created_at'] = formatTanggalIndo($row['created_at']);
                fputcsv($output, $row);
            }
        } elseif ($type === 'survey') {
            $cols = [];
            $resCol = $db->query("PRAGMA table_info(survey_responses)");
            while ($rowC = $resCol->fetchArray(SQLITE3_ASSOC)) $cols[] = $rowC['name'];
            $selectFields = "id, created_at, respondent_name, respondent_role, score_zi, score_service, score_academic";
            if (in_array('score_facilities', $cols)) $selectFields .= ", score_facilities";
            else $selectFields .= ", 0 as score_facilities";
            if (in_array('score_management', $cols)) $selectFields .= ", score_management";
            else $selectFields .= ", 0 as score_management";
            if (in_array('score_culture', $cols)) $selectFields .= ", score_culture";
            else $selectFields .= ", 0 as score_culture";
            $selectFields .= ", feedback, ip_address";
            fputcsv($output, ['ID', 'Waktu (WIB)', 'Nama', 'Peran', 'ZI', 'Pelayanan', 'Akademik', 'Sarpras', 'Manajemen', 'Budaya', 'Masukan', 'IP Address']);
            $res = $db->query("SELECT $selectFields FROM survey_responses ORDER BY created_at DESC");
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
                $row['created_at'] = formatTanggalIndo($row['created_at']);
                fputcsv($output, $row);
            }
        } elseif ($type === 'posts') {
            fputcsv($output, ['Judul Artikel / Slug', 'Jumlah Pembaca']);
            $res = $db->query("SELECT slug, views FROM post_stats ORDER BY views DESC");
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) fputcsv($output, $row);
        } elseif ($type === 'visits') {
            fputcsv($output, ['ID', 'Waktu (WIB)', 'IP Address', 'User Agent / Perangkat']);
            $res = $db->query("SELECT id, created_at, ip_address, user_agent FROM site_visit_logs ORDER BY created_at DESC");
            while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
                $row['created_at'] = formatTanggalIndo($row['created_at']);
                fputcsv($output, $row);
            }
        }
        fclose($output);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
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
$ADMIN_EMAIL_ENV = getenv('ADMIN_EMAIL') ?: 'dev.mtsn1pandeglang@gmail.com';
$dbPath = __DIR__ . '/../../database.db';
try {
    $db = new SQLite3($dbPath);
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        picture TEXT,
        role TEXT DEFAULT 'user', -- super_admin, operator, user
        status TEXT DEFAULT 'active', -- active, inactive
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->bindValue(':email', $ADMIN_EMAIL_ENV, SQLITE3_TEXT);
    if (!$stmt->execute()->fetchArray()) {
        $ins = $db->prepare("INSERT INTO users (email, name, role, status) VALUES (:email, 'Super Admin', 'super_admin', 'active')");
        $ins->bindValue(':email', $ADMIN_EMAIL_ENV, SQLITE3_TEXT);
        $ins->execute();
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
            $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
            $stmt->bindValue(':email', $email, SQLITE3_TEXT);
            $user = $stmt->execute()->fetchArray(SQLITE3_ASSOC);
            if ($user) {
                $upd = $db->prepare("UPDATE users SET name = :name, picture = :pic WHERE id = :id");
                $upd->bindValue(':name', $payload['name'], SQLITE3_TEXT);
                $upd->bindValue(':pic', $payload['picture'], SQLITE3_TEXT);
                $upd->bindValue(':id', $user['id'], SQLITE3_INTEGER);
                $upd->execute();
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
        $cek = $db->prepare("SELECT id FROM users WHERE email = :email");
        $cek->bindValue(':email', $email, SQLITE3_TEXT);
        if ($cek->execute()->fetchArray()) {
            throw new Exception("Email sudah terdaftar. Silakan login.");
        }
        $stmt = $db->prepare("INSERT INTO users (email, name, picture, role, status) VALUES (:email, :name, :pic, 'user', 'active')");
        $stmt->bindValue(':email', $email, SQLITE3_TEXT);
        $stmt->bindValue(':name', $name, SQLITE3_TEXT);
        $stmt->bindValue(':pic', $picture, SQLITE3_TEXT);
        if ($stmt->execute()) {
            $newId = $db->lastInsertRowID();
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['user_id'] = $newId;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_picture'] = $picture;
            $_SESSION['user_role'] = 'user'; // Default Role
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
        } else {
            throw new Exception('Gagal mendaftar.');
        }
    } elseif ($action === 'check') {
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
            $role = isset($_SESSION['user_role']) ? $_SESSION['user_role'] : 'user';
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

// Cek Login & Role Super Admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['user_role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak: Hanya Super Admin yang bisa menghapus data.']);
    exit;
}

$dbPath = __DIR__ . '/../../database.db';

try {
    if (!class_exists('SQLite3')) {
        throw new Exception("SQLite3 driver not installed.");
    }

    $db = new SQLite3($dbPath);

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $action = $_GET['action'] ?? '';

    if ($action === 'delete') {
        $type = $data['type'] ?? '';

        // UPDATE: Mendukung single ID atau multiple IDs
        $ids = [];
        if (isset($data['ids']) && is_array($data['ids'])) {
            $ids = $data['ids'];
        } elseif (isset($data['id'])) {
            $ids = [$data['id']];
        }

        if (empty($ids)) throw new Exception("Tidak ada data yang dipilih.");

        // Validasi Tipe Tabel
        $table = '';
        if ($type === 'feedback') {
            $table = 'feedback';
        } elseif ($type === 'survey') {
            $table = 'survey_responses';
        } else {
            throw new Exception("Tipe data tidak dikenal.");
        }

        // Sanitasi ID menjadi integer semua
        $sanitized_ids = array_map('intval', $ids);
        $ids_string = implode(',', $sanitized_ids);

        // Eksekusi Bulk Delete
        // Query: DELETE FROM table WHERE id IN (1, 2, 3)
        $query = "DELETE FROM $table WHERE id IN ($ids_string)";

        if ($db->exec($query)) {
            $count = $db->changes();
            echo json_encode(['status' => 'success', 'message' => "$count data berhasil dihapus."]);
        } else {
            throw new Exception("Gagal menghapus data.");
        }
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

$dbPath = __DIR__ . '/../../database.db';

function getClientIP()
{
    // Handle IP jika di belakang proxy/Cloudflare
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return $_SERVER['HTTP_X_FORWARDED_FOR'];
    return $_SERVER['REMOTE_ADDR'];
}

try {
    if (!class_exists('SQLite3')) {
        throw new Exception("SQLite3 driver not installed.");
    }

    $db = new SQLite3($dbPath);
    $ip_address = getClientIP();

    // 1. Update Struktur Tabel (Menambahkan kolom ip_address jika belum ada)
    // Kita cek dulu apakah kolom sudah ada, cara simpel: coba query dummy
    $checkTable = $db->querySingle("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='feedback'");
    if ($checkTable) {
        $cols = $db->query("PRAGMA table_info(feedback)");
        $hasIpCol = false;
        while ($row = $cols->fetchArray()) {
            if ($row['name'] === 'ip_address') $hasIpCol = true;
        }
        if (!$hasIpCol) {
            $db->exec("ALTER TABLE feedback ADD COLUMN ip_address TEXT");
        }
    } else {
        $query = "CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            rating INTEGER NOT NULL,
            message TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $db->exec($query);
    }

    // Fungsi Helper untuk ambil stats
    function getStats($db)
    {
        $row = $db->querySingle("SELECT AVG(rating) as average, COUNT(*) as total FROM feedback", true);
        return [
            'average' => round($row['average'] ?? 0, 1),
            'total' => $row['total'] ?? 0
        ];
    }

    // 2. Handle POST (Submit Data)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Cek apakah IP sudah pernah submit
        $checkIp = $db->prepare("SELECT id FROM feedback WHERE ip_address = :ip");
        $checkIp->bindValue(':ip', $ip_address, SQLITE3_TEXT);
        $res = $checkIp->execute();

        if ($res->fetchArray()) {
            echo json_encode(['status' => 'error', 'message' => 'Anda sudah memberikan penilaian sebelumnya.']);
            exit;
        }

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!isset($data['rating'])) throw new Exception("Rating wajib diisi.");

        $name = isset($data['name']) ? htmlspecialchars(strip_tags($data['name'])) : 'Anonim';
        $rating = (int)$data['rating'];
        $message = isset($data['message']) ? htmlspecialchars(strip_tags($data['message'])) : '';

        $stmt = $db->prepare("INSERT INTO feedback (name, rating, message, ip_address) VALUES (:name, :rating, :message, :ip)");
        $stmt->bindValue(':name', $name, SQLITE3_TEXT);
        $stmt->bindValue(':rating', $rating, SQLITE3_INTEGER);
        $stmt->bindValue(':message', $message, SQLITE3_TEXT);
        $stmt->bindValue(':ip', $ip_address, SQLITE3_TEXT);

        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Terima kasih atas penilaian Anda!',
                'stats' => getStats($db)
            ]);
        } else {
            throw new Exception("Gagal menyimpan data.");
        }
    }
    // 3. Handle GET (Cek Status IP & Ambil Stats)
    else {
        $checkIp = $db->prepare("SELECT id FROM feedback WHERE ip_address = :ip");
        $checkIp->bindValue(':ip', $ip_address, SQLITE3_TEXT);
        $res = $checkIp->execute();
        $hasSubmitted = ($res->fetchArray()) ? true : false;

        echo json_encode([
            'status' => 'ready',
            'has_submitted' => $hasSubmitted,
            'stats' => getStats($db)
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

// 1. Cek Login Admin
if (!isset($_SESSION['admin_logged_in']) || ($_SESSION['user_role'] !== 'super_admin' && $_SESSION['user_role'] !== 'operator')) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak: User biasa tidak bisa melakukan import.']);
    exit;
}

set_time_limit(0);
ini_set('memory_limit', '512M');

$dbPath = __DIR__ . '/../../database.db';

try {
    $db = new SQLite3($dbPath);
    $action = $_GET['action'] ?? '';

    // === ACTION: DOWNLOAD TEMPLATE CSV ===
    if ($action === 'template') {
        $type = $_GET['type'] ?? 'feedback';
        $filename = "template_import_{$type}.csv";

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');

        if ($type === 'feedback') {
            fputcsv($output, ['name', 'rating', 'message', 'created_at', 'ip_address']);
            fputcsv($output, ['Budi Santoso', '5', 'Pelayanan sangat memuaskan.', '2024-01-01 10:00:00', '192.168.1.1']);
        } elseif ($type === 'survey') {
            // PERBAIKAN: Template header disesuaikan dengan 6 kategori
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

    // === ACTION: IMPORT DATA ===
    if ($action === 'import' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("File CSV tidak ditemukan atau error saat upload.");
        }

        $type = $_POST['type'] ?? '';
        $fileTmpPath = $_FILES['file']['tmp_name'];

        $handle = fopen($fileTmpPath, "r");
        if ($handle === FALSE) throw new Exception("Gagal membaca file.");

        // Validasi Header
        $headers = fgetcsv($handle, 1000, ",");
        if (!$headers) throw new Exception("File CSV kosong.");

        $cleanHeaders = array_map(function ($h) {
            return strtolower(trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h)));
        }, $headers);

        $successCount = 0;
        $db->exec('BEGIN TRANSACTION');

        try {
            if ($type === 'feedback') {
                // ... (Logic Feedback tetap sama) ...
                if (!in_array('rating', $cleanHeaders)) throw new Exception("Format salah.");
                $stmt = $db->prepare("INSERT INTO feedback (name, rating, message, created_at, ip_address) VALUES (:name, :rating, :message, :created_at, :ip_address)");
                while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                    if (count($data) < 5) continue;
                    $stmt->bindValue(':name', $data[0] ?: 'Anonim', SQLITE3_TEXT);
                    $stmt->bindValue(':rating', (int)$data[1], SQLITE3_INTEGER);
                    $stmt->bindValue(':message', $data[2] ?: '', SQLITE3_TEXT);
                    $stmt->bindValue(':created_at', $data[3] ?: date('Y-m-d H:i:s'), SQLITE3_TEXT);
                    $stmt->bindValue(':ip_address', $data[4] ?: '127.0.0.1', SQLITE3_TEXT);
                    $stmt->execute();
                    $successCount++;
                }
            } elseif ($type === 'survey') {
                // PERBAIKAN: Query Insert untuk 6 Kategori
                // Memastikan urutan kolom CSV: 
                // 0:Name, 1:Role, 2:ZI, 3:Srv, 4:Acd, 5:Fac, 6:Mgt, 7:Cul, 8:Msg, 9:Date, 10:IP

                $stmt = $db->prepare("INSERT INTO survey_responses 
                    (respondent_name, respondent_role, score_zi, score_service, score_academic, score_facilities, score_management, score_culture, feedback, created_at, ip_address, details_json) 
                    VALUES (:name, :role, :zi, :service, :acad, :fac, :mgt, :cul, :feedback, :created, :ip, '{}')");

                while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                    // Validasi jumlah kolom minimal (minimal 11 kolom sesuai generator)
                    if (count($data) < 11) continue;

                    $stmt->bindValue(':name', $data[0] ?: 'Anonim', SQLITE3_TEXT);
                    $stmt->bindValue(':role', $data[1] ?: 'Umum', SQLITE3_TEXT);

                    // Mapping Nilai Skor (Float)
                    $stmt->bindValue(':zi', (float)$data[2], SQLITE3_FLOAT);
                    $stmt->bindValue(':service', (float)$data[3], SQLITE3_FLOAT);
                    $stmt->bindValue(':acad', (float)$data[4], SQLITE3_FLOAT);
                    $stmt->bindValue(':fac', (float)$data[5], SQLITE3_FLOAT);
                    $stmt->bindValue(':mgt', (float)$data[6], SQLITE3_FLOAT);
                    $stmt->bindValue(':cul', (float)$data[7], SQLITE3_FLOAT);

                    // Mapping Teks
                    $stmt->bindValue(':feedback', $data[8] ?: '', SQLITE3_TEXT); // Index 8 adalah Pesan
                    $stmt->bindValue(':created', $data[9] ?: date('Y-m-d H:i:s'), SQLITE3_TEXT); // Index 9 adalah Waktu
                    $stmt->bindValue(':ip', $data[10] ?: '127.0.0.1', SQLITE3_TEXT); // Index 10 adalah IP

                    $stmt->execute();
                    $successCount++;
                }
            } elseif ($type === 'visits') {
                // ... (Logic Visits tetap sama) ...
                $stmt = $db->prepare("INSERT INTO site_visit_logs (ip_address, user_agent, created_at) VALUES (:ip, :ua, :created)");
                while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                    if (count($data) < 3) continue;
                    $stmt->bindValue(':ip', $data[0] ?: '127.0.0.1', SQLITE3_TEXT);
                    $stmt->bindValue(':ua', $data[1] ?: 'Imported', SQLITE3_TEXT);
                    $stmt->bindValue(':created', $data[2] ?: date('Y-m-d H:i:s'), SQLITE3_TEXT);
                    $stmt->execute();
                    $successCount++;
                }
                $db->exec("UPDATE global_stats SET value = value + $successCount WHERE key = 'site_visits'");
            }

            $db->exec('COMMIT');
            fclose($handle);
            echo json_encode(['status' => 'success', 'message' => "Berhasil mengimport $successCount data."]);
        } catch (Exception $ex) {
            $db->exec('ROLLBACK');
            throw $ex;
        }
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
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    die("Akses Ditolak.");
}
if (!file_exists(__DIR__ . '/lib/fpdf.php')) {
    die("Error: Library FPDF tidak ditemukan.");
}
require('lib/fpdf.php');
$dbPath = __DIR__ . '/../../database.db';
try {
    $db = new SQLite3($dbPath);
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
    $pdf->SetAutoPageBreak(false); // Matikan auto page break
    $pdf->setPageBreakTrigger(277);
    $pdf->AddPage();
    $m = str_pad($month, 2, '0', STR_PAD_LEFT);
    $y = $year;
    $visits = $db->querySingle("SELECT value FROM global_stats WHERE key = 'site_visits'") ?: 0;
    $feedbackCount = $db->querySingle("SELECT COUNT(*) FROM feedback WHERE strftime('%m', created_at) = '$m' AND strftime('%Y', created_at) = '$y'") ?: 0;
    $surveyCount = $db->querySingle("SELECT COUNT(*) FROM survey_responses WHERE strftime('%m', created_at) = '$m' AND strftime('%Y', created_at) = '$y'") ?: 0;
    $articleViews = $db->querySingle("SELECT SUM(views) FROM post_stats") ?: 0;
    $indices = $db->querySingle("SELECT 
        AVG(score_zi) as zi, 
        AVG(score_service) as service, 
        AVG(score_academic) as academic,
        AVG(score_facilities) as facilities,
        AVG(score_management) as management,
        AVG(score_culture) as culture 
        FROM survey_responses 
        WHERE strftime('%m', created_at) = '$m' AND strftime('%Y', created_at) = '$y'", true);
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
    $avgRatingRaw = $db->querySingle("SELECT AVG(rating) FROM feedback WHERE strftime('%m', created_at) = '$m' AND strftime('%Y', created_at) = '$y'");
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
    $wSub = 190 / 3; // Bagi 3 kolom
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
        $pdf->SetFont('Arial', '', 7); // Font lebih kecil agar muat
    };
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->Cell(0, 7, 'A. DATA DETAIL SURVEI KEPUASAN', 0, 1, 'L');
    $pdf->SetWidths([8, 30, 35, 9, 9, 9, 9, 9, 9, 10, 53]);
    $pdf->SetAligns(['C', 'C', 'L', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'L']);
    $drawSurveyHeader();
    $pdf->SetTableHeaderCallback($drawSurveyHeader);
    $pdf->isPrintingTable = true;
    $resSurv = $db->query("SELECT * FROM survey_responses WHERE strftime('%m', created_at) = '$m' AND strftime('%Y', created_at) = '$y' ORDER BY created_at ASC");
    $no = 1;
    $found1 = false;
    while ($row = $resSurv->fetchArray(SQLITE3_ASSOC)) {
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
    $resFeed = $db->query("SELECT * FROM feedback WHERE strftime('%m', created_at) = '$m' AND strftime('%Y', created_at) = '$y' ORDER BY created_at ASC");
    $no = 1;
    $found2 = false;
    while ($row = $resFeed->fetchArray(SQLITE3_ASSOC)) {
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

### File: `./public/api/stats.php`

```
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Sesuaikan dengan domain produksi nanti
header('Access-Control-Allow-Methods: GET, POST');
session_start();
$dbPath = __DIR__ . '/../../database.db';

function getClientIP()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return $_SERVER['HTTP_X_FORWARDED_FOR'];
    return $_SERVER['REMOTE_ADDR'];
}

try {
    if (!class_exists('SQLite3')) {
        throw new Exception("SQLite3 driver not installed on PHP");
    }
    $db = new SQLite3($dbPath);

    // Tabel Counter Global (Ringkasan)
    $db->exec("CREATE TABLE IF NOT EXISTS global_stats (key TEXT PRIMARY KEY, value INTEGER DEFAULT 0)");

    // Tabel Detail Log Kunjungan (Baru)
    $db->exec("CREATE TABLE IF NOT EXISTS site_visit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS post_stats (slug TEXT PRIMARY KEY, views INTEGER DEFAULT 0)");
    $db->exec("INSERT OR IGNORE INTO global_stats (key, value) VALUES ('site_visits', 0)");

    $action = $_GET['action'] ?? '';
    $slug   = $_GET['slug'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];

    $response = ['value' => 0];

    if ($action === 'visit') {
        if ($method === 'POST') {
            // Logika Session untuk mencegah F5 spamming counter global
            if (!isset($_SESSION['has_visited_site'])) {
                // 1. Update Counter Global
                $db->exec("UPDATE global_stats SET value = value + 1 WHERE key = 'site_visits'");

                // 2. Catat Detail Log Kunjungan (IP & Browser)
                $ip = getClientIP();
                $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

                $stmt = $db->prepare("INSERT INTO site_visit_logs (ip_address, user_agent) VALUES (:ip, :ua)");
                $stmt->bindValue(':ip', $ip, SQLITE3_TEXT);
                $stmt->bindValue(':ua', $ua, SQLITE3_TEXT);
                $stmt->execute();

                $_SESSION['has_visited_site'] = true;
            }
        }
        $result = $db->querySingle("SELECT value FROM global_stats WHERE key = 'site_visits'");
        $response['value'] = $result ? $result : 0;
    } elseif ($action === 'view' && !empty($slug)) {
        $slug = preg_replace('/[^a-zA-Z0-9_-]/', '', $slug); // Sanitasi
        $sessionKey = 'viewed_' . $slug;
        if ($method === 'POST') {
            if (!isset($_SESSION[$sessionKey])) {
                $stmt = $db->prepare("INSERT INTO post_stats (slug, views) VALUES (:slug, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1");
                $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
                $stmt->execute();
                $_SESSION[$sessionKey] = true;
            }
        }
        $stmt = $db->prepare("SELECT views FROM post_stats WHERE slug = :slug");
        $stmt->bindValue(':slug', $slug, SQLITE3_TEXT);
        $result = $stmt->execute();
        $row = $result->fetchArray(SQLITE3_ASSOC);
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

$dbPath = __DIR__ . '/../../database.db';

function getClientIP()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return $_SERVER['HTTP_X_FORWARDED_FOR'];
    return $_SERVER['REMOTE_ADDR'];
}

try {
    if (!class_exists('SQLite3')) {
        throw new Exception("SQLite3 driver not installed.");
    }

    $db = new SQLite3($dbPath);
    $ip_address = getClientIP();

    // 1. AUTO MIGRATION: Cek & Tambah Kolom jika belum ada
    $db->exec("CREATE TABLE IF NOT EXISTS survey_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        respondent_name TEXT,
        respondent_role TEXT,
        feedback TEXT,
        details_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $requiredCols = [
        'score_zi' => 'REAL',
        'score_service' => 'REAL',
        'score_academic' => 'REAL',
        'score_facilities' => 'REAL',
        'score_management' => 'REAL',
        'score_culture' => 'REAL',
        'ip_address' => 'TEXT'
    ];

    $existingCols = [];
    $resCols = $db->query("PRAGMA table_info(survey_responses)");
    while ($row = $resCols->fetchArray(SQLITE3_ASSOC)) {
        $existingCols[] = $row['name'];
    }

    foreach ($requiredCols as $col => $type) {
        if (!in_array($col, $existingCols)) {
            $db->exec("ALTER TABLE survey_responses ADD COLUMN $col $type DEFAULT 0");
        }
    }

    // Helper Stats (Updated for 6 categories)
    function getSurveyStats($db)
    {
        $sql = "SELECT
            AVG(score_zi) as zi,
            AVG(score_service) as service,
            AVG(score_academic) as academic,
            AVG(score_facilities) as facilities,
            AVG(score_management) as management,
            AVG(score_culture) as culture,
            COUNT(*) as total
            FROM survey_responses";
        $row = $db->querySingle($sql, true);

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

    // 2. Handle POST
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $checkIp = $db->prepare("SELECT id FROM survey_responses WHERE ip_address = :ip");
        $checkIp->bindValue(':ip', $ip_address, SQLITE3_TEXT);
        if ($checkIp->execute()->fetchArray()) {
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

        $stmt = $db->prepare("INSERT INTO survey_responses
            (respondent_name, respondent_role, score_zi, score_service, score_academic, score_facilities, score_management, score_culture, feedback, details_json, ip_address)
            VALUES (:name, :role, :zi, :service, :acd, :fac, :mgt, :cul, :feedback, :details, :ip)");

        $stmt->bindValue(':name', $name, SQLITE3_TEXT);
        $stmt->bindValue(':role', $role, SQLITE3_TEXT);
        $stmt->bindValue(':zi', $s['zi'] ?? 0, SQLITE3_FLOAT);
        $stmt->bindValue(':service', $s['service'] ?? 0, SQLITE3_FLOAT);
        $stmt->bindValue(':acd', $s['academic'] ?? 0, SQLITE3_FLOAT);
        $stmt->bindValue(':fac', $s['facilities'] ?? 0, SQLITE3_FLOAT);
        $stmt->bindValue(':mgt', $s['management'] ?? 0, SQLITE3_FLOAT);
        $stmt->bindValue(':cul', $s['culture'] ?? 0, SQLITE3_FLOAT);
        $stmt->bindValue(':feedback', $feedback, SQLITE3_TEXT);
        $stmt->bindValue(':details', $details, SQLITE3_TEXT);
        $stmt->bindValue(':ip', $ip_address, SQLITE3_TEXT);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Survei berhasil dikirim.', 'stats' => getSurveyStats($db)]);
        } else {
            throw new Exception("Gagal menyimpan data.");
        }
    }
    // 3. Handle GET
    else {
        $checkIp = $db->prepare("SELECT id FROM survey_responses WHERE ip_address = :ip");
        $checkIp->bindValue(':ip', $ip_address, SQLITE3_TEXT);
        $hasSubmitted = ($checkIp->execute()->fetchArray()) ? true : false;
        echo json_encode(['status' => 'ready', 'has_submitted' => $hasSubmitted, 'stats' => getSurveyStats($db)]);
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

// Proteksi: Hanya Super Admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['user_role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access Denied: Super Admin Only']);
    exit;
}

$dbPath = __DIR__ . '/../../database.db';
try {
    $db = new SQLite3($dbPath);
    $method = $_SERVER['REQUEST_METHOD'];
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // GET ALL USERS
    if ($method === 'GET') {
        $res = $db->query("SELECT id, email, name, picture, role, status, created_at FROM users ORDER BY created_at DESC");
        $users = [];
        while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
            $users[] = $row;
        }
        echo json_encode(['status' => 'success', 'data' => $users]);
    }

    // UPDATE USER (Role & Status)
    elseif ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'update') {
        $id = (int)$data['id'];
        $role = $data['role']; // super_admin, operator, user
        $status = $data['status']; // active, inactive

        // Mencegah Super Admin mengubah dirinya sendiri menjadi inactive/user biasa (Anti Lockout)
        if ($id === $_SESSION['user_id'] && ($status !== 'active' || $role !== 'super_admin')) {
            throw new Exception("Anda tidak bisa menurunkan hak akses atau menonaktifkan akun sendiri.");
        }

        $stmt = $db->prepare("UPDATE users SET role = :role, status = :status WHERE id = :id");
        $stmt->bindValue(':role', $role, SQLITE3_TEXT);
        $stmt->bindValue(':status', $status, SQLITE3_TEXT);
        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'User berhasil diperbarui']);
        } else {
            throw new Exception("Gagal update user.");
        }
    }

    // DELETE USER
    elseif ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete') {
        $id = (int)$data['id'];

        if ($id === $_SESSION['user_id']) {
            throw new Exception("Tidak bisa menghapus akun sendiri.");
        }

        $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'User dihapus permanen.']);
        } else {
            throw new Exception("Gagal menghapus user.");
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

```

---

---

## Direktori: ROOT

### File: `./.env.example`

```
# Google Auth
PUBLIC_GOOGLE_CLIENT_ID=
ADMIN_EMAIL=
```

---
