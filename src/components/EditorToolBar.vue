<template>
    <div>
      <el-form :inline="true">
        <el-form-item label="編輯模式">
          <el-switch v-model="isEdited" active-text="開啟" inactive-text="關閉" @change="toggleEditorMode" />
        </el-form-item>
        <el-form-item>
          <el-button @click="toggleDrawer" :disabled="!isEdited">
            <el-icon><Plus /></el-icon>插入多維表格變數
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  import { Plus } from '@element-plus/icons-vue';

  export default {
    name: 'EditorToolBar',
    props: {
      "toggleEditorMode": Function,
      "isOpenDrawer": Boolean
    },
    components: {
      Plus
    },
    emits: ["update:isEdited", "update:isOpenDrawer"],
    data() {
      return {
        isEdited: this.isEdited,  // 初始化時使用 props 傳遞的值
      };
    },
    watch: {
      // 當 isEdited 或 isOpenDrawer 改變時，通知父組件更新
      isEdited(newValue) {
        this.$emit("update:isEdited", newValue);
      },
      isOpenDrawer(newValue) {
        this.$emit("update:isOpenDrawer", newValue);
      }
    },
    methods: {
      toggleDrawer() {
        this.$emit('update:isOpenDrawer', true);
      }
    }
  }
  </script>
  