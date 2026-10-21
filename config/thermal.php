<?php

return [
    'auto_print' => env('THERMAL_AUTO_PRINT', false),
    'connector' => env('THERMAL_PRINTER_CONNECTOR', 'windows'),
    'printer_name' => env('THERMAL_PRINTER_NAME', 'X58MP'),
    'baud' => (int) env('THERMAL_PRINTER_BAUD', 9600),
    'width' => (int) env('THERMAL_PRINTER_WIDTH', 32),
    'ip' => env('THERMAL_PRINTER_IP'),
    'port' => (int) env('THERMAL_PRINTER_PORT', 9100),
];
