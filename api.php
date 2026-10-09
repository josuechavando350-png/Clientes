<?php
/* =====================================================================
   Panel de contenido · ericramirez.com.mx
   API en PHP para Hostinger (PHP 7.4 o superior, sin base de datos).
   Guarda todo en la carpeta «cms-datos», fuera de public_html.
   ===================================================================== */
declare(strict_types=1);
error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

const VERSION_API   = '1.0';
const MAX_JSON      = 12 * 1024 * 1024;  // 12 MB por guardado (incluye las 14 páginas al publicar)
const MAX_FILE      = 15 * 1024 * 1024;  // 15 MB por archivo
const MAX_PIXELS    = 48000000;          // evita «bombas» de imagen
const IMG_MAX_SIDE  = 2400;
const SESSION_DAYS  = 30;
const MAX_VERSIONS  = 60;
const LOCK_TRIES    = 5;                 // intentos fallidos por IP…
const LOCK_WINDOW   = 900;               // …en 15 minutos
const GLOBAL_TRIES  = 25;                // tope general en 15 minutos
const COOKIE        = 'ecms';

/* ---------- utilidades ---------- */
if (!function_exists('mb_substr')) { function mb_substr($s, $a, $l = null) { return $l === null ? substr($s, $a) : substr($s, $a, $l); } }
if (!function_exists('mb_strlen')) { function mb_strlen($s) { return strlen(utf8_decode($s)); } }
function out(array $a, int $code = 200): void {
    http_response_code($code);
    if (!headers_sent() && !isset($GLOBALS['__cache'])) header('Cache-Control: no-store');
    echo json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(string $msg, int $code = 400): void { out(['ok' => false, 'error' => $msg], $code); }

function data_dir(): string {
    static $d = null;
    if ($d !== null) return $d;
    foreach ([dirname(__DIR__) . '/cms-datos', __DIR__ . '/cms-datos'] as $c) {
        if (is_file($c . '/config.php')) return $d = $c;
    }
    return $d = dirname(__DIR__) . '/cms-datos';
}
function cfg(): array {
    static $c = null;
    if ($c !== null) return $c;
    $f = data_dir() . '/config.php';
    if (!is_file($f)) fail('El panel todavía no está instalado. Abra /instalar.php.', 503);
    $c = include $f;
    if (!is_array($c) || empty($c['hash']) || empty($c['secret'])) fail('Configuración dañada.', 500);
    return $c;
}
function save_cfg(array $c): void {
    $f = data_dir() . '/config.php';
    write_atomic($f, "<?php\n// Configuración del panel. No compartir.\nreturn " . var_export($c, true) . ";\n");
    @chmod($f, 0600);
}
function write_atomic(string $file, string $content): void {
    $tmp = $file . '.tmp' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $content, LOCK_EX) === false) fail('No se pudo escribir en el servidor.', 500);
    if (!@rename($tmp, $file)) { @unlink($tmp); fail('No se pudo guardar en el servidor.', 500); }
}
function read_json(string $file) {
    if (!is_file($file)) return null;
    $j = json_decode((string)file_get_contents($file), true);
    return is_array($j) ? $j : null;
}
function write_json(string $file, $data): void {
    write_atomic($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}
function b64u(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64u_dec(string $s): string { return (string)base64_decode(strtr($s, '-_', '+/')); }
function is_https(): bool {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') == '443');
}
function client_ip(): string { return substr((string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 64); }
function body_json(): array {
    $len = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($len > MAX_JSON) fail('El contenido es demasiado grande.', 413);
    $j = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($j)) fail('Solicitud no válida.');
    return $j;
}

/* ---------- sesión firmada (cookie) ---------- */
function make_token(array $c): string {
    $p = b64u(json_encode(['e' => $c['email'], 'x' => time() + SESSION_DAYS * 86400, 'v' => (int)$c['pv'], 'n' => bin2hex(random_bytes(6))]));
    return $p . '.' . b64u(hash_hmac('sha256', $p, $c['secret'], true));
}
function set_session(array $c): string {
    $t = make_token($c);
    setcookie(COOKIE, $t, ['expires' => time() + SESSION_DAYS * 86400, 'path' => '/', 'secure' => is_https(), 'httponly' => true, 'samesite' => 'Strict']);
    $_COOKIE[COOKIE] = $t;
    return csrf_for($c, $t);
}
function clear_session(): void {
    setcookie(COOKIE, '', ['expires' => time() - 3600, 'path' => '/', 'secure' => is_https(), 'httponly' => true, 'samesite' => 'Strict']);
}
function current_user(): ?array {
    $t = (string)($_COOKIE[COOKIE] ?? '');
    if ($t === '' || strpos($t, '.') === false) return null;
    $c = cfg();
    [$p, $s] = explode('.', $t, 2);
    if (!hash_equals(b64u(hash_hmac('sha256', $p, $c['secret'], true)), $s)) return null;
    $d = json_decode(b64u_dec($p), true);
    if (!is_array($d) || ($d['x'] ?? 0) < time() || (int)($d['v'] ?? -1) !== (int)$c['pv']) return null;
    if (strtolower((string)$d['e']) !== strtolower((string)$c['email'])) return null;
    return $d;
}
function csrf_for(array $c, string $tok): string { return substr(hash_hmac('sha256', 'csrf|' . $tok, $c['secret']), 0, 40); }
function require_user(bool $write = false): array {
    $u = current_user();
    if (!$u) fail('Su sesión terminó. Vuelva a entrar.', 401);
    if ($write) {
        $c = cfg();
        $h = (string)($_SERVER['HTTP_X_CSRF'] ?? '');
        if (!hash_equals(csrf_for($c, (string)$_COOKIE[COOKIE]), $h)) fail('Solicitud no autorizada. Recargue el panel.', 403);
    }
    return $u;
}

/* ---------- límite de intentos ---------- */
function tries_file(): string { return data_dir() . '/intentos.json'; }
function tries_check(): void {
    $t = read_json(tries_file()) ?: [];
    $now = time(); $ip = client_ip(); $all = 0; $mine = 0;
    foreach ($t as $k => $list) { foreach ($list as $ts) { if ($ts > $now - LOCK_WINDOW) { $all++; if ($k === $ip) $mine++; } } }
    if ($mine >= LOCK_TRIES || $all >= GLOBAL_TRIES) fail('Demasiados intentos. Por seguridad, espere 15 minutos.', 429);
}
function tries_add(): void {
    $t = read_json(tries_file()) ?: []; $now = time(); $ip = client_ip();
    foreach ($t as $k => $list) { $t[$k] = array_values(array_filter($list, function ($ts) use ($now) { return $ts > $now - LOCK_WINDOW; })); if (!$t[$k]) unset($t[$k]); }
    $t[$ip][] = $now;
    write_json(tries_file(), $t);
}
function tries_clear(): void { $t = read_json(tries_file()) ?: []; unset($t[client_ip()]); write_json(tries_file(), $t); }

/* ---------- contenido ---------- */
function versions_dir(): string { $d = data_dir() . '/versiones'; if (!is_dir($d)) @mkdir($d, 0700, true); return $d; }
function valid_content($d): bool { return is_array($d) && (array_keys($d) !== range(0, count($d) - 1) || !$d); }
function with_lock(callable $fn) {
    $h = fopen(data_dir() . '/.lock', 'c');
    if ($h) flock($h, LOCK_EX);
    try { return $fn(); } finally { if ($h) { flock($h, LOCK_UN); fclose($h); } }
}

/* ---------- páginas del sitio (versión de 14 páginas) ---------- */
function pages_manifest(): array {
    static $m = null;
    if ($m !== null) return $m;
    $j = read_json(__DIR__ . '/cms/paginas.json');
    return $m = is_array($j) ? $j : [];
}
function base_hash(): ?string {
    $m = pages_manifest();
    if (!$m) return null;
    $h = '';
    foreach ($m as $route => $path) { $f = __DIR__ . '/cms/base/' . $path; $h .= $path . ':' . (is_file($f) ? md5_file($f) : '-') . '|'; }
    foreach (['robots.txt', 'sitemap.xml'] as $x) { $f = __DIR__ . '/cms/base/' . $x; if (is_file($f)) $h .= $x . ':' . md5_file($f) . '|'; }
    return md5($h);
}
function has_posts($data, string $kind): bool {
    foreach ((array)($data['posts'][$kind] ?? []) as $p) {
        if (is_array($p) && empty($p['x']) && (trim((string)($p['title'] ?? '')) !== '' || trim((string)($p['body'] ?? '')) !== '')) return true;
    }
    return false;
}
function write_robots_sitemap($data): void {
    $rb = __DIR__ . '/cms/base/robots.txt';
    $sb = __DIR__ . '/cms/base/sitemap.xml';
    $open = [];
    foreach (['historias', 'recursos'] as $k) if (has_posts($data, $k)) $open[] = $k;
    if (is_file($rb)) {
        $lines = preg_split('/\r?\n/', (string)file_get_contents($rb));
        $lines = array_filter($lines, function ($l) use ($open) { foreach ($open as $k) if (preg_match('#^\s*Disallow:\s*/' . $k . '\.html\s*$#i', $l)) return false; return true; });
        write_atomic(__DIR__ . '/robots.txt', implode("\n", $lines));
    }
    if (is_file($sb)) {
        $xml = (string)file_get_contents($sb);
        preg_match('#<loc>(https?://[^/<]+)#', $xml, $mm);
        $origin = $mm[1] ?? '';
        foreach ($open as $k) {
            $loc = $origin . '/' . $k . '.html';
            if ($origin && strpos($xml, '<loc>' . $loc . '</loc>') === false) $xml = str_replace('</urlset>', '  <url><loc>' . $loc . '</loc></url>' . "\n" . '</urlset>', $xml);
        }
        write_atomic(__DIR__ . '/sitemap.xml', $xml);
    }
}

/* ---------- archivos ---------- */
function media_url(string $abs): string { return '/' . ltrim(str_replace('\\', '/', substr($abs, strlen(__DIR__))), '/'); }
function save_upload(): string {
    $f = $_FILES['f'] ?? null;
    if (!$f || !is_array($f) || ($f['error'] ?? 1) !== UPLOAD_ERR_OK) {
        $e = (int)($f['error'] ?? 4);
        fail($e === UPLOAD_ERR_INI_SIZE || $e === UPLOAD_ERR_FORM_SIZE ? 'El archivo es demasiado pesado para el servidor.' : 'No llegó el archivo. Intente de nuevo.');
    }
    if ($f['size'] > MAX_FILE) fail('El archivo pesa más de 15 MB.', 413);
    $tmp = $f['tmp_name'];
    if (!is_uploaded_file($tmp)) fail('Archivo no válido.');
    $dir = __DIR__ . '/media/' . date('Y');
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) fail('No se pudo crear la carpeta de fotos.', 500);
    $name = date('md') . '-' . bin2hex(random_bytes(7));
    $head = (string)file_get_contents($tmp, false, null, 0, 8);

    if (strncmp($head, '%PDF-', 5) === 0) {
        $dest = $dir . '/' . $name . '.pdf';
        if (!move_uploaded_file($tmp, $dest)) fail('No se pudo guardar el PDF.', 500);
        @chmod($dest, 0644);
        return media_url($dest);
    }
    $info = @getimagesize($tmp);
    if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF], true)) fail('Solo se aceptan fotos (JPG, PNG, WebP) o archivos PDF.', 415);
    if ($info[0] * $info[1] > MAX_PIXELS) fail('La imagen es demasiado grande.', 413);
    if (!function_exists('imagecreatefromstring')) fail('El servidor no tiene la extensión GD activa.', 500);
    $img = @imagecreatefromstring((string)file_get_contents($tmp));
    if (!$img) fail('No se pudo leer la imagen.', 415);
    if ($info[2] === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
        $o = (int)((@exif_read_data($tmp) ?: [])['Orientation'] ?? 1);
        if ($o === 3) $img = imagerotate($img, 180, 0); elseif ($o === 6) $img = imagerotate($img, -90, 0); elseif ($o === 8) $img = imagerotate($img, 90, 0);
    }
    imagepalettetotruecolor($img);
    $w = imagesx($img); $h = imagesy($img); $s = min(1, IMG_MAX_SIDE / max($w, $h));
    if ($s < 1) { $n = imagescale($img, (int)round($w * $s), (int)round($h * $s), IMG_BICUBIC); if ($n) { imagedestroy($img); $img = $n; } }
    imagealphablending($img, false); imagesavealpha($img, true);
    if (function_exists('imagewebp')) { $dest = $dir . '/' . $name . '.webp'; $ok = imagewebp($img, $dest, 84); }
    elseif ($info[2] === IMAGETYPE_PNG) { $dest = $dir . '/' . $name . '.png'; $ok = imagepng($img, $dest, 7); }
    else { $dest = $dir . '/' . $name . '.jpg'; imageinterlace($img, true); $ok = imagejpeg($img, $dest, 86); }
    imagedestroy($img);
    if (!$ok) fail('No se pudo guardar la imagen.', 500);
    @chmod($dest, 0644);
    return media_url($dest);
}

/* ---------- mismo origen en escrituras ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && strtolower((string)parse_url($origin, PHP_URL_HOST)) !== strtolower(explode(':', (string)($_SERVER['HTTP_HOST'] ?? ''))[0])) fail('Origen no permitido.', 403);
}

/* ---------- rutas ---------- */
$a = (string)($_GET['a'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($a) {
    /* Contenido publicado: lo lee el sitio en cada visita */
    case 'pub': {
        $GLOBALS['__cache'] = 1;
        $f = data_dir() . '/publicado.json';
        if (!is_file($f)) { header('Cache-Control: no-cache'); out(['ok' => true, 'data' => null, 'at' => null]); }
        $etag = '"' . md5((string)filemtime($f) . ':' . filesize($f)) . '"';
        header('Cache-Control: no-cache');
        header('ETag: ' . $etag);
        if (trim((string)($_SERVER['HTTP_IF_NONE_MATCH'] ?? '')) === $etag) { http_response_code(304); exit; }
        $p = read_json($f) ?: [];
        out(['ok' => true, 'data' => $p['data'] ?? null, 'at' => $p['at'] ?? null]);
    }
    case 'estado': {
        if (!is_file(data_dir() . '/config.php')) out(['ok' => false, 'instalado' => false]);
        $u = current_user();
        if (!$u) out(['ok' => false, 'instalado' => true]);
        $c = cfg();
        out(['ok' => true, 'email' => $c['email'], 'csrf' => csrf_for($c, (string)$_COOKIE[COOKIE])]);
    }
    case 'entrar': {
        if ($method !== 'POST') fail('Método no permitido.', 405);
        $c = cfg();
        tries_check();
        $b = body_json();
        $email = strtolower(trim((string)($b['email'] ?? '')));
        $pass = (string)($b['password'] ?? '');
        $ok = $email !== '' && hash_equals(strtolower((string)$c['email']), $email) & password_verify($pass, (string)$c['hash']);
        if (!$ok) { tries_add(); usleep(450000); fail('Correo o contraseña incorrectos.', 401); }
        tries_clear();
        if (password_needs_rehash($c['hash'], PASSWORD_DEFAULT)) { $c['hash'] = password_hash($pass, PASSWORD_DEFAULT); save_cfg($c); }
        $csrf = set_session($c);
        out(['ok' => true, 'email' => $c['email'], 'csrf' => $csrf]);
    }
    case 'salir': {
        clear_session();
        out(['ok' => true]);
    }
    case 'cargar': {
        require_user();
        $d = read_json(data_dir() . '/borrador.json');
        $p = read_json(data_dir() . '/publicado.json');
        out(['ok' => true, 'draft' => $d['data'] ?? null, 'published' => $p['data'] ?? null, 'pubAt' => $p['at'] ?? null, 'base' => base_hash(), 'pubBase' => $p['base'] ?? null]);
    }
    case 'borrador': {
        if ($method !== 'POST') fail('Método no permitido.', 405);
        $u = require_user(true);
        $b = body_json();
        if (!valid_content($b['data'] ?? null)) fail('Contenido no válido.');
        with_lock(function () use ($b, $u) {
            write_json(data_dir() . '/borrador.json', ['data' => $b['data'], 'at' => gmdate('c'), 'by' => $u['e']]);
        });
        out(['ok' => true]);
    }
    case 'publicar': {
        if ($method !== 'POST') fail('Método no permitido.', 405);
        $u = require_user(true);
        $b = body_json();
        if (!valid_content($b['data'] ?? null)) fail('Contenido no válido.');
        $note = mb_substr(trim((string)($b['note'] ?? '')), 0, 140);
        $at = gmdate('c');
        $man = pages_manifest();
        $pages = [];
        if ($man) {
            $in = $b['pages'] ?? null;
            if (!is_array($in)) fail('Faltan las páginas del sitio. Actualice el panel e intente de nuevo.');
            foreach ($man as $route => $path) {
                $html = $in[$path] ?? null;
                if (!is_string($html) || strlen($html) > 3 * 1024 * 1024 || !preg_match('/^\s*<!doctype html/i', $html)) fail('La página ' . $path . ' no llegó completa. Intente de nuevo.');
                $pages[$path] = $html;
            }
        }
        $baseHash = base_hash();
        with_lock(function () use ($b, $u, $note, $at, $pages, $baseHash) {
            foreach ($pages as $path => $html) {
                $dest = __DIR__ . '/' . $path;
                if (!is_dir(dirname($dest))) @mkdir(dirname($dest), 0755, true);
                write_atomic($dest, $html);
                @chmod($dest, 0644);
            }
            if ($pages) write_robots_sitemap($b['data']);
            $doc = ['data' => $b['data'], 'at' => $at, 'by' => $u['e'], 'base' => $baseHash];
            write_json(data_dir() . '/publicado.json', $doc);
            write_json(data_dir() . '/borrador.json', $doc);
            $id = gmdate('YmdHis') . '-' . bin2hex(random_bytes(3));
            write_json(versions_dir() . '/' . $id . '.json', $doc);
            $idx = read_json(versions_dir() . '/indice.json') ?: [];
            array_unshift($idx, ['id' => $id, 'at' => $at, 'note' => $note, 'by' => $u['e']]);
            foreach (array_slice($idx, MAX_VERSIONS) as $old) @unlink(versions_dir() . '/' . $old['id'] . '.json');
            write_json(versions_dir() . '/indice.json', array_slice($idx, 0, MAX_VERSIONS));
        });
        out(['ok' => true, 'at' => $at]);
    }
    case 'versiones': {
        require_user();
        out(['ok' => true, 'items' => read_json(versions_dir() . '/indice.json') ?: []]);
    }
    case 'version': {
        require_user();
        $id = (string)($_GET['id'] ?? '');
        if (!preg_match('/^\d{14}-[a-f0-9]{6}$/', $id)) fail('Versión no válida.');
        $v = read_json(versions_dir() . '/' . $id . '.json');
        if (!$v) fail('No encontré esa versión.', 404);
        out(['ok' => true, 'data' => $v['data'] ?? null]);
    }
    case 'base': {
        require_user();
        $p = (string)($_GET['p'] ?? '');
        if (!in_array($p, array_values(pages_manifest()), true)) fail('Página no válida.', 404);
        $f = __DIR__ . '/cms/base/' . $p;
        if (!is_file($f)) fail('No encontré la página base.', 404);
        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-store');
        readfile($f);
        exit;
    }
    case 'subir': {
        if ($method !== 'POST') fail('Método no permitido.', 405);
        require_user(true);
        out(['ok' => true, 'url' => save_upload()]);
    }
    case 'clave': {
        if ($method !== 'POST') fail('Método no permitido.', 405);
        require_user(true);
        $c = cfg();
        tries_check();
        $b = body_json();
        if (!password_verify((string)($b['actual'] ?? ''), (string)$c['hash'])) { tries_add(); usleep(450000); fail('La contraseña actual no coincide.', 401); }
        $n = (string)($b['nueva'] ?? '');
        if (mb_strlen($n) < 8) fail('La nueva contraseña debe tener al menos 8 caracteres.');
        $c['hash'] = password_hash($n, PASSWORD_DEFAULT);
        $c['pv'] = (int)$c['pv'] + 1;          // cierra cualquier otra sesión abierta
        save_cfg($c);
        $csrf = set_session($c);
        out(['ok' => true, 'csrf' => $csrf]);
    }
    default:
        fail('Acción no válida.', 404);
}
