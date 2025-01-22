import { createApp } from "vue";

import "element-plus/theme-chalk/display.css";
import "./assets/main.css";

import App from "./App.vue";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css"; // 引入樣式

const app = createApp(App);

app.use(ElementPlus); // 註冊 Element Plus

app.mount("#app");
