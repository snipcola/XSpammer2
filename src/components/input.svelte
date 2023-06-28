<script>
    import './input.css';

    export let label = 'Input';
    export let placeholder = null;
    export let customClass = '';
</script>

<h3 class='input-label'>{label}</h3>
<input class={`input ${customClass}`} placeholder={placeholder} />