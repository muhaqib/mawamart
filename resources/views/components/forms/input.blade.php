@props(['label' => null, 'name', 'type' => 'text', 'value' => null])

<div class="field">
    @if ($label)<label for="{{ $name }}">{{ $label }}</label>@endif
    <input id="{{ $name }}" name="{{ $name }}" type="{{ $type }}" value="{{ old($name, $value) }}" {{ $attributes }}>
</div>
