@props(['label' => null, 'name', 'checked' => false])

<label class="inline-form">
    <input name="{{ $name }}" type="checkbox" value="1" @checked(old($name, $checked)) {{ $attributes }}>
    <span>{{ $label ?? $slot }}</span>
</label>
