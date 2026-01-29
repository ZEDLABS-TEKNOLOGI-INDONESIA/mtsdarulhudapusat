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
