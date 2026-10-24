const childProcess = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
const fallbackConfigPath = path.join(__dirname, 'config.example.json');
const config = JSON.parse(fs.readFileSync(fs.existsSync(configPath) ? configPath : fallbackConfigPath, 'utf8'));
const port = Number(config.port || 9123);
const connector = String(config.connector || 'serial');
const printer = String(config.printer || '');
const baud = Number(config.baud || 9600);
const width = Math.max(24, Math.min(42, Number(config.width || 32)));

function plain(value = '') {
    return String(value ?? '')
        .normalize('NFKD')
        .replace(/[^\x20-\x7E]/g, '')
        .trim();
}

function money(value) {
    return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function divider() {
    return `${'-'.repeat(width)}\n`;
}

function row(left, right) {
    const cleanLeft = plain(left);
    const cleanRight = plain(right);

    if (cleanLeft.length + cleanRight.length >= width) {
        return `${cleanLeft}\n${cleanRight.padStart(width, ' ')}\n`;
    }

    return `${cleanLeft}${' '.repeat(width - cleanLeft.length - cleanRight.length)}${cleanRight}\n`;
}

function wrap(value) {
    const text = plain(value);
    const lines = [];
    let remaining = text;

    while (remaining.length > width) {
        let index = remaining.lastIndexOf(' ', width);

        if (index <= 0) {
            index = width;
        }

        lines.push(remaining.slice(0, index).trim());
        remaining = remaining.slice(index).trim();
    }

    if (remaining) {
        lines.push(remaining);
    }

    return lines.length ? lines : [''];
}

function enabled(settings, key) {
    return String(settings?.[key] ?? '0') === '1';
}

function paymentType(type) {
    if (type === 'cash') return 'Tunai';
    if (type === 'transfer') return 'Transfer';

    return '-';
}

function text(value) {
    return Buffer.from(value, 'ascii');
}

function buildReceipt(payload) {
    const settings = payload.settings || {};
    const transaction = payload.transaction || {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    const chunks = [];
    const push = (value) => chunks.push(Buffer.isBuffer(value) ? value : text(value));

    push(Buffer.from([0x1b, 0x40]));
    push(Buffer.from([0x1b, 0x61, 0x01]));
    push(Buffer.from([0x1b, 0x45, 0x01]));
    push(`${plain(settings.receipt_store_name || 'TOKO MAWA')}\n`);
    push(Buffer.from([0x1b, 0x45, 0x00]));

    [settings.receipt_address_line_1, settings.receipt_address_line_2].forEach((line) => {
        wrap(line || '').forEach((wrapped) => {
            if (wrapped) push(`${wrapped}\n`);
        });
    });

    if (settings.receipt_phone) {
        push(`${plain(settings.receipt_phone)}\n`);
    }

    push(divider());
    push(Buffer.from([0x1b, 0x61, 0x00]));
    push(row('No', transaction.code || '-'));
    push(row('Tanggal', transaction.created_at || '-'));

    if (enabled(settings, 'receipt_show_cashier')) {
        push(row('Kasir', transaction.cashier || '-'));
    }

    if (enabled(settings, 'receipt_show_customer') && transaction.customer_name) {
        push(row('Pembeli', transaction.customer_name));
    }

    if (transaction.status === 'void') {
        push(row('Status', 'BATAL'));
    }

    push(divider());

    items.forEach((item) => {
        wrap(item.name || 'Produk').forEach((line) => push(`${line}\n`));
        push(row(`${Number(item.qty || 0)} x ${money(item.price)}`, money(item.subtotal)));
    });

    push(divider());
    push(row('Sub Total', money(transaction.subtotal)));

    if (Number(transaction.discount_total || 0) > 0) {
        push(row('Diskon', money(transaction.discount_total)));
    }

    push(Buffer.from([0x1b, 0x45, 0x01]));
    push(row('Total', money(transaction.total)));
    push(Buffer.from([0x1b, 0x45, 0x00]));

    if (enabled(settings, 'receipt_show_payment')) {
        push(row('Status', transaction.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'));
        push(row('Metode', paymentType(transaction.payment_type)));

        if (transaction.payment_status === 'paid') {
            push(row('Diterima', money(transaction.uang_diterima)));
            push(row('Kembali', money(transaction.kembalian)));
        }
    }

    push(divider());
    push(Buffer.from([0x1b, 0x61, 0x01]));

    [settings.receipt_footer_line_1, settings.receipt_footer_line_2, settings.receipt_footer_line_3].forEach((line) => {
        wrap(line || '').forEach((wrapped) => {
            if (wrapped) push(`${wrapped}\n`);
        });
    });

    push('\n\n\n');
    push(Buffer.from([0x1d, 0x56, 0x00]));

    return Buffer.concat(chunks);
}

function psQuote(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

function writeSerial(buffer) {
    if (!printer) {
        throw new Error('Printer belum dikonfigurasi di config.json.');
    }

    const comName = printer.replace(/^\\\\\.\\/, '').replace(/:$/, '').toUpperCase();
    const dataFile = path.join(os.tmpdir(), `mawa-print-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`);
    const scriptFile = path.join(os.tmpdir(), `mawa-print-${Date.now()}-${Math.random().toString(16).slice(2)}.ps1`);

    fs.writeFileSync(dataFile, buffer);
    fs.writeFileSync(scriptFile, [
        "$ErrorActionPreference = 'Stop'",
        `$bytes = [System.IO.File]::ReadAllBytes(${psQuote(dataFile)})`,
        `$serial = New-Object System.IO.Ports.SerialPort ${psQuote(comName)}, ${baud}, 'None', 8, 'One'`,
        '$serial.WriteTimeout = 5000',
        '$serial.ReadTimeout = 5000',
        '$serial.Open()',
        '$serial.Write($bytes, 0, $bytes.Length)',
        '$serial.Close()',
    ].join('\n'));

    try {
        childProcess.execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptFile], { stdio: 'pipe' });
    } finally {
        fs.rmSync(dataFile, { force: true });
        fs.rmSync(scriptFile, { force: true });
    }
}

function writePrinter(buffer) {
    if (!printer) {
        throw new Error('Printer belum dikonfigurasi di config.json.');
    }

    if (connector === 'serial') {
        writeSerial(buffer);
        return;
    }

    fs.writeFileSync(printer, buffer);
}

function sendJson(response, status, body) {
    response.writeHead(status, {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Private-Network': 'true',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    });
    response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
    if (request.method === 'OPTIONS') {
        sendJson(response, 204, {});
        return;
    }

    if (request.method !== 'POST' || request.url !== '/print') {
        sendJson(response, 404, { ok: false, message: 'Endpoint tidak ditemukan.' });
        return;
    }

    let body = '';
    request.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1024 * 1024) {
            request.destroy();
        }
    });

    request.on('end', () => {
        try {
            writePrinter(buildReceipt(JSON.parse(body || '{}')));
            sendJson(response, 200, { ok: true });
        } catch (error) {
            sendJson(response, 500, { ok: false, message: error.message });
        }
    });
});

server.listen(port, '127.0.0.1', () => {
    console.log(`Toko Mawa local print agent aktif di http://127.0.0.1:${port}/print`);
    console.log(`Connector: ${connector}`);
    console.log(`Target printer: ${printer}`);
});
