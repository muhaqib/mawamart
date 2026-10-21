@props(['label' => null, 'name', 'value' => null])

<div class="field">
    @if ($label)<label for="{{ $name }}">{{ $label }}</label>@endif
    <textarea id="{{ $name }}" name="{{ $name }}" {{ $attributes }}>{{ old($name, $value) }}</textarea>
</div>
