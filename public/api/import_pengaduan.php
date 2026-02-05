<?php
require_once 'config.php';

session_start();

// Check authentication
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user = $_SESSION['user'];

// Check if user has admin role (operator or super_admin)
if ($user['role'] !== 'operator' && $user['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'template':
            generateTemplate();
            break;

        case 'import':
            handleImport($pdo);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function generateTemplate()
{
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=template_pengaduan.csv');

    $output = fopen('php://output', 'w');

    // Add BOM for UTF-8
    fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

    // Headers
    fputcsv($output, ['nama', 'email', 'telepon', 'kategori', 'judul', 'isi_pengaduan', 'status', 'tanggapan']);

    // Example rows
    fputcsv($output, [
        'John Doe',
        'john@example.com',
        '081234567890',
        'Pelayanan',
        'Lambatnya Pelayanan Administrasi',
        'Saya mengalami keterlambatan dalam proses pengurusan dokumen administrasi. Sudah 2 minggu belum selesai.',
        'menunggu',
        ''
    ]);

    fputcsv($output, [
        'Jane Smith',
        'jane@example.com',
        '082345678901',
        'Fasilitas',
        'AC Ruang Kuliah Rusak',
        'AC di ruang kuliah lantai 3 sudah rusak sejak minggu lalu dan membuat mahasiswa tidak nyaman.',
        'diproses',
        'Terima kasih atas laporannya. Tim maintenance sedang menangani perbaikan AC.'
    ]);

    fclose($output);
    exit;
}

function handleImport($pdo)
{
    header('Content-Type: application/json');

    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded');
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload error');
    }

    // Validate file extension
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($ext !== 'csv') {
        throw new Exception('Only CSV files are allowed');
    }

    // Read CSV
    $handle = fopen($file['tmp_name'], 'r');
    if (!$handle) {
        throw new Exception('Cannot open file');
    }

    // Skip BOM if present
    $bom = fread($handle, 3);
    if ($bom !== chr(0xEF) . chr(0xBB) . chr(0xBF)) {
        rewind($handle);
    }

    // Read header
    $header = fgetcsv($handle);
    if (!$header) {
        fclose($handle);
        throw new Exception('Invalid CSV format');
    }

    // Validate headers
    $requiredHeaders = ['nama', 'email', 'telepon', 'kategori', 'judul', 'isi_pengaduan'];
    foreach ($requiredHeaders as $reqHeader) {
        if (!in_array($reqHeader, $header)) {
            fclose($handle);
            throw new Exception("Missing required column: $reqHeader");
        }
    }

    // Map header to indices
    $headerMap = array_flip($header);

    // Prepare insert statement
    $stmt = $pdo->prepare("INSERT INTO pengaduan (nama, email, telepon, kategori, judul, isi_pengaduan, status, tanggapan, ip_address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");

    $imported = 0;
    $errors = [];
    $lineNum = 1;

    // Valid values
    $validKategori = ['Pelayanan', 'Fasilitas', 'Akademik', 'Administrasi', 'Lainnya'];
    $validStatus = ['menunggu', 'diproses', 'selesai', 'ditolak'];

    // Start transaction
    $pdo->beginTransaction();

    try {
        while (($row = fgetcsv($handle)) !== false) {
            $lineNum++;

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Extract values
            $nama = trim($row[$headerMap['nama']] ?? '');
            $email = trim($row[$headerMap['email']] ?? '');
            $telepon = trim($row[$headerMap['telepon']] ?? '');
            $kategori = trim($row[$headerMap['kategori']] ?? '');
            $judul = trim($row[$headerMap['judul']] ?? '');
            $isi_pengaduan = trim($row[$headerMap['isi_pengaduan']] ?? '');
            $status = trim($row[$headerMap['status']] ?? 'menunggu');
            $tanggapan = isset($headerMap['tanggapan']) ? trim($row[$headerMap['tanggapan']] ?? '') : '';

            // Validate required fields
            if (empty($nama)) {
                $errors[] = "Line $lineNum: Nama is required";
                continue;
            }

            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Line $lineNum: Valid email is required";
                continue;
            }

            if (empty($telepon)) {
                $errors[] = "Line $lineNum: Telepon is required";
                continue;
            }

            if (empty($kategori)) {
                $errors[] = "Line $lineNum: Kategori is required";
                continue;
            }

            if (!in_array($kategori, $validKategori)) {
                $errors[] = "Line $lineNum: Invalid kategori. Must be one of: " . implode(', ', $validKategori);
                continue;
            }

            if (empty($judul)) {
                $errors[] = "Line $lineNum: Judul is required";
                continue;
            }

            if (empty($isi_pengaduan)) {
                $errors[] = "Line $lineNum: Isi pengaduan is required";
                continue;
            }

            // Validate status
            if (!in_array($status, $validStatus)) {
                $status = 'menunggu';
            }

            // Get IP address (use a placeholder for imported data)
            $ip_address = 'imported';

            // Insert
            $stmt->execute([
                $nama,
                $email,
                $telepon,
                $kategori,
                $judul,
                $isi_pengaduan,
                $status,
                $tanggapan ?: null,
                $ip_address
            ]);

            $imported++;
        }

        // Commit transaction
        $pdo->commit();

        fclose($handle);

        echo json_encode([
            'success' => true,
            'imported' => $imported,
            'errors' => $errors,
            'message' => "$imported records imported successfully" . (count($errors) > 0 ? " with " . count($errors) . " errors" : "")
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        fclose($handle);
        throw new Exception('Import failed: ' . $e->getMessage());
    }
}
