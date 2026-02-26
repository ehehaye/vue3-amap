<template>
  <div>
    <a-space :size="8">
      <a-dropdown>
        <template #overlay>
          <a-menu @click="handleAdd">
            <a-menu-item key="circle"> 圆形围栏 </a-menu-item>
            <a-menu-item key="polygon"> 多边形围栏 </a-menu-item>
          </a-menu>
        </template>
        <a-button type="primary">
          新建围栏
          <DownOutlined />
        </a-button>
      </a-dropdown>

      <a-popconfirm title="是否确定删除选中围栏？" @confirm="handleDelete">
        <a-button danger :disabled="!state.selectedRowKeys.length">
          删除{{
            state.selectedRowKeys.length
              ? `(x${state.selectedRowKeys.length})`
              : ''
          }}
        </a-button>
      </a-popconfirm>

      <a-button
        :disabled="state.selectedRowKeys.length !== 1"
        @click="handleEdit"
      >
        编辑
      </a-button>

      <a-button :disabled="!state.dataSource.length" @click="handlePreview">
        预览 {{ countOfPreview ? `(x${countOfPreview})` : '' }}
      </a-button>

      <a-button @click="handleSearch"> 刷新 </a-button>
    </a-space>

    <br /><br />

    <a-table
      bordered
      row-key="gfid"
      :columns
      :data-source="state.dataSource"
      :row-selection="{
        selectedRowKeys: state.selectedRowKeys,
        onChange: onSelectChange,
      }"
      :pagination="false"
      :scroll="{ y: 'calc(100vh - 300px)' }"
    />
  </div>
</template>

<script setup lang="ts">
import { geoFenceService } from '@/services';
import { reactive, ref, onActivated, onBeforeMount, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { RouteEnum } from '@/router/enum';
import { Fence } from '@/model/fence';

defineOptions({ name: 'Manage' });

const router = useRouter();
const route = useRoute();

const columns = ref([
  {
    title: '名称',
    dataIndex: 'name',
    width: 240,
  },
  {
    title: '描述',
    dataIndex: 'desc',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 100,
    customRender: ({ text }) => (text === 'circle' ? '圆形' : '多边形'),
  },
  {
    title: '创建时间',
    dataIndex: 'createtime',
    width: 200,
    customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: '更新时间',
    dataIndex: 'modifytime',
    width: 200,
    customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
  },
]);

const state = reactive({
  dataSource: [] as Fence[],
  selectedRows: [] as Fence[],
  selectedRowKeys: [] as Fence['gfid'][],
});

const countOfPreview = computed(
  () => state.selectedRowKeys.length || state.dataSource.length,
);

const handleSearch = async () => {
  const { results } = await geoFenceService.list();
  Object.assign(state, {
    dataSource: results,
    selectedRowKeys: [],
    selectedRows: [],
  });
};

const handleDelete = async () => {
  await geoFenceService.delete(state.selectedRowKeys);
  await handleSearch();
};

const handleAdd = ({ key }) => {
  router.push({
    path: RouteEnum.FENCE_ADD,
    query: { type: key },
  });
};

const handleEdit = () => {
  const [{ gfid, type }] = state.selectedRows;
  router.push({
    path: RouteEnum.FENCE_EDIT,
    query: { gfid, type },
  });
};

const handlePreview = () => {
  router.push({
    path: RouteEnum.PREVIEW,
    query: {
      gfids: state.selectedRowKeys,
    },
  });
};

const onSelectChange = (selectedRowKeys, selectedRows) => {
  state.selectedRowKeys = selectedRowKeys;
  state.selectedRows = selectedRows;
};

onBeforeMount(() => {
  handleSearch();
});

onActivated(() => {
  if (route.meta.refresh) {
    handleSearch();
    route.meta.refresh = false;
  }
});
</script>

<style lang="less"></style>
