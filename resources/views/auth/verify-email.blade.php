@extends('layouts.auth')

@section('title', 'Verifikasi Email - Dalwa Water')

@section('content')
    <main class="auth">
        <section class="login">
            <div class="logo">
                <span class="drop">@include('partials.icon', ['name' => 'check'])</span>
                <div><h1>Verifikasi Email</h1><p>Sistem ini memakai username untuk login operasional.</p></div>
            </div>
        </section>
    </main>
@endsection
