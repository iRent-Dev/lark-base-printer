<template>
  <div>
    <div class="container ">
      <TemplateManager :is-edited="isEdited" v-model:content.sync="content" v-model:selected-template.sync="selectedTemplate" />
      <EditorToolBar v-model:is-edited="isEdited" v-model:isOpenDrawer.sync="isOpenDrawer" :editorInstance="editorInstance" :toggleEditorMode="toggleEditorMode"/>
      <Editor id="editor" tinymce-script-src="/printer/tinymce/tinymce.min.js" :init="editorConfig" v-model="content" />
      <LarkFieldsList :editorInstance="editorInstance" v-model:isOpen.sync="isOpenDrawer"></LarkFieldsList>
    </div>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import TemplateManager from '@/components/TemplateManager.vue';
import EditorToolBar from '@/components/EditorToolBar.vue';
import LarkFieldsList from '@/components/LarkFieldsList.vue'

import { registerButtons } from '@/plugins/tinymce-plugins';
import { applyTemplate, revertTemplate } from '@/plugins/content';


export default {
  components: {
    Editor,
    EditorToolBar,
    TemplateManager,
    LarkFieldsList
  },
  data() {
    return {
      isEdited: false,
      selectedTemplate: null,
      isOpenDrawer: false,
      editorInstance: null,
      content: "",
    };
  },
  computed: {
    editorConfig() {
      return {
        plugins: 'image table',
        menubar: false,
        statusbar: false,
        toolbar: 'undo redo | bold italic underline | image table | newprint exportpdf',
        file_picker_types: 'image',
        file_picker_callback: function (callback, value, meta) {
          if (meta.filetype === 'image') {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
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
          registerButtons(editor); // 註冊客製化按鈕 
          // 編輯器初始化完成後
          editor.on('init', () => {
            this.toggleEditorMode();  // 根據 isEdited 設定模式
          });
        },
        content_style: `
          @media print {
            @page {
              margin-top: 10px;
              margin-left: 20px;
              margin-right: 20px;
            }
            body {
              margin: 0;
            }
            /* 其他自訂樣式 */
          }
        `
      };
    }
  },
  mounted() {
    this.toggleEditorMode();
  },
  methods: {
    async toggleEditorMode() {
      this.isEdited = !this.isEdited;
      if (this.editorInstance) {
        this.editorInstance.mode.set(this.isEdited ? 'design' : 'readonly');  // 編輯模式
        this.applyIframeStyles();
        if (this.isEdited) {
          this.content = await revertTemplate(this.content)
        } else {
          this.content = await applyTemplate(this.content)
        }
      }
    },
    applyIframeStyles() {
      const iframe = this.editorInstance.iframeElement;
      if (iframe){
        if (this.isEdited) {
          iframe.style.pointerEvents = 'auto';   // 恢復點擊
          iframe.style.userSelect = 'text';      // 恢復選取
          iframe.contentDocument.body.style.cursor = 'text';  // 顯示游標
        } else {
          iframe.style.pointerEvents = 'none';  // 禁止點擊與聚焦
          iframe.style.userSelect = 'none';     // 禁止選取內容
          iframe.contentDocument.body.style.cursor = 'default'; // 游標消失
        }
      }
    }
  }
};
</script>