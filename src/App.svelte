<script lang="ts">
import Index from './views/Index.svelte';
import AutoEvaluation from './views/AutoEvaluation.svelte';
import TextbookOverview from './views/TextbookOverview.svelte';
import NWPULogo from './assets/nwpu_logo.svg';
import { IconMinus } from '@tabler/icons-svelte';
const componentMap = {
  'INDEX': Index,
  'AUTO_EVALUATION': AutoEvaluation,
  'TEXTBOOK_OVERVIEW': TextbookOverview
};
type ComponentName = keyof typeof componentMap;
let currentComponentName: ComponentName = 'INDEX';
let CurrentComponent = $state(componentMap[currentComponentName]);
const handleJumpTo = (componentName: string) => {
  if(Object.keys(componentMap).includes(componentName)) {
    CurrentComponent = componentMap[componentName as ComponentName];
  } else {
    console.warn(`Component ${componentName} does not exist.`);
  }
}
let inMinimalMode = $state(import.meta.env.DEV ? false : true);
let isMoving = false;
const handleOnDragStart = (event: MouseEvent) => {
  for (const el of document.getElementsByTagName('iframe')){
    el.style.pointerEvents = 'none';
  }
  const element = document.getElementById('nwpu-eams-helper-dialog');
  const startTime = Date.now();
  let startX = event.clientX;
  let startY = event.clientY;
  let startTop = element?.offsetTop || 0;
  let startRight = element? window.innerWidth - element.offsetLeft - element.offsetWidth : 0;
  const handleMouseMove = (mousemoveEvent: MouseEvent) => {
    console.log('mousemoveEvent', mousemoveEvent);
    if (isMoving) {
      const currentX = mousemoveEvent.clientX;
      const currentY = mousemoveEvent.clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      if (element) {
        (element as HTMLElement).style.top = `${startTop + deltaY}px`;
        (element as HTMLElement).style.right = `${startRight - deltaX}px`;
      }
    }
  };
  const handleMouseUp = (mouseupEvent: MouseEvent) => {
    isMoving = false;
    for (const el of document.getElementsByTagName('iframe')){
      el.style.pointerEvents = 'auto';
    }
    const endTime = Date.now();
    if (endTime - startTime < 1000 && 
        mouseupEvent.clientX === startX && 
        mouseupEvent.clientY === startY) {
      // If the drag is too short, treat it as a click
      inMinimalMode = false;
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
  isMoving = true;
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove);
};
</script>

<main style="font-size: 16px;">
  <div class="fixed top-[55px] right-[10px] {inMinimalMode ? 'p-2' : 'w-80 min-h-60'} rounded-lg shadow-lg bg-white z-[1000] 
    transition-[width,height] duration-200 select-none"
    id="nwpu-eams-helper-dialog">
    <!-- Draggable area-->
    <div class="text-xs text-gray-500 w-full h-9 mb-2 relative transition-none cursor-move" 
      onmousedown={handleOnDragStart} style={inMinimalMode ? 'display: none;' : ''}>
      <span class="absolute top-[50%] -translate-y-1/2 left-4">NWPU 教务助手</span>
      <div class="absolute top-[50%] -translate-y-1/2 right-4 w-6 rounded-lg hover:bg-gray-100 cursor-auto"
        onmousedown={(e) => e.stopPropagation()}
        onmouseup={(e) => e.stopPropagation()}>
        <IconMinus class="w-6" onclick={() => inMinimalMode = true}/>
      </div>
    </div>
    <div class="px-5 flex flex-col overflow-x-hidden transition-none" style={inMinimalMode ? 'display: none;' : ''}>
      <CurrentComponent jumpTo={handleJumpTo}/>
    </div>
    <img src={NWPULogo} class="w-10 h-10 cursor-move" alt="nwpu-eams-helper-logo" 
      onmousedown={handleOnDragStart}
      draggable="false"
      style={inMinimalMode ? '' : 'display: none;'} />
  </div>
  <!-- <div class="fixed right-0 top-0 bg-white rounded-lg shadow-lg z-[1000] p-2">
  </div> -->
</main>
<style>
</style>
