<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        config([
            'thermal.auto_print' => false,
            'thermal.connector' => 'file',
            'thermal.printer_name' => storage_path('framework/testing/thermal-receipt.prn'),
        ]);
    }
}
