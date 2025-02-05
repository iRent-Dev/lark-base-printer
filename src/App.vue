<template>
  <div>
    <div class="container">
      <TemplateManager
        :is-edited="isEdited"
        v-model:content.sync="content"
        v-model:selected-template.sync="selectedTemplate"
      />
      <EditorToolBar
        v-model:is-edited="isEdited"
        v-model:isOpenDrawer.sync="isOpenDrawer"
        :editorInstance="editorInstance"
        :toggleEditorMode="toggleEditorMode"
        v-model:isPrintSettingsVisible.sync="isPrintSettingsVisible"
      />
      <Editor
        id="editor"
        tinymce-script-src="/lark-base-printer/tinymce/tinymce.min.js"
        :init="editorConfig"
        v-model="content"
      />
      <LarkFieldsList
        :editorInstance="editorInstance"
        v-model:isOpen.sync="isOpenDrawer"
      />
      <PrintSettingsDialog
        :visible="isPrintSettingsVisible"
        :settings="printSettings"
        @update:visible="isPrintSettingsVisible = $event"
        @update:settings="printSettings = $event"
      />
    </div>
  </div>
</template>

<script>
import Editor from "@tinymce/tinymce-vue";
import TemplateManager from "@/components/TemplateManager.vue";
import EditorToolBar from "@/components/EditorToolBar.vue";
import LarkFieldsList from "@/components/LarkFieldsList.vue";
import PrintSettingsDialog from "@/components/PrintSettingsDialog.vue";

import { registerButtons } from "@/plugins/tinymce-plugins";
import { applyTemplate, revertTemplate } from "@/plugins/content";

export default {
  components: {
    Editor,
    EditorToolBar,
    TemplateManager,
    LarkFieldsList,
    PrintSettingsDialog,
  },
  data() {
    return {
      isEdited: false,
      selectedTemplate: null,
      isOpenDrawer: false,
      editorInstance: null,
      content: "",
      printSettings: {
        orientation: "portrait",
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
      },
      isPrintSettingsVisible: false, // 控制列印設置彈窗的顯示與隱藏
    };
  },
  computed: {
    editorConfig() {
      return {
        plugins: "image table autoresize",
        menubar: false,
        statusbar: false,
        toolbar:
          "undo redo | bold italic underline | image table | newprint exportpdf",
        file_picker_types: "image",
        file_picker_callback: function (callback, value, meta) {
          if (meta.filetype === "image") {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.onchange = function () {
              const file = this.files[0];
              const reader = new FileReader();
              reader.onload = function (e) {
                callback(e.target.result, { alt: file.name });
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }
        },
        setup: (editor) => {
          this.editorInstance = editor;
          registerButtons(editor, () => this.printSettings); // 註冊客製化按鈕
          // 編輯器初始化完成後
          editor.on("init", () => {
            this.toggleEditorMode(); // 根據 isEdited 設定模式
          });
        },
      };
    },

    dynamicContentStyle() {
      return `
        @media print {
          @page {
            margin-top: ${this.printSettings.marginTop}px;
            margin-bottom: ${this.printSettings.marginBottom}px;
            margin-left: ${this.printSettings.marginLeft}px;
            margin-right: ${this.printSettings.marginRight}px;
            ${
              this.printSettings.orientation === "landscape"
                ? "size: landscape;"
                : "size: portrait;"
            }
          }
        }
      `;
    },
  },
  watch: {
    // 監控 dynamicContentStyle 的變化，並呼叫 updateEditorStyle 更新樣式
    dynamicContentStyle(newStyle) {
      this.updateEditorStyle();
    },
  },
  mounted() {
    this.toggleEditorMode();
  },
  methods: {
    async toggleEditorMode() {
      this.isEdited = !this.isEdited;
      if (this.editorInstance) {
        this.editorInstance.mode.set(this.isEdited ? "design" : "readonly"); // 編輯模式
        this.applyIframeStyles();
        if (this.isEdited) {
          this.content = await revertTemplate(this.content);
        } else {
          this.content = await applyTemplate(this.content);
        }
      }
    },
    applyIframeStyles() {
      const iframe = this.editorInstance.iframeElement;
      if (iframe) {
        if (this.isEdited) {
          iframe.style.pointerEvents = "auto"; // 恢復點擊
          iframe.style.userSelect = "text"; // 恢復選取
          iframe.contentDocument.body.style.cursor = "text"; // 顯示游標
        } else {
          // iframe.style.height = "10000px"; // 修復高度
          // console.log("here");
          // iframe.style.overflowY = "scroll"; // 允許垂直滾動
          iframe.style.pointerEvents = "none"; // 禁止點擊與聚焦
          iframe.style.userSelect = "none"; // 禁止選取內容
          iframe.contentDocument.body.style.cursor = "default"; // 游標消失
          // iframe.contentDocument.body.style.overflowY = "auto"; // 游標消失
        }
      }
    },

    openPrintSettings() {
      this.isPrintSettingsVisible = true;
    },

    handlePrintSettings(settings) {
      this.printSettings = settings;
      this.updateEditorStyle();
      this.isPrintSettingsVisible = false;
    },

    updateEditorStyle() {
      const iframe = this.editorInstance.iframeElement;
      if (iframe && iframe.contentDocument) {
        const head = iframe.contentDocument.head;

        // 查找是否已經有我們插入的 style 標籤
        let existingStyleTag =
          iframe.contentDocument.getElementById("dynamic-style-tag");

        if (!existingStyleTag) {
          // 如果沒有，創建一個新的 style 標籤
          existingStyleTag = iframe.contentDocument.createElement("style");
          existingStyleTag.id = "dynamic-style-tag"; // 設置 id 來避免重複
          head.appendChild(existingStyleTag); // 添加到 head
        }

        // 更新 style 標籤的內容
        existingStyleTag.innerHTML = this.dynamicContentStyle;
      }
    },
  },
};
</script>
