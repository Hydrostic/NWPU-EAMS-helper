<script lang="ts">
    let { jumpTo } = $props<{ jumpTo: (component: string) => void }>();
    import Header from '../components/Header.svelte';
    import { fly, fade } from "svelte/transition";
    let classesNeedEvaluation: [string, string[]][] = $state([]);
    const getList = () => {

        const tableContent = document.getElementById('pane-first')?.getElementsByClassName("el-table__body")?.[0];
        const list = tableContent?.lastChild?.childNodes;

        return list;
    };
    const judgeListAppear = () => {

        const list = getList();
        if(list && 
            list.values()
                .filter(item => item.nodeType === Node.ELEMENT_NODE).toArray().length > 0){
            return true;
        }
        return false;
    };
    const waitForElement = new Promise<null>((resolve) => {
        if(judgeListAppear()) resolve(null);
        const observer = new MutationObserver(() => {
            if (judgeListAppear()) {
                observer.disconnect();
                resolve(null);
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true
        });
    });
    $effect(() => {
        waitForElement.then(() => {
            const list = getList();
            if (list) {
                classesNeedEvaluation = Array.from(
                    list.values()
                        .filter(listItem => listItem.nodeType === Node.ELEMENT_NODE)
                        .map(listItem => listItem as HTMLElement)
                        .filter(listItem => 
                            (listItem.getElementsByClassName('el-tag')
                                ?.[0] as HTMLElement | undefined)?.innerText.trim() === '未完成')
                        .map(_listItem => {
                            const listItem = _listItem as HTMLElement;
                            const className = listItem.getElementsByTagName('h3')?.[0]?.innerText ?? null;
                            const teachers = Array.from(listItem.getElementsByClassName('teachers')?.[0].children)
                                .map(teacher => (teacher as HTMLElement).innerText.trim());
                            return className !== null ? [className, teachers] as [string, string[]] : null;
                        })
                        .filter((item): item is [string, string[]] => item !== null)
                );
                $state.snapshot(classesNeedEvaluation);
            }
        });
    });
    let view = $state('OVERVIEW');;
</script>
<Header title="💯自动评教" returnClicked={() => jumpTo('INDEX')}/>
{#if view === 'OVERVIEW'}
<div class="my-3" transition:fly = {{ x: -100 }}>
    <span class="text-gray-700">待评教课程</span>
    <ul class="ml-1">
        {#each classesNeedEvaluation as classItem}
            <li class="text-sm text-gray-600 flex">
                <span class="min-w-0 block truncate">{classItem[0]}</span>
                <span>({classItem[1].length})</span>
            </li>
        {/each}
    </ul>
</div>
{:else}

{/if}
<button class="bg-blue-500 hover:bg-blue-400 rounded-lg text-white! py-2.5 mt-auto!" 
    transition:fade
    onclick={() => view === 'OVERVIEW' ? view = 'SETTINGS' : view = 'OVERVIEW'}>
    {view === 'OVERVIEW' ? '评教设置' : '返回概览'}
</button>