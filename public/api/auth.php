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
