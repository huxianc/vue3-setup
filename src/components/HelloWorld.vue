<!--
 * @Description:
 * @Author: huxianc
 * @Date: 2020-11-30 10:05:06
 * @LastEditors: huxianc
 * @LastEditTime: 2021-01-29 14:48:05
-->
<template>
  <ul class="fence-box">
    <li
      v-for="(item, index) in list"
      :key="index"
      :class="{ active: index === 0 }"
      @click="handleClick(item, index)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<script lang="ts" setup>
// import { emitEvents } from "../constVariables";
import { defineEmit } from "vue";
interface Label {
  label: string;
}
interface EmitObj {
  [index: string]: string;
}

type emitEventType = "revoke" | "redraw" | "cancel" | "finish";

const emitEvents = ["revoke", "redraw", "cancel", "finish"];

// const emitObj: EmitObj = {
//   1: "revoke",
//   2: "redraw",
//   3: "cancel",
//   4: "finish"
// };

// const emit = defineEmit(Object.keys(emitObj).map(key => emitObj[String(key)]));
console.log(emitEvents);
// const REVOKE = "revoke";
const emit = defineEmit(["revoke", "redraw", "cancel", "finish"]);

// export default defineComponent({
// name: "FenceBox",
// emits: Object.keys(emitObj).map(key => emitObj[key]),
// setup(props, { emit }) {
const list: Label[] = [
  {
    label: "绘制"
  },
  {
    label: "撤销"
  },
  {
    label: "重新绘制"
  },
  {
    label: "取消"
  },
  {
    label: "完成"
  }
];
const handleClick = (item: Label, index: number) => {
  // emit(emitObj[index]);
  emit("revoke");
};
// return {
//   list,
//   handleClick
// };
// }
// });
</script>
