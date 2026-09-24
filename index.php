<?php
// ============================================================
// SUHAILA BIRTHDAY 2026 — REAL SERVER-SIDE ACCESS GATE
// Password accepted: S or s (case-insensitive). Other characters
// are allowed in the field but are intentionally rejected.
// ============================================================

$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

const PASSWORD_HASH = '$2y$12$sYdaTZe1KcMe6zf3jO3X2uaOAfdAMjcjLuz0uRQkVihPgIgLDwLz6';
const MAX_ATTEMPTS = 8;

if (isset($_SESSION['suhaila_auth']) && $_SESSION['suhaila_auth'] === true) {
    define('SUHAILA_INTERNAL', true);
    require __DIR__ . '/private/site.php';
    exit;
}

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('X-Robots-Tag: noindex, nofollow, noarchive');

$error = '';
$attempts = (int)($_SESSION['suhaila_attempts'] ?? 0);
$lockedUntil = (int)($_SESSION['suhaila_locked_until'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($lockedUntil > time()) {
        $error = 'المحاولة متوقفة مؤقتًا. حاول مرة أخرى بعد قليل.';
    } else {
        $raw = isset($_POST['access_code']) ? (string)$_POST['access_code'] : '';
        $value = trim($raw);
        $normalized = function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);

        // The field accepts any letters/numbers/symbols. Only S/s is valid.
        if ($normalized !== 's' || !password_verify($normalized, PASSWORD_HASH)) {
            $attempts++;
            $_SESSION['suhaila_attempts'] = $attempts;
            if ($attempts >= MAX_ATTEMPTS) {
                $_SESSION['suhaila_locked_until'] = time() + 20;
                $error = 'تعذر فتح التجربة بهذه البيانات.';
            } else {
                $error = 'تعذر فتح التجربة بهذه البيانات.';
            }
        } else {
            session_regenerate_id(true);
            $_SESSION['suhaila_auth'] = true;
            $_SESSION['suhaila_auth_time'] = time();
            unset($_SESSION['suhaila_attempts'], $_SESSION['suhaila_locked_until']);
            header('Location: ' . strtok($_SERVER['REQUEST_URI'] ?? '/', '?'));
            exit;
        }
    }
}
?>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
<meta name="theme-color" content="#080706">
<title>Private Experience</title>
<style>
:root{--bg:#080706;--panel:#12100d;--panel2:#18130f;--gold:#d8b878;--gold2:#f4dfad;--cream:#fff8ec;--muted:#b8aa97;--wine:#6f3548;--danger:#d7959f}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:radial-gradient(circle at 50% 35%,#211910 0,#0d0a08 45%,#040403 100%);color:var(--cream);font-family:Georgia,"Times New Roman",serif}body{overflow:hidden}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.5;background:radial-gradient(circle at 50% 50%,transparent 0 38%,rgba(0,0,0,.55) 100%),repeating-linear-gradient(135deg,transparent 0 34px,rgba(216,184,120,.018) 35px 36px,transparent 37px 70px)}
.gate{min-height:100svh;display:grid;place-items:center;padding:24px;position:relative;isolation:isolate}
.aura{position:absolute;width:min(90vw,720px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(216,184,120,.12),transparent 64%);filter:blur(3px);animation:breathe 4.5s ease-in-out infinite}
.frame{position:absolute;inset:20px;border:1px solid rgba(216,184,120,.12);pointer-events:none}.frame:before,.frame:after{content:"";position:absolute;inset:14px;border:1px solid rgba(216,184,120,.07);pointer-events:none}.frame:after{inset:auto 50% 14px;width:1px;height:55px;background:linear-gradient(transparent,rgba(216,184,120,.3),transparent)}
.card{width:min(500px,94vw);position:relative;padding:48px 42px 40px;text-align:center;background:linear-gradient(145deg,rgba(28,22,17,.98),rgba(10,9,7,.98));border:1px solid rgba(216,184,120,.34);box-shadow:0 45px 120px rgba(0,0,0,.62),inset 0 0 0 1px rgba(255,255,255,.025);overflow:hidden;animation:cardIn .9s cubic-bezier(.2,.8,.2,1) both}
.card:before{content:"";position:absolute;inset:10px;border:1px solid rgba(216,184,120,.13);pointer-events:none}.card:after{content:"";position:absolute;left:-30%;top:-60%;width:35%;height:220%;background:linear-gradient(90deg,transparent,rgba(255,244,211,.12),transparent);transform:rotate(18deg);animation:sweep 5.5s ease-in-out infinite}
.ornament{font-size:26px;letter-spacing:12px;color:rgba(216,184,120,.65);margin-bottom:22px;position:relative}.seal{width:86px;height:86px;margin:0 auto 24px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 28%,#fff4ce,#d7b36f 55%,#78562d 100%);color:#503a20;box-shadow:0 0 0 7px rgba(216,184,120,.05),0 20px 45px rgba(0,0,0,.5);position:relative}.seal:before,.seal:after{content:"";position:absolute;inset:9px;border:1px solid rgba(80,58,32,.35);border-radius:50%}.seal span{font-size:31px;font-weight:bold;border:1px solid rgba(80,58,32,.3);width:54px;height:54px;border-radius:50%;display:grid;place-items:center}
.kicker{margin:0 0 11px;color:var(--gold);font-size:10px;letter-spacing:.32em;direction:ltr}.title{margin:0;color:var(--cream);font-size:39px;font-weight:400;line-height:1.25}.copy{margin:12px auto 30px;color:var(--muted);font-size:16px;line-height:1.9;max-width:380px}
.form{position:relative;z-index:2}.field{position:relative;width:100%;margin:0 auto 17px}.field input{width:100%;height:72px;border:1px solid rgba(216,184,120,.34);outline:none;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.02));color:#fff;text-align:center;font-size:28px;letter-spacing:.32em;padding:0 24px;box-shadow:inset 0 0 25px rgba(216,184,120,.025),0 16px 35px rgba(0,0,0,.18);transition:.3s}.field input::placeholder{color:rgba(255,248,236,.2);letter-spacing:.35em}.field input:focus{border-color:var(--gold);box-shadow:0 0 0 4px rgba(216,184,120,.08),0 18px 45px rgba(0,0,0,.25)}.field input.shake{animation:shake .45s ease}
.submit{width:100%;height:56px;border:1px solid rgba(216,184,120,.45);background:linear-gradient(135deg,#5c4930,#2c2118 60%,#17110d);color:#fff6e3;font-size:17px;cursor:pointer;letter-spacing:.02em;box-shadow:0 18px 40px rgba(0,0,0,.3);transition:.3s}.submit:hover{transform:translateY(-2px);border-color:rgba(244,223,173,.75);box-shadow:0 24px 48px rgba(0,0,0,.38)}.submit:active{transform:translateY(0)}
.error{min-height:23px;margin:12px 0 0;color:var(--danger);font-size:14px;opacity:0;transition:.25s}.error.show{opacity:1}.bottom{margin-top:22px;color:rgba(216,184,120,.45);font-size:11px;letter-spacing:.22em;direction:ltr}.corner{position:absolute;color:rgba(216,184,120,.32);font-size:28px}.c1{top:18px;right:22px}.c2{top:18px;left:22px;transform:scaleX(-1)}.c3{bottom:18px;right:22px;transform:rotate(180deg)}.c4{bottom:18px;left:22px;transform:rotate(180deg) scaleX(-1)}
@keyframes breathe{50%{transform:scale(1.12);opacity:.65}}@keyframes cardIn{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:none}}@keyframes sweep{0%,55%{transform:translateX(-160vw) rotate(18deg)}78%,100%{transform:translateX(420vw) rotate(18deg)}}@keyframes shake{25%{transform:translateX(-9px)}50%{transform:translateX(9px)}75%{transform:translateX(-5px)}}
@media(max-width:560px){.card{padding:39px 22px 31px}.title{font-size:32px}.copy{font-size:15px}.field input{height:64px;font-size:24px}.frame{inset:11px}.frame:before{inset:9px}}
</style>
</head>
<body>
<main class="gate">
  <div class="aura"></div><div class="frame"></div>
  <section class="card" aria-labelledby="gateTitle">
    <span class="corner c1">❧</span><span class="corner c2">❧</span><span class="corner c3">❧</span><span class="corner c4">❧</span>
    <div class="ornament">❧ ❦ ❧</div>
    <div class="seal"><span>❦</span></div>
    <p class="kicker">PRIVATE EXPERIENCE · 20.09.2026</p>
    <h1 id="gateTitle" class="title">التجربة الخاصة</h1>
    <p class="copy">هذه الصفحة مقفولة. أدخل رمز الدخول لفتح التجربة كاملة.</p>
    <form class="form" method="post" autocomplete="off" novalidate>
      <div class="field">
        <input id="accessCode" name="access_code" type="password" inputmode="text" maxlength="64" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="••••••" aria-label="رمز الدخول" autofocus>
      </div>
      <button class="submit" type="submit">فتح التجربة</button>
      <div class="error<?= $error ? ' show' : '' ?>" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    </form>
    <div class="bottom">A PRIVATE LITTLE SURPRISE</div>
  </section>
</main>
<script>
const input=document.getElementById('accessCode');
input?.addEventListener('input',()=>document.querySelector('.error')?.classList.remove('show'));
input?.addEventListener('keydown',e=>{if(e.key==='Enter')return;});
<?php if($error): ?>
input?.focus();input?.select();input?.classList.add('shake');
<?php endif; ?>
</script>
</body>
</html>
