<?php
require_once 'config.php';
require_once 'fpdf/fpdf.php';

session_start();

// Check authentication
if (!isset($_SESSION['user'])) {
    die('Unauthorized');
}

$user = $_SESSION['user'];

// Check if user has admin role
if ($user['role'] !== 'operator' && $user['role'] !== 'super_admin') {
    die('Forbidden');
}

// Custom PDF class with header and footer
class PDF extends FPDF
{
    private $title = '';
    private $dateRange = '';

    function setTitle($title)
    {
        $this->title = $title;
    }

    function setDateRange($range)
    {
        $this->dateRange = $range;
    }

    function Header()
    {
        // Logo
        if (file_exists('assets/logo.png')) {
            $this->Image('assets/logo.png', 10, 6, 20);
        }

        // Header text
        $this->SetFont('Arial', 'B', 14);
        $this->Cell(0, 7, 'POLITEKNIK KETENAGAKERJAAN', 0, 1, 'C');
        $this->SetFont('Arial', '', 10);
        $this->Cell(0, 5, 'Jl. Raya Jakarta-Bogor Km.27 Cibubur, Jakarta Timur 13720', 0, 1, 'C');
        $this->Cell(0, 5, 'Telp: (021) 8400623 | Email: info@polteknaker.ac.id', 0, 1, 'C');

        // Line
        $this->SetLineWidth(0.5);
        $this->Line(10, 28, 200, 28);
        $this->SetLineWidth(0.2);
        $this->Ln(5);

        // Report title
        $this->SetFont('Arial', 'B', 12);
        $this->Cell(0, 7, $this->title, 0, 1, 'C');

        if ($this->dateRange) {
            $this->SetFont('Arial', '', 10);
            $this->Cell(0, 5, $this->dateRange, 0, 1, 'C');
        }

        $this->Ln(3);
    }

    function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, 'Halaman ' . $this->PageNo() . ' | Dicetak pada: ' . date('d-m-Y H:i:s'), 0, 0, 'C');
    }

    function TableHeader($headers, $widths)
    {
        $this->SetFont('Arial', 'B', 9);
        $this->SetFillColor(230, 230, 230);

        foreach ($headers as $i => $header) {
            $this->Cell($widths[$i], 7, $header, 1, 0, 'C', true);
        }
        $this->Ln();
    }

    function TableRow($data, $widths, $heights = [])
    {
        $this->SetFont('Arial', '', 8);

        // Calculate max height needed for this row
        $maxHeight = 5;
        foreach ($data as $i => $cell) {
            if (isset($heights[$i]) && $heights[$i] > $maxHeight) {
                $maxHeight = $heights[$i];
            }
        }

        // Store current position
        $x = $this->GetX();
        $y = $this->GetY();

        // Draw cells
        foreach ($data as $i => $cell) {
            $this->SetXY($x, $y);
            $this->MultiCell($widths[$i], 5, $cell, 1, 'L');
            $x += $widths[$i];
        }

        // Move to next row
        $this->SetXY(10, $y + $maxHeight);
    }
}

// Get filters
$month = $_GET['month'] ?? '';
$year = $_GET['year'] ?? '';
$status = $_GET['status'] ?? '';
$kategori = $_GET['kategori'] ?? '';

// Build query
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

// Create PDF
$pdf = new PDF('P', 'mm', 'A4');
$pdf->SetAutoPageBreak(true, 20);

// Set title
$title = 'LAPORAN DATA PENGADUAN MASYARAKAT';
$pdf->setTitle($title);

// Set date range
$dateRange = '';
$monthNames = [
    '',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
];

if ($month && $year) {
    $dateRange = 'Periode: ' . $monthNames[(int)$month] . ' ' . $year;
} elseif ($month) {
    $dateRange = 'Periode: Bulan ' . $monthNames[(int)$month];
} elseif ($year) {
    $dateRange = 'Periode: Tahun ' . $year;
}

if ($status) {
    $dateRange .= ($dateRange ? ' | ' : '') . 'Status: ' . ucfirst($status);
}

if ($kategori) {
    $dateRange .= ($dateRange ? ' | ' : '') . 'Kategori: ' . $kategori;
}

$pdf->setDateRange($dateRange);

$pdf->AddPage();

// Statistics summary
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 7, 'RINGKASAN STATISTIK', 0, 1, 'L');
$pdf->SetFont('Arial', '', 9);

$pdf->Cell(40, 6, 'Total Pengaduan', 1, 0, 'L');
$pdf->Cell(30, 6, ': ' . $stats['total'], 1, 1, 'L');

$pdf->Cell(40, 6, 'Menunggu', 1, 0, 'L');
$pdf->Cell(30, 6, ': ' . $stats['menunggu'], 1, 0, 'L');
$pdf->Cell(40, 6, 'Diproses', 1, 0, 'L');
$pdf->Cell(30, 6, ': ' . $stats['diproses'], 1, 1, 'L');

$pdf->Cell(40, 6, 'Selesai', 1, 0, 'L');
$pdf->Cell(30, 6, ': ' . $stats['selesai'], 1, 0, 'L');
$pdf->Cell(40, 6, 'Ditolak', 1, 0, 'L');
$pdf->Cell(30, 6, ': ' . $stats['ditolak'], 1, 1, 'L');

$pdf->Ln(5);

// Data table
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 7, 'DATA PENGADUAN', 0, 1, 'L');

// Table headers
$headers = ['No', 'Tanggal', 'Nama', 'Kategori', 'Judul', 'Status'];
$widths = [10, 25, 35, 25, 60, 20];

$pdf->TableHeader($headers, $widths);

// Table data
$no = 1;
foreach ($data as $row) {
    // Check if we need a new page
    if ($pdf->GetY() > 250) {
        $pdf->AddPage();
        $pdf->TableHeader($headers, $widths);
    }

    $tanggal = date('d/m/Y H:i', strtotime($row['created_at']));
    $nama = $row['nama'];
    $kategori = $row['kategori'];
    $judul = substr($row['judul'], 0, 40) . (strlen($row['judul']) > 40 ? '...' : '');
    $status = ucfirst($row['status']);

    $rowData = [$no, $tanggal, $nama, $kategori, $judul, $status];
    $pdf->TableRow($rowData, $widths);

    $no++;
}

// Add signature area
$pdf->Ln(10);

$pdf->SetFont('Arial', '', 9);
$pdf->Cell(0, 5, 'Jakarta, ' . date('d-m-Y'), 0, 1, 'R');
$pdf->Cell(0, 5, 'Mengetahui,', 0, 1, 'R');
$pdf->Ln(15);

$pdf->SetFont('Arial', 'B', 9);
$pdf->Cell(0, 5, '(_____________________)', 0, 1, 'R');
$pdf->SetFont('Arial', '', 9);
$pdf->Cell(0, 5, 'Kepala Tata', 0, 1, 'R');

// Output PDF
$filename = 'Laporan_Pengaduan_' . date('Y-m-d_His') . '.pdf';
$pdf->Output('D', $filename);
