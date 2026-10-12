# @rthx/vue3-amap

基于 vue3 封装的高德地图组件集合，并搭配猎鹰轨迹服务实现简易的电子围栏与企业签到 demo

## Features

- 类型提示
- 原生组件封装
  - [AMapControlBar](#amapcontrolbar)
  - [AMapGeolocation](#amapgeolocation)
  - [AMapMap](#amapmap)
  - [AMapMapType](#amapmaptype)
  - [AMapMarker](#amapmarker)
  - [AMapScale](#amapscale)
  - [AMapSearch](#amapsearch)
  - [AMapToolbar](#amaptoolbar)
- 拓展组件
  - [AMapFitView](#amapfitview)
  - [AMapVector](#amapvector)

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

所有组件均已全局注册，可直接在模板中使用（推荐 kebab-case）。除 `AMapMap` 外，其余组件都必须放在 `AMapMap` 的默认插槽内；**插槽内容在地图 `complete` 且 `AMap`、`map` 实例就绪后才会渲染**，因此子组件可安全地通过依赖注入获取地图实例。

综合示例：

```vue
<template>
  <div class="map-container">
    <a-map-map map-style="normal" @complete="onComplete" @destroy="onDestroy">
      <a-map-toolbar />
      <a-map-control-bar />
      <a-map-scale />
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

#### AMapMap

地图容器，负责加载 `AMap` 并创建 `map` 实例，其余组件通过依赖注入获取该实例。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mapStyle` | `string` | `'normal'` | 地图风格，支持 `normal`、`macaron`、`graffiti`、`whitesmoke`、`dark`、`fresh`、`darkblue`、`blue`、`light`、`grey`，修改后实时切换 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `complete` | - | 地图加载完成 |
| `destroy` | - | 地图销毁 |

| 插槽 | 说明 |
| --- | --- |
| `default` | 子组件内容，仅在 `complete` 且实例就绪后渲染 |

> 容器宽高为 `max(100%, 100px)`，父元素需有明确尺寸，否则地图不可见。

```vue
<a-map-map map-style="normal" @complete="onComplete" @destroy="onDestroy">
  <!-- 子组件 -->
</a-map-map>
```

#### AMapMarker

在地图上添加点标记。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `position` | `[number, number]` | `null` | 标记经纬度 `[lng, lat]`，缺省时取地图中心点 |
| `title` | `string` | `''` | 标记标题 |
| `zIndex` | `number` | `100` | 层级 |
| `autoFitView` | `boolean` | `false` | 位置变化时是否自动调整视野 |

```vue
<a-map-marker :position="[116.397428, 39.90923]" title="天安门" auto-fit-view />
```

#### AMapVector

绘制并序列化矢量图形（围栏），支持 `circle`（圆）与 `polygon`（多边形）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `config` | `{ type: 'circle' \| 'polygon'; shape?: unknown }` | `{}` | `type` 指定图形类型，`shape` 用于回显已有图形 |

通过 `ref` 暴露的成员：

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `start()` | `() => void` | 开始绘制；已有图形时进入微调 |
| `stop(ifClear?)` | `(ifClear?: boolean) => void` | 结束绘制或微调，可选清除 |
| `clear()` | `() => void` | 清空并重置绘制 |
| `generateConfig()` | `() => object` | 序列化当前图形为 `config` |
| `vectorRef` | `AMap.Polygon \| AMap.Circle \| null` | 当前图形实例 |
| `reaOnlyRef` | `ComputedRef<boolean>` | 是否处于只读（非绘制 / 微调）状态 |

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

`config.shape` 的结构因 `type` 而异：

```js
// 圆形
{ type: 'circle', center: '104.06155,30.54185', radius: 200 }
// 多边形
{ type: 'polygon', points: '104.062227,30.548188;104.063946,30.548182;...' }
```

#### AMapSearch

地名输入提示与 POI 搜索，内部使用 `AMap.AutoComplete` 与 `AMap.PlaceSearch`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `position` | `object` | `{ top: '40px', left: '90px' }` | 输入框位置 |

```vue
<a-map-search />
```

#### AMapGeolocation

浏览器定位控件，可周期性上报当前位置。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `watchPosition` | `boolean` | `false` | 开启后每 3 秒触发一次 `update:position` |
| `showButton` | `boolean` | `true` | 是否显示定位按钮 |
| `showCircle` | `boolean` | `true` | 是否显示定位精度圈 |
| `showMarker` | `boolean` | `true` | 是否显示定位点 |
| `panToLocation` | `boolean` | `true` | 定位成功后是否移动到定位点 |
| `position` | `object` | `{ bottom: '90px', right: '40px' }` | 控件位置 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:position` | `[lng, lat]` | 定位结果，`watchPosition` 开启时周期性触发 |

```vue
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
```

#### AMapToolbar

地图工具条（缩放、平移等）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `position` | `object` | `{ top: '40px', left: '40px' }` | 控件位置 |

```vue
<a-map-toolbar />
```

#### AMapControlBar

地图旋转、倾斜控件。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `position` | `object` | `{ bottom: '80px', left: '35px' }` | 控件位置 |

```vue
<a-map-control-bar />
```

#### AMapScale

比例尺控件。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `position` | `object` | `{ bottom: '50px', left: '40px' }` | 控件位置 |

```vue
<a-map-scale />
```

#### AMapMapType

图层切换控件（标准 / 卫星）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `position` | `object` | `{ bottom: '200px', right: '40px' }` | 控件位置 |

```vue
<a-map-map-type />
```

#### AMapFitView

一键将地图视野调整到全部覆盖物。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `position` | `object` | `{ bottom: '90px', right: '80px' }` | 按钮位置 |

```vue
<a-map-fit-view />
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
