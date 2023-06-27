<script lang='ts'>
    import './input.css';

    export let label: string = 'Input';
    export let placeholder: string = null;

    export let size: 'sm' | 'md' | 'lg' = 'sm';
    export let customClass: string = '';
</script>

<h3 class='input-label'>{label}</h3>
<input class={`input size-${size} ${customClass}`} placeholder={placeholder} />