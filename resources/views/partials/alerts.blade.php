@if (session('success'))
    <div class="notice ok">{{ session('success') }}</div>
@endif

@if (isset($errors) && $errors->any())
    <div class="notice err">{{ $errors->first() }}</div>
@endif
