# @rthx/vue3-amap

基于 vue3 封装的高德地图组件集合，并搭配猎鹰轨迹服务实现简易的电子围栏与企业签到 demo

## Features

- 类型提示
- 原生组件封装
  - [AMapControlBar](#基础地图-amapmap)
  - [AMapGeolocation](#实时定位-amapgeolocation)
  - [AMapMap](#基础地图-amapmap)
  - [AMapMapType](#基础地图-amapmap)
  - [AMapMarker](#基础地图-amapmap)
  - [AMapScale](#基础地图-amapmap)
  - [AMapSearch](#基础地图-amapmap)
  - [AMapToolbar](#基础地图-amapmap)
- 拓展组件
  - [AMapFitView](#基础地图-amapmap)
  - [AMapPositionWatcher](#实时定位-amapgeolocation)
  - [AMapVector](#绘制矢量图形围栏-amapvector)

## Usage

### 安装

```sh
pnpm add @rthx/vue3-amap
```

### 引入

```js
import Vue3AMap from '@rthx/vue3-amap'
import '@rthx/vue3-amap/dist/index.css'
import App from './app.vue'
import { createApp } from 'vue'

const app = createApp(App)
app.use(router)
app.use(Vue3AMap, {
  key: '', // 你的高德地图 JS KEY
  version: '2.0',
  errorHandler(error) {}, // 报错处理逻辑，可配置 toast 提示等
})
```

### 配置全局组件类型提示（如有）

将 ```@rthx/vue3-amap/global``` 加入 ```tsconfig.json``` 中 ```compilerOptions``` 的 ```types``` 字段

```json
{
  "compilerOptions": {
    "types": ["@rthx/vue3-amap/global"]
  }
}
```

### 使用

所有组件均已全局注册，可直接在模板中使用（推荐 kebab-case）。`AMapMap` 为地图容器，子组件须置于其默认插槽内；**插槽内容在地图 `complete` 且 `AMap`、`map` 实例就绪后才会渲染**，因此子组件可安全地通过依赖注入获取地图实例。

> 注意：`AMapMap` 内部容器宽高为 `max(100%, 100px)`，父元素需有明确尺寸，否则地图不可见。

#### 基础地图 [`AMapMap`](./src/components/Map/index.vue)

```vue
<template>
  <div class="map-container">
    <a-map-map map-style="normal" @complete="onComplete" @destroy="onDestroy">
      <a-map-toolbar />
      <a-map-scale />
      <a-map-control-bar />
      <a-map-map-type />
      <a-map-fit-view />
      <a-map-search />
      <a-map-marker
        :position="[116.397428, 39.90923]"
        title="天安门"
        auto-fit-view
      />
      <a-map-geolocation />
    </a-map-map>
  </div>
</template>

<script setup lang="ts">
const onComplete = () => console.log('地图加载完成');
const onDestroy = () => console.log('地图已销毁');
</script>

<style>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
```

[`AMapMap`](./src/components/Map/index.vue) 的 `mapStyle` 支持 `normal`、`macaron`、`graffiti`、`whitesmoke`、`dark`、`fresh`、`darkblue`、`blue`、`light`、`grey`，运行时实时切换。

#### 绘制矢量图形（围栏） [`AMapVector`](./src/components/Vector/index.vue)

[`AMapVector`](./src/components/Vector/index.vue) 支持 `circle`（圆）与 `polygon`（多边形），通过 `ref` 暴露 `start` / `stop` / `clear` / `generateConfig` 等方法驱动绘制与序列化。

```vue
<template>
  <div class="map-container">
    <a-map-map>
      <a-map-vector ref="vectorRef" :config="config" />
    </a-map-map>

    <div class="toolbar">
      <button @click="vectorRef?.start()">
        {{ vectorRef?.vectorRef ? '继续' : '开始' }}绘制
      </button>
      <button :disabled="!vectorRef?.vectorRef" @click="vectorRef?.stop()">
        结束绘制
      </button>
      <button :disabled="!vectorRef?.vectorRef" @click="vectorRef?.clear()">
        清空绘制
      </button>
      <button @click="save">保存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { AMapVector } from '@rthx/vue3-amap';
import type { ComponentExposed } from 'vue-component-type-helpers';

const vectorRef = ref<ComponentExposed<typeof AMapVector> | null>(null);

const config = reactive({
  type: 'circle', // 'circle' | 'polygon'
  shape: null, // 可选，用于回显已有图形
});

const save = () => {
  if (!vectorRef.value?.vectorRef) return;
  // 圆形返回 { type, center, radius }；多边形返回 { type, points }
  const payload = vectorRef.value.generateConfig();
  console.log(payload);
};
</script>
```

`config.shape` 用于回显已有围栏，结构因 `type` 而异：

```js
// 圆形
{ type: 'circle', center: '104.06155,30.54185', radius: 200 }
// 多边形
{ type: 'polygon', points: '104.062227,30.548188;104.063946,30.548182;...' }
```

#### 实时定位 [`AMapGeolocation`](./src/components/Geolocation/index.vue)

[`AMapGeolocation`](./src/components/Geolocation/index.vue) 开启 `watch-position` 后周期性触发 `update:position`（`[lng, lat]`），可配合 `AMapMarker` 展示当前位置：

```vue
<template>
  <a-map-map>
    <a-map-marker v-if="position?.length" :position="position" auto-fit-view />
    <a-map-geolocation
      watch-position
      :show-button="false"
      :show-circle="false"
      :show-marker="false"
      :pan-to-location="false"
      @update:position="position = $event"
    />
  </a-map-map>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const position = ref<AMap.Vector2>(null);
</script>
```

## Dev

克隆并安装依赖

```sh
git clone https://github.com/ehehaye/vue3-amap.git
cd vue3-amap
pnpm i
```

启动

```sh
pnpm dev
```

mock（开发阶段可选开启，避免频繁调用高德接口触发限额）

```javascript
import('../mock');
```

## Tips

地图加载与接口调用涉及高德开发者密钥。出于安全考虑，项目通过 Nginx 转发并仅代理必要服务；实际开发请前往[高德控制台](https://console.amap.com/dev/index)申请自己的开发者应用。

### Nginx 代理示例

[JS API 安全密钥使用](https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode)

```nginx
# 自定义地图服务代理
location /_AMapService/v4/map/styles {
  set $args "$args&jscode=你的安全密钥";
  proxy_pass https://webapi.amap.com/v4/map/styles;
}
# 海外地图服务代理
location /_AMapService/v3/vectormap {
  set $args "$args&jscode=你的安全密钥";
  proxy_pass https://fmap01.amap.com/v3/vectormap;
}
# Web 服务 API 代理
location /_AMapService/ {
  set $args "$args&jscode=你的安全密钥";
  proxy_pass https://restapi.amap.com/;
}
# 猎鹰轨迹服务 API 代理
location /geofence/ {
  set $args "$args&key=你的Web服务API类型KEY";
  proxy_pass https://tsapi.amap.com/v1/track/geofence/;
}
# 输入提示 API 代理
location /inputtips {
  set $args "$args&key=你的Web服务API类型KEY";
  proxy_pass https://restapi.amap.com/v3/assistant/inputtips;
}
```

## FAQ

- 为什么 PC 调试定位时会失败？

  定位实现基于 GPS 与 IP：前者多数 PC 不具备相应硬件能力，后者受网络环境影响

- 为什么 Chrome 调试定位时会失败？

  各浏览器厂商的定位实现方案不同：Chrome 会向 Google 发送请求解析定位，因已知原因可能无法正常响应，建议改用其他浏览器尝试
