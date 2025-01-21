<template>
    <div class="template-toolbar">
        <el-button-group>
            <el-select id="templateList" v-model="selectedTemplate" @change="onTemplateChange" class="select-box">
                <el-option value="" disabled>請選擇模板</el-option>
                <el-option v-for="item in irentTemplates" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
        </el-button-group>
        <el-button-group style="margin:20px">
            <el-button @click="saveTemplate" type="primary" :disabled="!isEdited">
                <el-icon>
                    <Files></Files>
                </el-icon>
                儲存
            </el-button>
            <el-button @click="createTemplate" type="info">
                <el-icon>
                    <DocumentAdd />
                </el-icon>
                新增
            </el-button>
            <el-button @click="deleteTemplate" type="danger" :disabled="!selectedTemplate">
                <el-icon>
                    <Delete />
                </el-icon>
                刪除
            </el-button>
        </el-button-group>

    </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import { Delete, DocumentAdd, Files } from '@element-plus/icons-vue'

export default {
    name: 'TemplateManager',
    components: {
        Files,
        Delete,
        DocumentAdd
    },
    props: {
        isEdited: {
            type: Boolean,
            required: true
        }
    },
    emits: ["update:content", "update:selectedTemplate"],
    data() {
        return {
            selectedTemplate: null,
            irentTemplates: []
        };
    },
    mounted() {
        this.loadTemplates();
    },
    methods: {
        loadTemplates() {
            this.irentTemplates = JSON.parse(localStorage.getItem('irent_templates_list')) || [];
            this.selectedTemplate = this.irentTemplates[0]?.id || '';
            if (this.selectedTemplate) {
                this.loadTemplateContent(this.selectedTemplate);
            }
        },
        loadTemplateContent(templateId) {
            const content = localStorage.getItem(`irent_template_${templateId}`) || '';
            this.$emit("update:content", content);
        },
        onTemplateChange() {
            this.$emit("update:selectedTemplate", this.selectedTemplate);
            this.loadTemplateContent(this.selectedTemplate);
        },
        saveTemplate() {
            let templateId = this.selectedTemplate;
            if (!templateId) {
                const templateName = prompt("請輸入想要儲存的版面名稱", "sample");
                templateId = uuidv4();
                this.irentTemplates.push({ label: templateName, id: templateId });
                localStorage.setItem('irent_templates_list', JSON.stringify(this.irentTemplates));
            }
            this.$emit("update:selectedTemplate", templateId);
            const content = this.$attrs.content;
            localStorage.setItem(`irent_template_${templateId}`, content);
        },
        createTemplate() {
            const templateName = prompt("請輸入想要儲存的版面名稱", "sample");
            const templateId = uuidv4();
            this.irentTemplates.push({ label: templateName, id: templateId });
            localStorage.setItem('irent_templates_list', JSON.stringify(this.irentTemplates));
            this.selectedTemplate = templateId;
            this.$emit("update:content", "");
        },
        deleteTemplate() {
            const templateId = this.selectedTemplate;
            const templateIndex = this.irentTemplates.findIndex(item => item.id === templateId);
            if (templateIndex !== -1) {
                this.irentTemplates.splice(templateIndex, 1);
                localStorage.removeItem(`irent_template_${templateId}`);
                localStorage.setItem('irent_templates_list', JSON.stringify(this.irentTemplates));
                this.selectedTemplate = '';
                this.$emit("update:content", "");
            }
        }
    }
};
</script>

<style scoped>
.template-toolbar {
    margin-top: 10px;
}

.select-box {
    width: 200px;
}
</style>
