<template>
  <a-flex class="w-100 h-100" vertical>
    <a-form
      class="fence-form"
      layout="inline"
      :model="config"
      :rules
      :colon="false"
      @finish="handleSubmit"
    >
      <a-form-item label="名称" name="name">
        <a-input
          v-model:value="config.name"
          class="input"
          allow-clear
          :maxlength="20"
          show-count
          placeholder="支持中英文、数字、英文短横线与下划线"
        />
      </a-form-item>

      <a-form-item label="描述" name="desc">
        <a-input
          v-model:value="config.desc"
          class="input"
          allow-clear
          :maxlength="100"
          show-count
          placeholder="支持中英文、数字、英文短横线与下划线"
        />
      </a-form-item>

      <a-flex>
        <a-form-item label="类型" name="type">
          <a-select v-model:value="config.type" disabled>
            <a-select-option :value="'polygon'"> 多边形 </a-select-option>
            <a-select-option :value="'circle'"> 圆形 </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit"> 保存 </a-button>
        </a-form-item>

        <template v-if="childRef">
          <a-form-item v-if="childRef.reaOnlyRef">
            <a-button @click="childRef.start">
              {{ childRef.vectorRef ? '继续' : '开始' }}绘制
            </a-button>
          </a-form-item>

          <template v-else>
            <a-form-item>
              <a-button
                :disabled="!childRef.vectorRef"
                @click="childRef.stop()"
              >
                结束绘制
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button
                :disabled="!childRef.vectorRef"
                @click="childRef.clear()"
              >
                清空绘制
              </a-button>
            </a-form-item>
          </template>
        </template>
      </a-flex>
    </a-form>

    <a-flex :flex="1">
      <a-map-map>
        <a-map-fit-view />
        <!-- JS SDK 调用，日限额较低 -->
        <!-- <a-map-search /> -->

        <!-- Web API 调用，日限额较高 -->
        <auto-complete />
        <a-map-vector :ref="setChildRef" :config="config" />
        <a-map-toolbar />
        <a-map-scale />
        <a-map-control-bar />
        <!-- <a-map-map-type /> -->
      </a-map-map>
    </a-flex>
  </a-flex>
</template>

<script setup lang="ts">
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { reactive, ref, onBeforeMount } from 'vue';
import { geoFenceService } from '@/services';
import { AMapVector } from '@rthx/vue3-amap';
import { message, Modal } from 'ant-design-vue';
import { ComponentExposed } from 'vue-component-type-helpers';
import AutoComplete from '@/components/AutoComplete/index.vue';
import { RouteEnum } from '@/router/enum';
import { Fence } from '@/model/fence';

const props = defineProps({
  type: {
    type: String,
    default: 'circle',
  },
  gfid: {
    type: Number,
    default: null,
  },
});

const hasSaved = ref(false);

const router = useRouter();

onBeforeRouteLeave((to, from, next) => {
  if (hasSaved.value) {
    to.meta.refresh = true;
    next();
  } else {
    Modal.confirm({
      title: '确定离开？',
      content: '当前围栏配置未保存，离开可能导致围栏数据丢失。',
      onOk: next,
    });
  }
});

const config = reactive<Fence>({
  gfid: props.gfid,
  type: props.type,
  name: '',
  desc: '',
  shape: null,
});

onBeforeMount(() => {
  if (config.gfid) {
    geoFenceService.detail(config.gfid).then((res) => {
      Object.assign(config, res);
    });
  }
});

const childRef = ref<ComponentExposed<typeof AMapVector> | null>(null);
const setChildRef = (v) => {
  childRef.value = v;
};

const handleSubmit = async () => {
  if (!childRef.value.vectorRef) {
    return message.error('请绘制围栏');
  }
  const payload = childRef.value.generateConfig();
  if (config.gfid) {
    await geoFenceService.update(payload);
    message.success('编辑成功');
  } else {
    await geoFenceService.add(payload);
    message.success('新增成功');
  }
  hasSaved.value = true;
  return router.push(RouteEnum.MANAGE);
};

const validator = (__, value: string) => {
  if (!value || /^[\u4E00-\u9FA5a-zA-Z0-9-_]+$/.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject('仅支持中英文、数字、短横线与下划线');
};

const rules = {
  name: [
    { required: true, message: '请输入名称' },
    { validator, trigger: 'change' },
  ],
  desc: [{ validator, trigger: 'change' }],
};
</script>

<style lang="less">
.fence-form {
  margin: 0 12px 8px 8px;

  .ant-form-item {
    margin-bottom: 24px !important;
  }

  .input {
    width: 360px;
  }

  .ant-form-item-label {
    width: 48px;
    height: 32px;
  }

  @media (max-width: 575px) {
    .ant-form-item-label,
    .ant-form-item-control {
      flex: none !important;
    }
  }
}
</style>
