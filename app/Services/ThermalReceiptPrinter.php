<?php

namespace App\Services;

use App\Models\Transaction;
use InvalidArgumentException;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\PrintConnectors\PrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;
use RuntimeException;

class ThermalReceiptPrinter
{
    public function __construct(private readonly ThermalReceiptText $receiptText) {}

    public function print(Transaction $transaction, bool $force = false): void
    {
        if (! $force && ! config('thermal.auto_print')) {
            return;
        }

        $transaction->loadMissing(['user', 'details.product']);

        $printer = new Printer($this->connector());

        try {
            $this->writeReceipt($printer, $transaction);
        } finally {
            $printer->close();
        }
    }

    private function connector(): PrintConnector
    {
        $connector = strtolower((string) config('thermal.connector', 'windows'));
        $printerName = (string) config('thermal.printer_name', '');

        return match ($connector) {
            'network' => $this->networkConnector(),
            'serial' => $this->serialConnector($printerName),
            'file' => new FilePrintConnector($printerName),
            'windows' => $this->windowsConnector($printerName),
            default => throw new InvalidArgumentException("Konektor printer thermal '{$connector}' tidak didukung."),
        };
    }

    private function serialConnector(string $printerName): SerialPortPrintConnector
    {
        if ($printerName === '') {
            throw new RuntimeException('THERMAL_PRINTER_NAME belum diisi.');
        }

        return new SerialPortPrintConnector($printerName, (int) config('thermal.baud', 9600));
    }

    private function networkConnector(): NetworkPrintConnector
    {
        $ip = config('thermal.ip');

        if (! $ip) {
            throw new RuntimeException('THERMAL_PRINTER_IP belum diisi.');
        }

        return new NetworkPrintConnector((string) $ip, (int) config('thermal.port', 9100));
    }

    private function windowsConnector(string $printerName): WindowsPrintConnector
    {
        if ($printerName === '') {
            throw new RuntimeException('THERMAL_PRINTER_NAME belum diisi.');
        }

        return new WindowsPrintConnector($printerName);
    }

    private function writeReceipt(Printer $printer, Transaction $transaction): void
    {
        $printer->initialize();
        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $printer->text($this->receiptText->text($transaction)."\n");
        $printer->feed(1);
        $printer->cut(Printer::CUT_PARTIAL);
    }
}
