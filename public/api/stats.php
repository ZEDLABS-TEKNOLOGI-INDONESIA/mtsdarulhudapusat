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
