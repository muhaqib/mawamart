<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <title>Masuk - Mawa Mart</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        (() => {
            const stored = window.localStorage.getItem('mawa-theme') || window.localStorage.getItem('dalwa-theme');
            const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', dark);
        })();
    </script>
    <style>
        :root {
            --bg: color-mix(in oklab, #5d87ff 12%, white);
            --surface: #ffffff;
            --primary: #5d87ff;
            --primary-emphasis: #4a6ccc;
            --lightprimary: color-mix(in oklab, var(--primary) 12%, transparent);
            --secondary: #49beff;
            --border: #dfe5ef;
            --text: #1c2536;
            --muted: #5a6a85bf;
            --white: #ffffff;
            --button-text: #ffffff;
            --error: #ef4444;
            --success: #13a987;
        }

        html.dark {
            --bg: #1c2536;
            --surface: #1c2536;
            --border: #333f55;
            --text: #ffffff;
            --muted: #7c8fac;
            --lightprimary: color-mix(in oklab, var(--primary) 20%, transparent);
        }

        * { box-sizing: border-box; letter-spacing: 0; }

        body {
            margin: 0;
            min-height: 100vh;
            background: var(--bg);
            color: var(--text);
            font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 14px;
            line-height: 21px;
        }

        button, input { font: inherit; }

        .auth-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 24px 16px;
            position: relative;
        }

        .auth-card {
            width: min(450px, 100%);
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 30px;
            position: relative;
            z-index: 1;
        }

        .theme-toggle {
            position: absolute;
            top: 18px;
            right: 18px;
            width: 40px;
            height: 40px;
            border: 0;
            border-radius: 999px;
            background: transparent;
            color: var(--text);
            display: grid;
            place-items: center;
            padding: 0;
            transition: background-color .2s ease, color .2s ease;
        }

        .theme-toggle:hover {
            background: var(--lightprimary);
            color: var(--primary);
        }

        .theme-toggle svg {
            width: 20px;
            height: 20px;
        }

        .brand {
            display: flex;
            justify-content: center;
            margin-bottom: 24px;
        }

        .brand-mark {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            color: var(--primary);
            text-decoration: none;
            text-align: center;
        }

        .brand-logo {
            width: 82px;
            height: 82px;
            object-fit: contain;
            flex: 0 0 auto;
        }

        .brand-text {
            color: var(--primary);
            font-size: 24px;
            font-weight: 700;
            line-height: 32px;
            letter-spacing: 0;
        }

        .field { margin-bottom: 16px; }

        label {
            display: inline-block;
            color: var(--text);
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .input {
            width: 100%;
            height: 40px;
            border: 1px solid var(--border);
            border-radius: 6px;
            background: transparent;
            color: var(--text);
            outline: 0;
            padding: 8px 12px;
            font-size: 14px;
            line-height: 21px;
            transition: border-color .2s ease;
        }

        .input:focus { border-color: var(--primary); }
        .input::placeholder { color: var(--muted); }

        .password-field { position: relative; }
        .password-field .input { padding-right: 42px; }

        .password-toggle {
            position: absolute;
            top: 50%;
            right: 9px;
            transform: translateY(-50%);
            width: 30px;
            height: 30px;
            border: 0;
            border-radius: 6px;
            background: transparent;
            color: var(--muted);
            display: grid;
            place-items: center;
            padding: 0;
        }

        .password-toggle:hover {
            background: var(--lightprimary);
            color: var(--primary);
        }

        .form-options {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin: 20px 0;
            color: var(--text);
            font-size: 14px;
        }

        .remember {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
        }

        .remember input {
            width: 16px;
            height: 16px;
            accent-color: var(--primary);
            flex: 0 0 auto;
        }

        .remember label {
            margin: 0;
            font-weight: 400;
            color: color-mix(in oklab, var(--text) 90%, transparent);
            cursor: pointer;
        }

        .forgot-link {
            color: var(--primary);
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            white-space: nowrap;
        }

        .forgot-link:hover { color: var(--primary-emphasis); }

        .submit-button {
            width: 100%;
            min-height: 40px;
            border: 1px solid var(--primary);
            border-radius: 6px;
            background: var(--primary);
            color: var(--button-text);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 20px;
            font-size: 14px;
            line-height: 21px;
            font-weight: 500;
            transition: background-color .2s ease, border-color .2s ease;
        }

        .submit-button:hover {
            background: var(--primary-emphasis);
            border-color: var(--primary-emphasis);
        }

        .submit-button:disabled {
            cursor: wait;
            opacity: .85;
        }

        .notice {
            border: 1px solid;
            border-radius: 8px;
            font-size: 14px;
            line-height: 21px;
            margin-bottom: 18px;
            padding: 11px 13px;
        }

        .notice.ok {
            background: color-mix(in oklab, var(--success) 12%, white);
            border-color: color-mix(in oklab, var(--success) 32%, white);
            color: #08745f;
        }

        .notice.err {
            background: color-mix(in oklab, var(--error) 10%, white);
            border-color: color-mix(in oklab, var(--error) 28%, white);
            color: #bd2d2d;
        }

        .auth-footer {
            border-top: 1px solid var(--border);
            color: var(--muted);
            font-size: 13px;
            font-weight: 500;
            margin-top: 24px;
            padding-top: 18px;
            text-align: center;
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,.45);
            border-top-color: var(--button-text);
            border-radius: 999px;
            animation: spin .75s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 520px) {
            .auth-page {
                align-items: flex-start;
                padding-top: 28px;
                padding-bottom: 28px;
            }

            .auth-card {
                margin: auto 0;
                padding: 24px 20px;
            }

            .theme-toggle {
                top: 14px;
                right: 14px;
            }

            .brand-logo {
                width: 72px;
                height: 72px;
            }

            .brand-text { font-size: 21px; line-height: 28px; }

            .form-options {
                align-items: flex-start;
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <main class="auth-page">
        <section class="auth-card" aria-label="Form login Mawa Mart">
            <button class="theme-toggle" id="themeToggle" type="button" aria-label="Ganti mode tampilan">
                <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
            </button>

            <div class="brand">
                <a class="brand-mark" href="{{ route('login.form') }}" aria-label="Mawa Mart">
                    <img class="brand-logo" src="{{ asset('images/logo-mawa-mart.png') }}" alt="Logo Mawa Mart">
                    <span class="brand-text">Mawa Mart</span>
                </a>
            </div>

            @include('partials.alerts')

            <form method="POST" action="{{ route('login') }}" class="form" id="loginForm">
                @csrf

                <div class="field">
                    <label for="username">Nama pengguna</label>
                    <input class="input" id="username" name="username" value="{{ old('username') }}" autocomplete="username" required autofocus type="text">
                </div>

                <div class="field">
                    <label for="password">Kata sandi</label>
                    <div class="password-field">
                        <input class="input" id="password" name="password" autocomplete="current-password" required type="password">
                        <button class="password-toggle" aria-label="Tampilkan kata sandi" id="passwordToggle" type="button">
                            <svg id="passwordIconVisible" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:none">
                                <path d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z" stroke="currentColor" stroke-width="1.8"/>
                            </svg>
                            <svg id="passwordIconHidden" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                                <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                                <path d="M9.35 5.56A9.2 9.2 0 0 1 12 5.25c6.25 0 9.75 6.75 9.75 6.75a17.44 17.44 0 0 1-2.44 3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6.52 6.92C3.79 8.75 2.25 12 2.25 12s3.5 6.75 9.75 6.75c1.7 0 3.2-.5 4.48-1.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="form-options">
                    <div class="remember">
                        <input id="remember" name="remember" type="checkbox" value="1">
                        <label for="remember">Ingat perangkat ini</label>
                    </div>
                    <a class="forgot-link" href="#">Lupa kata sandi?</a>
                </div>

                <button id="submitButton" class="submit-button" type="submit">Masuk</button>
            </form>

            <div class="auth-footer">&copy; 2026 Mawa Mart</div>
        </section>
    </main>

    <script>
        const themeToggle = document.getElementById('themeToggle');
        const passwordInput = document.getElementById('password');
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordIconVisible = document.getElementById('passwordIconVisible');
        const passwordIconHidden = document.getElementById('passwordIconHidden');
        const loginForm = document.getElementById('loginForm');
        const submitButton = document.getElementById('submitButton');

        const syncThemeLabel = () => {
            const isDark = document.documentElement.classList.contains('dark');
            themeToggle.setAttribute('aria-label', isDark ? 'Gunakan mode terang' : 'Gunakan mode gelap');
        };

        const syncPasswordIcon = () => {
            const isPassword = passwordInput.type === 'password';
            passwordIconHidden.style.display = isPassword ? 'block' : 'none';
            passwordIconVisible.style.display = isPassword ? 'none' : 'block';
            passwordToggle.setAttribute('aria-label', isPassword ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi');
        };

        syncThemeLabel();
        syncPasswordIcon();

        themeToggle.addEventListener('click', () => {
            const nextDark = !document.documentElement.classList.contains('dark');
            document.documentElement.classList.toggle('dark', nextDark);
            window.localStorage.setItem('mawa-theme', nextDark ? 'dark' : 'light');
            syncThemeLabel();
        });

        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            syncPasswordIcon();
        });

        loginForm.addEventListener('submit', () => {
            submitButton.innerHTML = '<span class="spinner" aria-hidden="true"></span> Memproses...';
            submitButton.disabled = true;
        });
    </script>
</body>
</html>
