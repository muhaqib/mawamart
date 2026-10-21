<?php

namespace App\Services;

use Mike42\Escpos\PrintConnectors\PrintConnector;
use RuntimeException;

class SerialPortPrintConnector implements PrintConnector
{
    private string $buffer = '';

    private bool $finalized = false;

    public function __construct(
        private readonly string $port,
        private readonly int $baud = 9600,
    ) {
        if (! preg_match('/^COM\d+$/i', $this->port)) {
            throw new RuntimeException("Nama port {$this->port} tidak valid.");
        }
    }

    public function __destruct()
    {
        if (! $this->finalized) {
            trigger_error('Print connector belum ditutup. Apakah printer->close() sudah dipanggil?', E_USER_NOTICE);
        }
    }

    public function finalize(): void
    {
        if ($this->finalized) {
            return;
        }

        $dataFile = tempnam(sys_get_temp_dir(), 'escpos-data-');

        if ($dataFile === false) {
            throw new RuntimeException('Gagal membuat file sementara untuk cetak serial.');
        }

        file_put_contents($dataFile, $this->buffer);
        $command = 'cmd /c print /D:'.$this->printDevice().' '.escapeshellarg($dataFile);
        exec($command, $output, $exitCode);

        @unlink($dataFile);

        $this->finalized = true;

        if ($exitCode !== 0) {
            throw new RuntimeException('Gagal mengirim data ke '.$this->port.': '.trim(implode(' ', $output)));
        }
    }

    public function read(int $len): bool|string
    {
        return false;
    }

    public function write(string $data): void
    {
        if ($this->finalized) {
            throw new RuntimeException("Port {$this->port} sudah tertutup.");
        }

        $this->buffer .= $data;
    }

    private function printDevice(): string
    {
        $port = strtoupper($this->port);

        return str_ends_with($port, ':') ? $port : $port.':';
    }
}
