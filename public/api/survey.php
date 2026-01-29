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
