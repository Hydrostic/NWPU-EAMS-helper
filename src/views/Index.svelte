<script lang="ts">
    let { jumpTo } = $props<{ jumpTo: (component: string) => void }>();
</script>

<h1 class="text-lg! m-0! w-full text-center">NWPU 教务助手</h1>
<div class="flex flex-col gap-2 mt-2">
    <div class="flex items-center">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="text-gray-500 px-2 font-medium text-sm">功能区</span>
        <div class="flex-grow border-t border-gray-300"></div>
    </div>
    <button class="text-base! border-1 border-gray-300 rounded-lg py-1 shadow-sm hover:bg-gray-100"
        onclick={() => jumpTo('TEXTBOOK_OVERVIEW')}>
    📖教材查看
    </button>
    <button class="text-base! border-1 border-gray-300 rounded-lg py-1 shadow-sm hover:bg-gray-100 
        disabled:bg-gray-200 disabled:text-gray-500!" 
        disabled
        onclick={() => jumpTo('AUTO_EVALUATION')}>
    💯自动评教
    </button>
</div>

<style>
</style>
