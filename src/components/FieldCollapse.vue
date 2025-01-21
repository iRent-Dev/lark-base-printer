<template>
  <div>
    <el-card class="first-level" style="margin-bottom: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>{{ field.name }}</span>
        <el-button type="text" @click="toggleIsExpanded">
          {{ isExpanded ? '[收合]' : '[展開]' }}
        </el-button>
      </div>
    </el-card>
    <el-collapse-transition>
      <div v-show="isExpanded">
        <div v-for="subfield in subFieldsList" :key="subfield.id" style="margin-bottom: 10px;">
          <div v-if="end">
            <FieldCard :field="subfield" :insertVariable="insertVariable"></FieldCard>
          </div>
          <div v-else>
            <div v-if="subfield.type != 18 && subfield.type != 21">
              <FieldCard :field="field" :subfield="subfield" :insertVariable="insertVariable"></FieldCard>
            </div>
            <div v-else>
              <FieldCollapse :field="subfield" :insertVariable="insertVariable" :end="true"></FieldCollapse>
            </div>
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import FieldCard from './FieldCard.vue';
import { bitable } from '@lark-base-open/js-sdk'

export default {
  name: 'FieldCollapse',
  components: {
    FieldCard
  },
  data() {
    return {
      isExpanded: false,
      subFieldsList: [],
    }
  },
  async mounted() {
    const tableId = this.field.property.tableId;
    const fieldList = await this.getTableFieldMetaList(tableId);
    this.subFieldsList = fieldList;
  },
  props: {
    field: Object,
    insertVariable: Function,
    end: Boolean
  },
  methods: {
    toggleIsExpanded() {
      this.isExpanded = !this.isExpanded
    },
    async getTableFieldMetaList(tableId) {
      const table = await bitable.base.getTableById(tableId);
      const fields = await table.getFieldMetaList();
      return fields;
    },
  }
}
</script>

<style></style>
