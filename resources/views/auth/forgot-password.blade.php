@extends('layouts.auth')

@section('title', 'Lupa Kata Sandi - Toko Mawa')

@section('content')
    <main class="auth">
        <section class="login">
            <div class="logo">
                <span class="drop">@include('partials.icon', ['name' => 'key'])</span>
                <div><h1>Lupa Kata Sandi</h1><p>Hubungi admin untuk mengatur ulang kata sandi kasir.</p></div>
            </div>
        </section>
    </main>
@endsection
