<section class="panel">
    <div class="toolbar" style="margin-bottom:14px">
        <h2>{{ $title ?? 'Data' }}</h2>
        {{ $actions ?? '' }}
    </div>
    <div class="table">{{ $slot ?? '' }}</div>
</section>
