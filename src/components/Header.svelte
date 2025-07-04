<script lang="ts">
    import { IconArrowLeft } from '@tabler/icons-svelte';
    import type { MouseEventHandler } from 'svelte/elements';

    let { returnClicked, title }
        : { title: string, returnClicked: MouseEventHandler<SVGSVGElement> | undefined } = $props();
</script>
<div class="flex items-center">
    <IconArrowLeft class="w-6 rounded-lg hover:bg-gray-100" onclick={returnClicked}/>
    <div class="flex flex-col w-full text-center grow">
        <span class="text-xs text-gray-500">NWPU 教务助手</span>
        <h1 class="text-lg! m-0! w-full text-center">{title}</h1>
    </div>
    <div class="w-6"></div>
</div>