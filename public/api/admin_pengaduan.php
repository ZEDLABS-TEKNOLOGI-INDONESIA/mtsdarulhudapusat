<?php
require_once 'config.php';
header('Content-Type: application/json');

session_start();

// Check authentication
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user = $_SESSION['user'];

// Check if user has admin role
if ($user['role'] !== 'operator' && $user['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            handleList($pdo);
            break;

        case 'update':
            handleUpdate($pdo, $user);
            break;

        case 'delete':
            handleDelete($pdo, $user);
            break;

        case 'export':
            handleExport($pdo);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function handleList($pdo)
{
    $month = $_GET['month'] ?? '';
    $year = $_GET['year'] ?? '';
    $status = $_GET['status'] ?? '';
    $kategori = $_GET['kategori'] ?? '';

    // Build query with filters
    $query = "SELECT * FROM pengaduan WHERE 1=1";
    $params = [];

    if ($month) {
        $query .= " AND MONTH(created_at) = ?";
        $params[] = $month;
    }

    if ($year) {
        $query .= " AND YEAR(created_at) = ?";
        $params[] = $year;
    }

    if ($status) {
        $query .= " AND status = ?";
        $params[] = $status;
    }

    if ($kategori) {
        $query .= " AND kategori = ?";
        $params[] = $kategori;
    }

    $query .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get statistics
    $statsQuery = "SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'menunggu' THEN 1 ELSE 0 END) as menunggu,
        SUM(CASE WHEN status = 'diproses' THEN 1 ELSE 0 END) as diproses,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as selesai,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak
        FROM pengaduan WHERE 1=1";

    $statsParams = [];

    if ($month) {
        $statsQuery .= " AND MONTH(created_at) = ?";
        $statsParams[] = $month;
    }

    if ($year) {
        $statsQuery .= " AND YEAR(created_at) = ?";
        $statsParams[] = $year;
    }

    if ($kategori) {
        $statsQuery .= " AND kategori = ?";
        $statsParams[] = $kategori;
    }

    $statsStmt = $pdo->prepare($statsQuery);
    $statsStmt->execute($statsParams);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $data,
        'stats' => $stats
    ]);
}

function handleUpdate($pdo, $user)
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['id']) || !isset($input['status'])) {
        throw new Exception('Missing required fields');
    }

    $id = $input['id'];
    $status = $input['status'];
    $tanggapan = $input['tanggapan'] ?? null;

    // Validate status
    $validStatuses = ['menunggu', 'diproses', 'selesai', 'ditolak'];
    if (!in_array($status, $validStatuses)) {
        throw new Exception('Invalid status');
    }

    $stmt = $pdo->prepare("UPDATE pengaduan SET status = ?, tanggapan = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$status, $tanggapan, $id]);

    echo json_encode(['success' => true, 'message' => 'Pengaduan updated successfully']);
}

function handleDelete($pdo, $user)
{
    // Only super_admin can delete
    if ($user['role'] !== 'super_admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Only Super Admin can delete']);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['id'])) {
        throw new Exception('Missing id');
    }

    $id = $input['id'];

    $stmt = $pdo->prepare("DELETE FROM pengaduan WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Pengaduan deleted successfully']);
}

function handleExport($pdo)
{
    $month = $_GET['month'] ?? '';
    $year = $_GET['year'] ?? '';
    $status = $_GET['status'] ?? '';
    $kategori = $_GET['kategori'] ?? '';

    // Build query with filters
    $query = "SELECT * FROM pengaduan WHERE 1=1";
    $params = [];

    if ($month) {
        $query .= " AND MONTH(created_at) = ?";
        $params[] = $month;
    }

    if ($year) {
        $query .= " AND YEAR(created_at) = ?";
        $params[] = $year;
    }

    if ($status) {
        $query .= " AND status = ?";
        $params[] = $status;
    }

    if ($kategori) {
        $query .= " AND kategori = ?";
        $params[] = $kategori;
    }

    $query .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Generate CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=pengaduan_export_' . date('Y-m-d_His') . '.csv');

    $output = fopen('php://output', 'w');

    // Add BOM for UTF-8
    fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

    // Headers
    fputcsv($output, ['ID', 'Nama', 'Email', 'Telepon', 'Kategori', 'Judul', 'Isi Pengaduan', 'Status', 'Tanggapan', 'IP Address', 'Waktu Dibuat', 'Waktu Update']);

    // Data rows
    foreach ($data as $row) {
        fputcsv($output, [
            $row['id'],
            $row['nama'],
            $row['email'],
            $row['telepon'],
            $row['kategori'],
            $row['judul'],
            $row['isi_pengaduan'],
            $row['status'],
            $row['tanggapan'] ?? '',
            $row['ip_address'],
            $row['created_at'],
            $row['updated_at']
        ]);
    }

    fclose($output);
    exit;
}
