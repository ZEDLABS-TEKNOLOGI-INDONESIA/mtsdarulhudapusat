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
