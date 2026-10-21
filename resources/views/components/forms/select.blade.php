@props(['label' => null, 'name'])

<div class="field">
    @if ($label)<label for="{{ $name }}">{{ $label }}</label>@endif
    <select id="{{ $name }}" name="{{ $name }}" {{ $attributes }}>{{ $slot }}</select>
</div>
