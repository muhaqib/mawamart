@extends('layouts.auth')

@section('title', 'Atur Ulang Kata Sandi - Mawa Mart')

@section('content')
    <main class="auth">
        <section class="login">
            <div class="logo">
                <span class="drop">@include('partials.icon', ['name' => 'key'])</span>
                <div><h1>Atur Ulang Kata Sandi</h1><p>Pengaturan ulang kata sandi dilakukan melalui menu Manajemen Kasir.</p></div>
            </div>
        </section>
    </main>
@endsection
