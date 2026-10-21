<form method="POST" action="{{ $action ?? route('cashiers.store') }}" class="form-grid">
    @csrf
    @isset($method) @method($method) @endisset
    {{ $slot ?? '' }}
</form>
