<script lang="ts">
    import { onMount } from 'svelte';
    import Header from '../components/Header.svelte';
    import { IconBarcode } from '@tabler/icons-svelte';
    import Loader from '../components/Loader.svelte';
    let { jumpTo } = $props<{ jumpTo: (component: string) => void }>();

    if(window.location.href !== 'https://jwxt.nwpu.edu.cn/student/home') {
        window.location.href = 'https://jwxt.nwpu.edu.cn/student/home';
    }
    let semesterList: {
        id: number,
        name: string
    }[] = $state([{
        id: 0,
        name: '加载中...'
    }]);
    let selectedSemester = $state(0);
    let personId: number | null = null;
    interface IFrameWindow{
        semesters: { nameZh: string, id: number }[],
        personId: number
    }
    const setSemesterData = (semesterData: { nameZh: string, id: number }[], _personId: number) =>{
        semesterList = semesterData.map(item => {
        return {
            name: item.nameZh,
            id: item.id
        };
        }).slice(0, 10);
        selectedSemester = semesterList.length > 0 ? semesterList[0].id : 0;
        personId = _personId;
    };
    onMount(() => {
        let myClassBtn = document.getElementById('drop_14.03');
        myClassBtn?.click();
        const getSemesterData = (iframe: HTMLIFrameElement): [{ nameZh: string, id: number }[], number] | null => {
            const semesterData = (iframe.contentWindow as IFrameWindow | null)?.semesters;
            const personId = (iframe.contentWindow as IFrameWindow | null)?.personId;
            if(!semesterData || !personId) return null;
            return [semesterData, personId];
        };
        const getIFrame = () => {
            const iframe = document.querySelector('iframe[src^="/student/for-std/course-table"]');
            if(!iframe) return null;
            return iframe as HTMLIFrameElement;
        };
        

        const watchData = (iframe: HTMLIFrameElement) => {
            let windowData = getSemesterData(iframe);
            if(windowData) {
                setSemesterData(...windowData);
                handleLoadTextbooks();
            }
            iframe.onload = () => {
                windowData = getSemesterData(iframe);
                if(windowData) {
                    setSemesterData(...windowData);
                    handleLoadTextbooks();
                }
            }
            console.log('Watching data in iframe:', iframe);
        };
        let iframe = getIFrame();
        if(iframe) watchData(iframe);
        else {
            const observer = new MutationObserver(() => {
                iframe = getIFrame();
                if(iframe) {
                    watchData(iframe);
                    observer.disconnect();
                }
            });
            observer.observe(document, {
                childList: true,
                subtree: true
            });
        }

    });
    type OriginalTextBook = {
        nameZh: string,
        isbn: string,
        author: string,
        publishingHouse: string,
        courseName: string
    };
    let textBookLoading = $state(false);
    let textBooks = $state<{ 
        name: string, 
        author: string, 
        isbn: string, 
        publishingHouse: string,
        coursesRequiredBy: string[] }[]>([]);
    interface originalLessonData{
        lessons: {
            course: {
                nameZh: string,
                textbooks: { nameZh: string, isbn: string, author: string, publishingHouse: string, courseName?: string }[]
            }
        }[]
    }
    const handleLoadTextbooks = () => {
        textBookLoading = true;
        textBooks = [];
        const params = new URLSearchParams({
            semesterId: selectedSemester.toString(),
            studentId: personId ? personId.toString() : '0',
            bizTypeId: '2',
            hasExperiment: 'true',
        }).toString();
        const url = `https://jwxt.nwpu.edu.cn/student/for-std/course-table/get-data?${params}`;
        console.log('Fetching textbooks from:', url);
        fetch(url).then(res => res.json())
            .then((data: originalLessonData) => {
                if(!data.lessons) return null;
                textBooks = Object.values(Object.groupBy(data.lessons
                    .flatMap((item) => {
                        const textbooks = item?.course.textbooks || [];
                        textbooks.forEach((textbook) => { textbook.courseName = item.course.nameZh || ''; });
                        return textbooks;
                    })
                    .map((item) => ({
                        name: item.nameZh,
                        author: item.author,
                        isbn: item.isbn,
                        publishingHouse: item.publishingHouse,
                        courseName: item.courseName
                    }))
                    .filter((item) => item.isbn !== '000000'), (item) => item.isbn))
                    .map((value) => {
                        value = value!;
                        let {courseName, ...rest} = value[0];
                        return {...rest, coursesRequiredBy: value.map(item => item.courseName || '')};
                    });
            }).finally(() => {
                textBookLoading = false;
            });
    };
    const exportToCSV = () => {
        if(textBooks.length === 0) return;
        const csvContent = '教材名称,作者,ISBN,出版社,课程\n'
            + textBooks.map(book => 
                `${book.name},${book.author},${book.isbn},${book.publishingHouse},"${book.coursesRequiredBy.join(';')}"`)
                .join('\n');
        const link = document.createElement('a');
        const blob = new Blob(['\ufeff' +csvContent],{ type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `教材清单_${semesterList.filter(item => item.id === selectedSemester)[0].name || ''}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
</script>

<Header title="📖教材查看" returnClicked={() => jumpTo('INDEX')}/>
<select bind:value={selectedSemester} 
    class="border-1 rounded-lg shadow-md py-2 px-2 border-gray-300 focus:outline-none my-3!"
    disabled={textBookLoading || semesterList.length === 0}
    onchange={handleLoadTextbooks}>
    {#each semesterList as semester}
        <option value={semester.id}>{semester.name}</option>
    {/each}
</select>
<button class="bg-blue-500 hover:bg-blue-400 rounded-lg text-white! py-2.5 mt-auto! disabled:bg-gray-300"
    disabled={textBookLoading || textBooks.length === 0}
    onclick={exportToCSV}>导出为 CSV</button>
{#if textBookLoading}
<Loader />
{/if}
<div class="flex flex-col gap-1 max-h-[70vh] overflow-y-auto mt-4" style="scrollbar-color: #8B8B8B transparent !important;">
    {#if !textBookLoading && textBooks.length === 0}
    <p class="w-full text-center text-gray-500 my-auto">无数据</p>
    {/if}
    {#each textBooks as book}
    <div class="bg-white py-1 px-2 rounded-lg shadow-md flex flex-col">
        <h3 class="text-base! font-semibold mb-0!">{book.name}</h3>
        <p class="text-gray-700 text-sm m-0!">{book.author} - {book.publishingHouse}</p>
        <div class="flex items-center">
            <IconBarcode class="w-4"/>
            <p class="text-gray-600 text-sm m-1!" style="font-family:  auto;">{book.isbn}</p>
        </div>
        {#each book.coursesRequiredBy as course}
        <span class="text-xs text-gray-400">{course}</span>
        {/each}
    </div>
    {/each}
</div>