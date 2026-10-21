<form method="POST" action="{{ route('stock-ins.store') }}" class="form-grid">
    @csrf
    {{ $slot ?? '' }}
</form>
