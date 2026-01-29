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
