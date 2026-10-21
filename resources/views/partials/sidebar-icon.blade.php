@props(['name'])

@php
    $icons = [
        'dashboard' => '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
        'transactions' => '<path d="M4 6.5h16v12H4z"/><path d="M4 10h16"/><path d="M16.5 14.25h.01"/>',
        'products' => '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.4 7.7 7.6 4.4 7.6-4.4M12 12.1V21"/>',
        'reports' => '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
        'users' => '<path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20"/><circle cx="10" cy="7" r="4"/><path d="M17 11a3.5 3.5 0 0 1 0 7M18 4.3a3.5 3.5 0 0 1 0 6.4"/>',
        'settings' => '<path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h9M17 18h3"/><circle cx="13" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="18" r="2"/>',
    ];
@endphp

<span class="sidebar-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{!! $icons[$name] ?? $icons['dashboard'] !!}</svg>
</span>
