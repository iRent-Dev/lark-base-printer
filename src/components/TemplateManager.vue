<template>
  <div class="template-toolbar">
    <el-button-group>
      <el-select
        id="templateList"
        v-model="selectedTemplate"
        @change="onTemplateChange"
        class="select-box"
      >
        <el-option value="" disabled>請選擇模板</el-option>
        <el-option
          v-for="item in irentTemplates"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-button-group>
    <el-button-group style="margin: 20px">
      <el-button @click="saveTemplate" type="primary" :disabled="!isEdited">
        <el-icon>
          <Files></Files>
        </el-icon>
        儲存
      </el-button>
      <el-button @click="createTemplate" type="info" :disabled="!isLoggedIn">
        <el-icon>
          <DocumentAdd />
        </el-icon>
        新增
      </el-button>
      <el-button
        @click="deleteTemplate"
        type="danger"
        :disabled="!selectedTemplate"
      >
        <el-icon>
          <Delete />
        </el-icon>
        刪除
      </el-button>
      <el-button @click="isLoggedIn ? logout() : login()">
        {{ isLoggedIn ? "登出" : "登入" }}
      </el-button>
    </el-button-group>
    <!-- 登入彈窗 -->
    <el-dialog title="Login" v-model="isLoginDialogVisible" width="90%">
      <Login @login="handleLogin" />
    </el-dialog>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { applyTemplate } from "@/plugins/content";
import { Delete, DocumentAdd, Files } from "@element-plus/icons-vue";
import Login from "@/components/Login.vue";

export default {
  name: "TemplateManager",
  components: {
    Files,
    Delete,
    DocumentAdd,
    Login,
  },
  props: {
    isEdited: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:content", "update:selectedTemplate"],
  data() {
    return {
      isLoginDialogVisible: false,
      isLoggedIn: false,
      selectedTemplate: null,
      irentTemplates: [],
    };
  },
  mounted() {
    const token = localStorage.getItem("irent_token");
    if (token) {
      this.isLoggedIn = true;
      this.loadTemplates();
    }
  },
  methods: {
    async loadTemplates() {
      const response = await axios.get(
        "https://app.larksuite.com.tw/api/src/user_template.php",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("irent_token")}`,
          },
        }
      );

      if (!response.data.error) {
        this.irentTemplates = Object.values(response.data.templates) || [];
        this.selectedTemplate = this.irentTemplates[0].id || "";

        if (this.selectedTemplate) {
          this.loadTemplateContent(this.selectedTemplate);
        }
      } else {
        this.irentTemplates = [];
        this.selectedTemplate = "";
      }
    },
    async loadTemplateContent(templateId) {
      const response = await axios.post(
        "https://app.larksuite.com.tw/api/src/show_template.php",
        { uuid: templateId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("irent_token")}`,
          },
        }
      );
      let content = response.data.content;
      if (!this.isEdited) {
        content = await applyTemplate(content);
      }
      this.$emit("update:content", content);
    },
    onTemplateChange() {
      this.$emit("update:selectedTemplate", this.selectedTemplate);
      this.loadTemplateContent(this.selectedTemplate);
    },
    async saveTemplate() {
      let templateId = this.selectedTemplate;
      if (!templateId) {
        const templateName = prompt("請輸入想要儲存的版面名稱", "sample");
        templateId = uuidv4();
        this.irentTemplates.push({ label: templateName, id: templateId });
        localStorage.setItem(
          "irent_templates_list",
          JSON.stringify(this.irentTemplates)
        );
      }
      this.$emit("update:selectedTemplate", templateId);
      const content = this.$attrs.content;
      const response = await axios.post(
        "https://app.larksuite.com.tw/api/src/save_template.php",
        { uuid: templateId, content: content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("irent_token")}`,
          },
        }
      );
      console.log(response.data);
      // localStorage.setItem(`irent_template_${templateId}`, content);
    },
    async createTemplate() {
      const templateName = prompt("請輸入想要儲存的版面名稱", "sample");
      const templateId = uuidv4();
      this.irentTemplates.push({ name: templateName, id: templateId });
      // localStorage.setItem('irent_templates_list', JSON.stringify(this.irentTemplates));
      await axios.post(
        "https://app.larksuite.com.tw/api/src/create_template.php",
        { name: templateName, uuid: templateId, content: "" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("irent_token")}`,
          },
        }
      );
      this.selectedTemplate = templateId;
      this.$emit("update:content", "");
    },
    async deleteTemplate() {
      const template = this.selectedTemplate;
      const templateIndex = this.irentTemplates.findIndex(
        (item) => item.id === template
      );
      if (templateIndex !== -1) {
        this.irentTemplates.splice(templateIndex, 1);
        // localStorage.removeItem(`irent_template_${templateId}`);
        // localStorage.setItem('irent_templates_list', JSON.stringify(this.irentTemplates));
        await axios.post(
          "https://app.larksuite.com.tw/api/src/delete_template.php",
          { uuid: template },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("irent_token")}`,
            },
          }
        );
        this.selectedTemplate = this.irentTemplates[0].id || "";
        this.loadTemplateContent(this.selectedTemplate);
      }
    },
    login() {
      this.isLoginDialogVisible = true;
    },
    logout() {
      localStorage.removeItem("irent_token");
      this.isLoggedIn = false;
    },
    handleLogin(token) {
      // 接收到 token 後執行的邏輯
      localStorage.setItem("irent_token", token);
      this.isLoggedIn = true;
      this.isLoginDialogVisible = false;
      this.loadTemplates();
    },
  },
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
