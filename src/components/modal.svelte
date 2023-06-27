<script lang='ts'>
    import './modal.css';

    export let active = true;
</script>

<div class={`modal ${active && 'modal-active'}`}>
    <div class='container'>
        <div class='modal-content'>
            <slot />
        </div>
        <slot name='footer' />
    </div>
</div>