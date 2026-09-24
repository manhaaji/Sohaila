<?php
// Authenticated asset server. Nothing under private/media or private/assets
// is directly public; this endpoint only serves files after successful login.
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$secure,'httponly'=>true,'samesite'=>'Lax']);
session_start();
if (($_SESSION['suhaila_auth'] ?? false) !== true) {
    http_response_code(403);
    exit('Forbidden');
}

$requested = isset($_GET['f']) ? rawurldecode((string)$_GET['f']) : '';
$requested = str_replace('\\','/',$requested);
if ($requested === '' || strpos($requested, '..') !== false || substr($requested, 0, 1) === '/' || strpos($requested, "\0") !== false) {
    http_response_code(400); exit('Bad request');
}

$allowed = ['css','js','mp3','mp4','jpg','jpeg','png','webp','gif','svg','woff','woff2','ttf','otf','ico'];
$ext = strtolower(pathinfo($requested, PATHINFO_EXTENSION));
if (!in_array($ext, $allowed, true)) { http_response_code(403); exit('Forbidden'); }

$isMedia = strpos($requested, 'images/') === 0 || strpos($requested, 'music/') === 0;
$base = $isMedia
    ? __DIR__ . '/private/media/'
    : __DIR__ . '/private/assets/';
$relative = preg_replace('#^(images/|music/)#','',$requested);
$file = realpath($base . $relative);
$baseReal = realpath($base);
if ($file === false || $baseReal === false || strpos($file, $baseReal . DIRECTORY_SEPARATOR) !== 0 || !is_file($file)) {
    http_response_code(404); exit('Not found');
}

$mime = [
 'css'=>'text/css; charset=UTF-8','js'=>'application/javascript; charset=UTF-8','mp3'=>'audio/mpeg','mp4'=>'video/mp4',
 'jpg'=>'image/jpeg','jpeg'=>'image/jpeg','png'=>'image/png','webp'=>'image/webp','gif'=>'image/gif','svg'=>'image/svg+xml',
 'woff'=>'font/woff','woff2'=>'font/woff2','ttf'=>'font/ttf','otf'=>'font/otf','ico'=>'image/x-icon'
][$ext] ?? 'application/octet-stream';

header('Content-Type: '.$mime);
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, max-age=3600');
header('Content-Length: '.filesize($file));
readfile($file);
