<template>
  <el-dialog
    :model-value="dialogVisible"
    :modal="dialogVisible"
    @close="closeDialog"
  >
    <span>It's a modal Dialog</span>
  </el-dialog>
</template>

<script>
export default {
  name: "BatchDialog",
  props: {
    dialogVisible: Boolean, // 這裡的 value 是 prop
  },
  methods: {
    // 這裡的 value 是 event
    closeDialog() {
      this.$emit("update:dialogVisible", false);
    },
  },
};
</script>
