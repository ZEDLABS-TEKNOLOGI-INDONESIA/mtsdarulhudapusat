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
