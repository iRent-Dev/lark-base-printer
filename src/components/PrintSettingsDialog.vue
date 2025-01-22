<template>
  <el-dialog 
    :model-value="visible" 
    @close="$emit('update:visible', false)" 
    title="列印設定" 
    width="80%"
  >
    <el-form :model="localSettings" label-width="120px">
      <el-form-item label="列印方向">
        <el-radio-group v-model="localSettings.orientation">
          <el-radio label="portrait">直向</el-radio>
          <el-radio label="landscape">橫向</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上邊距">
        <el-input-number v-model="localSettings.marginTop" :min="0" label="上邊距"></el-input-number>
      </el-form-item>
      <el-form-item label="下邊距">
        <el-input-number v-model="localSettings.marginBottom" :min="0" label="下邊距"></el-input-number>
      </el-form-item>
      <el-form-item label="左邊距">
        <el-input-number v-model="localSettings.marginLeft" :min="0" label="左邊距"></el-input-number>
      </el-form-item>
      <el-form-item label="右邊距">
        <el-input-number v-model="localSettings.marginRight" :min="0" label="右邊距"></el-input-number>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="handleSave">確定</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: ['update:visible', 'update:settings'],
  data() {
    return {
      localSettings: { ...this.settings },
    };
  },
  watch: {
    settings: {
      deep: true,
      handler(newSettings) {
        this.localSettings = { ...newSettings };
      },
    },
  },
  methods: {
    handleSave() {
      this.$emit('update:settings', { ...this.localSettings });
      this.$emit('update:visible', false);
    },
    handleCancel() {
      this.localSettings = { ...this.settings };
      this.$emit('update:visible', false);
    },
  }
};
</script>
