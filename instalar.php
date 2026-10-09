<?php
/* =====================================================================
   Instalador del panel · se usa UNA sola vez y se borra solo.
   Pide un código que solo puede leer quien tiene acceso al hosting
   (Administrador de archivos → cms-datos → CODIGO-INSTALACION.txt).
   ===================================================================== */
declare(strict_types=1);
error_reporting(0);
ini_set('display_errors', '0');
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');

function h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function pick_data_dir(): array {
    $outside = dirname(__DIR__) . '/cms-datos';
    $inside = __DIR__ . '/cms-datos';
    foreach ([$outside, $inside] as $d) if (is_file($d . '/config.php')) return [$d, $d === $outside];
    if (is_dir($outside) || @mkdir($outside, 0700, true)) { if (is_writable($outside)) return [$outside, true]; }
    if (is_dir($inside) || @mkdir($inside, 0700, true)) {
        @file_put_contents($inside . '/.htaccess', "Require all denied\nDeny from all\n");
        @file_put_contents($inside . '/index.html', '');
        return [$inside, false];
    }
    return ['', false];
}
function page(string $title, string $body): void {
    echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Instalar panel · Eric Ramírez</title><style>'
      . '*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse 70% 60% at 50% 35%,#151413,#050505 70%);color:#efede7;font:400 15px/1.6 Helvetica,Arial,sans-serif}'
      . '.c{width:min(440px,100%)}.k{font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#8f8a81}h1{font:italic 400 34px/1.1 Georgia,serif;margin:10px 0 18px}'
      . 'p{color:#b9b4aa;margin:0 0 18px}label{display:grid;gap:6px;margin-bottom:16px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#8f8a81}'
      . 'input{background:transparent;border:0;border-bottom:1px solid rgba(239,237,231,.2);padding:10px 0;color:#efede7;font:400 17px/1.4 Helvetica,Arial,sans-serif;letter-spacing:0;text-transform:none;outline:0;border-radius:0}input:focus{border-bottom-color:#d9b874}'
      . 'button,.b{display:block;width:100%;height:50px;margin-top:10px;border:0;background:linear-gradient(165deg,#fbf0c9,#e6c47c 13%,#a87b33 29%,#f7e4a8 45%,#c8984b 59%,#74521f 77%,#dcb86c 91%,#946c2b);color:#0b0b0a;font:600 11px/50px Helvetica,Arial,sans-serif;letter-spacing:.26em;text-transform:uppercase;text-align:center;text-decoration:none;cursor:pointer}'
      . '.e{color:#eba48f;border-left:2px solid #c76d5b;padding-left:12px}.ok{color:#cfe8b0}.req{font-size:13px;color:#8f8a81;margin-top:22px;border-top:1px solid rgba(239,237,231,.1);padding-top:14px}.req b{color:#cfc9bf;font-weight:400}code{color:#d9b874}'
      . '</style></head><body><main class="c"><div class="k">Panel privado · Eric Ramírez</div><h1>' . h($title) . '</h1>' . $body . '</main></body></html>';
    exit;
}

[$dir, $outside] = pick_data_dir();
if ($dir === '') page('No se pudo preparar', '<p class="e">El servidor no permite crear la carpeta de datos. Revise los permisos de la carpeta del dominio.</p>');

/* ¿Ya instalado? */
if (is_file($dir . '/config.php')) {
    $gone = @unlink(__FILE__);
    page('Ya está instalado', '<p>El panel ya tiene su usuario. ' . ($gone ? 'Este instalador se acaba de borrar por seguridad.' : 'Por seguridad, borre el archivo <code>instalar.php</code> desde el Administrador de archivos.') . '</p><a class="b" href="/panel/">Abrir el panel</a>');
}

/* Requisitos */
$req = [
    'PHP 7.4 o superior' => version_compare(PHP_VERSION, '7.4.0', '>='),
    'Extensión de imágenes (GD)' => function_exists('imagecreatefromstring'),
    'Fotos en WebP' => function_exists('imagewebp'),
    'Carpeta de datos con permiso de escritura' => is_writable($dir),
    'Carpeta pública con permiso de escritura' => is_writable(__DIR__),
];
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
$reqHtml = '<div class="req">';
foreach ($req as $k => $v) $reqHtml .= ($v ? '✓ ' : '✗ ') . '<b>' . h($k) . '</b><br>';
$reqHtml .= ($https ? '✓ ' : '! ') . '<b>Conexión segura (https)</b>' . ($https ? '' : ' — active el SSL del dominio en Hostinger antes de usar el panel') . '<br>';
$reqHtml .= '✓ <b>Datos guardados ' . ($outside ? 'fuera de public_html' : 'en public_html/cms-datos (protegida)') . '</b></div>';
if (!$req['PHP 7.4 o superior'] || !$req['Extensión de imágenes (GD)'] || !$req['Carpeta de datos con permiso de escritura'] || !$req['Carpeta pública con permiso de escritura']) {
    page('Falta un requisito', '<p class="e">Ajuste lo marcado con ✗ en Hostinger (Avanzado → Configuración de PHP) y recargue esta página.</p>' . $reqHtml);
}

/* Código de instalación */
$codeFile = $dir . '/CODIGO-INSTALACION.txt';
$triesFile = $dir . '/.instalar-intentos';
$tries = (int)@file_get_contents($triesFile);
if (!is_file($codeFile) || $tries >= 5) {
    $code = (string)random_int(100000, 999999);
    file_put_contents($codeFile, "Código para instalar el panel: $code\r\n(Se borra solo al terminar la instalación.)\r\n");
    @chmod($codeFile, 0600);
    @unlink($triesFile); $tries = 0;
}
preg_match('/(\d{6})/', (string)file_get_contents($codeFile), $m);
$code = $m[1] ?? '';

$err = '';
$email = 'eric_ricardo@hotmail.com';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $p1 = (string)($_POST['p1'] ?? '');
    $p2 = (string)($_POST['p2'] ?? '');
    $c = preg_replace('/\D/', '', (string)($_POST['code'] ?? ''));
    if ($code === '' || !hash_equals($code, $c)) {
        file_put_contents($triesFile, (string)($tries + 1));
        usleep(600000);
        $err = $tries + 1 >= 5 ? 'Demasiados intentos: se generó un código nuevo en el archivo.' : 'El código no coincide con el del archivo.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $err = 'Revise el correo.';
    } elseif (strlen($p1) < 8) {
        $err = 'La contraseña debe tener al menos 8 caracteres.';
    } elseif ($p1 !== $p2) {
        $err = 'Las dos contraseñas no son iguales.';
    } else {
        $cfg = ['email' => $email, 'hash' => password_hash($p1, PASSWORD_DEFAULT), 'secret' => bin2hex(random_bytes(32)), 'pv' => 1, 'creado' => gmdate('c')];
        @mkdir($dir . '/versiones', 0700, true);
        @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
        $media = __DIR__ . '/media';
        @mkdir($media, 0755, true);
        if (!is_file($media . '/.htaccess')) @file_put_contents($media . '/.htaccess', "# Solo fotos y PDF: nunca ejecutar código aquí\n<FilesMatch \"\\.(php\\d?|phtml|phar|pl|py|cgi|sh|html?|svg|js)$\">\n  Require all denied\n</FilesMatch>\nOptions -Indexes -ExecCGI\n<IfModule mod_headers.c>\n  Header set Cache-Control \"public, max-age=31536000, immutable\"\n  Header set X-Content-Type-Options \"nosniff\"\n</IfModule>\n");
        $tmp = $dir . '/config.php.tmp';
        file_put_contents($tmp, "<?php\n// Configuración del panel. No compartir.\nreturn " . var_export($cfg, true) . ";\n", LOCK_EX);
        rename($tmp, $dir . '/config.php');
        @chmod($dir . '/config.php', 0600);
        @unlink($codeFile); @unlink($triesFile);
        $gone = @unlink(__FILE__);
        page('Listo', '<p class="ok">El panel quedó instalado para <b>' . h($email) . '</b>.</p><p>' . ($gone ? 'Este instalador ya se borró solo.' : 'Borre el archivo <code>instalar.php</code> desde el Administrador de archivos.') . '</p><a class="b" href="/panel/">Abrir el panel</a>');
    }
}

page('Instalar el panel', '<p>Escriba el código que está en el archivo <code>CODIGO-INSTALACION.txt</code>. Lo encuentra en el Administrador de archivos de Hostinger, en la carpeta <code>cms-datos</code>' . ($outside ? ', junto a <code>public_html</code>' : ', dentro de <code>public_html</code>') . '.</p>'
    . ($err ? '<p class="e">' . h($err) . '</p>' : '')
    . '<form method="post" autocomplete="off"><label>Código del archivo<input name="code" inputmode="numeric" maxlength="6" required></label>'
    . '<label>Correo del licenciado<input name="email" type="email" value="' . h($email) . '" required></label>'
    . '<label>Contraseña para el panel<input name="p1" type="password" autocomplete="new-password" minlength="8" required></label>'
    . '<label>Repetir contraseña<input name="p2" type="password" autocomplete="new-password" minlength="8" required></label>'
    . '<button type="submit">Instalar</button></form>' . $reqHtml);
