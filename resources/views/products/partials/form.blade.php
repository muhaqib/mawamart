<form method="POST" action="{{ $action ?? route('products.store') }}" class="form-grid">
    @csrf
    @isset($method) @method($method) @endisset
    {{ $slot ?? '' }}
</form>
