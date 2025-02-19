<template>
  <a-auto-complete
    autofocus
    allow-clear
    class="auto-complete"
    :options="options"
    placeholder="输入地名进行搜索"
    :style="position"
    :status="status"
    @search="onSearch"
    @select="onSelect"
  >
    <template #option="item">
      <a-list-item>
        <a-list-item-meta>
          <template #title>
            <p class="ellipsis" :title="item.value">
              {{ item.value }}
            </p>
          </template>
          <template v-if="typeof item.address === 'string'" #description>
            <p class="ellipsis" :title="item.address">
              {{ item.address }}
            </p>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-auto-complete>

  <a-map-marker
    v-if="selectedPos?.length"
    auto-fit-view
    :position="selectedPos"
  />
</template>

<script setup lang="ts">
import { assistantService } from '@/services';
import { ref } from 'vue';
import { Tip } from '@/model/inputtips';
import { debounce } from '@rthx/utils';

defineOptions({ name: 'AutoComplete' });
defineProps({
  position: {
    type: Object,
    default: () => ({ top: '40px', left: '90px' }),
  },
});

const selectedPos = ref<AMap.Vector2>(null);
const options = ref<(Tip & { value: string })[]>([]);
const status = ref<'warning' | 'error' | ''>('');

const onSearch = debounce(async (keywords: string) => {
  if (!keywords) return;

  try {
    status.value = 'warning';
    const tips = await assistantService.inputtips({ keywords });
    options.value = tips.map((el) => Object.assign(el, { value: el.name }));
    status.value = '';
  } catch (e) {
    status.value = 'error';
    throw e;
  }
}, 1000);

const onSelect = (e, { location }) => {
  selectedPos.value = location.split(',');
};
</script>

<style lang="less">
.auto-complete {
  position: absolute;
  z-index: 1;
  width: 300px;
}
</style>
