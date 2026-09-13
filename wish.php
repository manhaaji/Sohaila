<?php
// ضع بريدك الحقيقي هنا قبل رفع الموقع.
$TO_EMAIL = 'YOUR_EMAIL@example.com';
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false]); exit; }
$raw = file_get_contents('php://input'); $data = json_decode($raw, true);
$wish = trim($data['wish'] ?? $_POST['wish'] ?? '');
if ($wish === '' || mb_strlen($wish) > 600) { http_response_code(422); echo json_encode(['ok'=>false]); exit; }
$subject = 'Suhaila — A private wish for her 20th birthday';
$body = "A new private wish was sent from the birthday website.\n\nWish:\n" . $wish . "\n\nDate: " . date('Y-m-d H:i:s');
$headers = "Content-Type: text/plain; charset=UTF-8\r\n" . "From: Birthday Website <noreply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n";
$ok = @mail($TO_EMAIL, $subject, $body, $headers);
if (!$ok) { http_response_code(500); echo json_encode(['ok'=>false]); exit; }
echo json_encode(['ok'=>true]);
