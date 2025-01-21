<template>
  <el-drawer :model-value="isOpen"  @close="toggleDrawer"  title="" :with-header="false" direction="ltr" size="60%">
    <div v-for="field in fieldsList" :key="field.id" style="margin-bottom: 10px;">
      <template v-if="field.type != 18 && field.type != 21">
        <FieldCard class="first-level" :field="field" :insertVariable="insertVariable"></FieldCard>
      </template>
      <template v-else>
        <FieldCollapse :field="field" :insertVariable="insertVariable" :end="false"></FieldCollapse>
      </template>
    </div>
  </el-drawer>
</template>

<script>
import { bitable } from '@lark-base-open/js-sdk'
import FieldCollapse from './FieldCollapse.vue';
import FieldCard from './FieldCard.vue';

export default {
    name: "LarkFieldsList",
    data() {
        return {
            isOpenDrawer: false,
            tableId: "",
            fieldsList: []
        };
    },
    props: {
        editorInstance: Object,
        isOpen: Boolean
    },
    async mounted() {
        const table = await bitable.base.getActiveTable();
        const fieldList = await table.getFieldMetaList();
        this.tableId = table.id;
        this.fieldsList = fieldList;
        this.isOpenDrawer = this.isOpen
    },
    methods: {
        async getTableFieldMetaList(tableId) {
            const table = await bitable.base.getTableById(tableId);
            const fields = await table.getFieldMetaList();
            return fields;
        },
        insertVariable(field, father = null, isLink = false) {
            let father_fieldId = "";
            let tableId = "";

            if (isLink) {
                father_fieldId = father.id;
                tableId = father.property.tableId;
            }
            else {
                father_fieldId = "*";
                tableId = this.tableId;
            }

            this.editorInstance.insertContent(`
          <span class="template-field" contenteditable="false"
              data-tableid="${tableId}" 
              data-fieldid="${field.id}" 
              data-fieldname="${field.name}" 
              data-fieldtype="${field.type}" 
              data-father-field="${father_fieldId}">
             {{${field.name}}}
          </span>`);
        },
        toggleDrawer() {
            this.$emit('update:isOpen', !this.isOpen);
        }
    },
    components: { FieldCard, FieldCollapse }
}
</script>
