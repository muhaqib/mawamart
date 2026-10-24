<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Masuk - Toko Mawa')</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        (() => {
            const stored = window.localStorage.getItem('mawa-theme') || window.localStorage.getItem('dalwa-theme');
            const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', dark);
        })();
    </script>
    <style>
        :root{--bg:#f6f9fc;--surface:#fff;--line:#dfe5ef;--text:#1c2536;--muted:#5a6a85bf;--primary:#5d87ff;--psoft:color-mix(in oklab,var(--primary) 12%,transparent);--green:#13deb9;--gsoft:color-mix(in oklab,var(--green) 12%,white);--red:#ef4444;--rsoft:color-mix(in oklab,var(--red) 12%,white);font-family:"DM Sans",ui-sans-serif,system-ui,sans-serif}
        html.dark{--bg:#1c2536;--surface:#1c2536;--line:#333f55;--text:#fff;--muted:#7c8fac;--psoft:color-mix(in oklab,var(--primary) 20%,transparent)}
        *{box-sizing:border-box;letter-spacing:0}body{margin:0;background:var(--bg);color:var(--text);font-family:"DM Sans",ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:21px}button,input{font:inherit}.auth{min-height:100vh;display:grid;place-items:center;padding:24px}.login{width:min(430px,100%);background:var(--surface);border:1px solid transparent;border-radius:12px;padding:28px;box-shadow:0 1px 4px rgba(133,146,173,.2)}.logo{display:flex;align-items:center;gap:12px;margin-bottom:22px}.drop{width:42px;height:42px;border-radius:6px;background:var(--psoft);color:var(--primary);display:grid;place-items:center}.logo h1{font-size:24px;line-height:32px;font-weight:600;margin:0}.logo p{margin:2px 0 0;color:var(--muted);font-size:13px;line-height:20px}.list{display:grid;gap:10px}.field{display:grid;gap:6px}label{font-size:14px;line-height:21px;font-weight:600;color:var(--text)}input{width:100%;min-height:40px;border:1px solid var(--line);border-radius:6px;background:transparent;padding:8px 12px;font-size:14px;line-height:21px}input:focus{border-color:var(--primary);outline:0}.btn{min-height:40px;border:1px solid var(--primary);border-radius:6px;background:var(--primary);color:white;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:9px 20px;font-size:14px;line-height:21px;font-weight:500}.notice{padding:12px 14px;border-radius:6px;margin-bottom:16px;font-size:14px;line-height:21px;font-weight:600}.notice.ok{background:var(--gsoft);color:#08745f}.notice.err{background:var(--rsoft);color:#bd2d2d}.sub{color:var(--muted);margin:0;font-size:13px;line-height:20px}
    </style>
</head>
<body>
    @yield('content')
    <div style="position: absolute; bottom: 24px; left: 0; right: 0; text-align: center; font-size: 13px; color: var(--muted);">
        &copy; 2026 Toko Mawa
    </div>
</body>
</html>
