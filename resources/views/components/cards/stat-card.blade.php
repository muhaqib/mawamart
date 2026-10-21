<article class="card">
    @isset($icon)<div class="metric"><span class="tile">{{ $icon }}</span></div>@endisset
    <p class="sub">{{ $label ?? '' }}</p>
    <div class="value">{{ $value ?? '' }}</div>
</article>
