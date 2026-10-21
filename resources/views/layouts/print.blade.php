<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Print - Dalwa Water')</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    @php
        $layout = $receiptLayout ?? [
            'page_css' => '80mm 1000mm',
            'receipt_width' => '80mm',
            'receipt_padding' => '18px',
            'font_size' => '12px',
            'line_height' => '18px',
        ];
    @endphp
    <style>
        @page{size:{{ $layout['page_css'] }};margin:0}
        *{box-sizing:border-box;letter-spacing:0}
        body{margin:0;background:#111a2c;color:#f8fafc;font-family:"DM Sans",ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:21px}
        .wrap{min-height:100vh;padding:32px 24px;background:linear-gradient(180deg,#111a2c 0%,#172033 100%)}
        .preview-shell{display:grid;grid-template-columns:minmax(300px,380px) minmax(0,1fr);gap:22px;align-items:start;max-width:1180px;margin:0 auto}
        .panel{position:sticky;top:24px;border:1px solid #2d3b55;border-radius:8px;background:#172033;box-shadow:none;padding:22px}
        .panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .panel h1{margin:0;color:#fff;font-size:24px;line-height:32px;font-weight:700}
        .panel p{margin:4px 0 0;color:#8ea7d0;font-size:15px}
        .print-size{display:grid;gap:10px;margin-top:18px}
        .print-size label{color:#8ea7d0;font-size:13px;font-weight:700}
        .print-size select{width:100%;min-height:46px;border:1px solid #2d3b55;border-radius:8px;background:#172033;color:#f8fafc;padding:11px 14px;font-size:14px;font-weight:700;outline:none}
        .print-size select:focus{border-color:#5d87ff}
        .meta{display:grid;gap:0;margin:22px 0;padding:0;border:1px solid #2d3b55;border-radius:8px;background:#1a2538;overflow:hidden}
        .meta-row{display:flex;align-items:center;justify-content:space-between;gap:16px;color:#8ea7d0;font-size:14px;font-weight:700;padding:14px 16px;border-bottom:1px solid #2d3b55}
        .meta-row:last-child{border-bottom:0}
        .meta-row strong{color:#fff;text-align:right}
        .size-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:16px 0}
        .size-link{border:1px solid #2d3b55;border-radius:8px;background:#172033;color:#f8fafc;padding:12px;text-align:center;font-weight:700;text-decoration:none;transition:.16s ease}
        .size-link:hover{border-color:#5d87ff;color:#7ea0ff;background:#1c2b47}
        .size-link.active{border-color:#5d87ff;background:#243b69;color:#7ea0ff}
        .actions{display:grid;grid-template-columns:1fr;gap:10px;margin-top:18px}
        .btn{min-height:46px;border:1px solid #2d3b55;border-radius:8px;background:#172033;color:#f8fafc;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 14px;font-size:14px;line-height:20px;font-weight:700;text-decoration:none;cursor:pointer;transition:.16s ease}
        .btn:hover{border-color:#5d87ff;color:#7ea0ff;background:#1c2b47}
        .btn.primary{background:#5d87ff;border-color:#5d87ff;color:white}
        .btn.primary:hover{background:#4f78ef;color:white}
        .btn.compact{min-height:38px;padding:8px 14px;white-space:nowrap}
        .btn.full{grid-column:1/-1}
        .rawbt-action{display:none}
        .rawbt-action.show{display:inline-flex}
        .hint{margin-top:14px;border:1px solid #2d3b55;border-radius:8px;background:#1a2538;color:#8ea7d0;padding:12px 14px;font-size:13px;font-weight:700}
        .notice{border-radius:8px;margin:0 0 12px;padding:12px 14px;font-size:13px;font-weight:700}.notice.ok{background:#0f3f3a;color:#2dd4bf}.notice.warn{background:#3c2f16;color:#fbbf24}
        .paper-stage{min-width:0;display:grid;justify-items:center;padding:28px;border:1px solid #2d3b55;border-radius:8px;background:#172033;box-shadow:none}
        .receipt{width:{{ $layout['receipt_width'] }};max-width:100%;background:white;border:1px dashed #8ea7d0;padding:{{ $layout['receipt_padding'] }};font-family:"Courier New",monospace;font-size:{{ $layout['font_size'] }};line-height:{{ $layout['line_height'] }};box-shadow:0 18px 40px rgba(0,0,0,.28);color:#111827}
        .receipt h3{text-align:center;margin:0 0 4px;font-size:1.15em;line-height:1.45}.receipt p{text-align:center;margin:0 0 8px}.receipt hr{border:0;border-top:1px dashed #dfe5ef;margin:10px 0}.line{display:flex;justify-content:space-between;gap:12px;margin:5px 0}.line span:first-child{min-width:0}.line span:last-child,.line strong:last-child{text-align:right}.muted{color:#5a6a85}
        .thermal-receipt{overflow-wrap:normal;word-break:normal}.thermal-pre{display:block;margin:0;padding-bottom:10mm;white-space:pre;overflow:visible;font:inherit;color:inherit;break-inside:avoid;page-break-inside:avoid}.thermal-line{display:block;white-space:pre;tab-size:4}.thermal-feed{display:block;height:16px}.thermal-separator{display:block;white-space:pre;color:#5a6a85}.thermal-item{display:block;margin:6px 0 0}.thermal-money{display:block;text-align:right;font-weight:700}.thermal-summary{display:block;white-space:pre}
        @media (max-width:900px){.wrap{padding:14px}.preview-shell{grid-template-columns:1fr}.panel{position:static}.paper-stage{padding:16px}.actions{grid-template-columns:1fr}}
        @media print{html,body{width:{{ $layout['receipt_width'] }};min-width:{{ $layout['receipt_width'] }};height:auto;min-height:1000mm;background:white;overflow:visible}.wrap{display:block;min-height:0;padding:0}.preview-shell{display:block;max-width:none;margin:0}.panel,.notice{display:none!important}.paper-stage{display:block;border:0;border-radius:0;background:white;box-shadow:none;padding:0;margin:0}.receipt{display:block;border:0;box-shadow:none;width:{{ $layout['receipt_width'] }};max-width:none;padding:{{ $layout['receipt_padding'] }};margin:0;break-inside:avoid;page-break-inside:avoid}}
    </style>
</head>
<body>
    @yield('content')
</body>
</html>
