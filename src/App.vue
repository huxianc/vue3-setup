<!--
 * @Description: 
 * @Author: huxianc
 * @Date: 2021-02-02 11:11:35
 * @LastEditors: huxianc
 * @LastEditTime: 2021-02-03 14:01:07
-->
<template>
  <div id="app" ref="threeDom" class="three-container"></div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as common from "./common/three_Common.js";

const threeDom = ref();

const initCommon = () => {
  common.initScene(); //加载场景
  common.initCamera(); //加载摄像头
  const dom = common.initRenderer(); //加载渲染
  common.initController(); //加载控制器
  // common.initStats(); //性能监视器
  // common.initAxis(); //加载坐标轴
  common.loadModel(); //加载模型
  common.registerEventListener("resize", common.onWindowResize);
  console.log(threeDom.value);
  threeDom.value.appendChild(dom);
};

let animationId = null;

const render1 = () => {
  common.controls.update();
  common.renderer.render(common.scene, common.camera);
  // common.labelRenderer.render(common.scene, common.camera);
  // common.stats.update();
  animationId = requestAnimationFrame(render1);
};
onMounted(() => {
  initCommon();
  render1();
});

onUnmounted(() => {
  common.cancelEventListener("resize", common.onWindowResize);
  cancelAnimationFrame(animationId);
});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}
</style>
