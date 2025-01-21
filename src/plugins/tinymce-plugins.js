import html2pdf from "html2pdf.js"

export function registerButtons(editor) {
   editor.ui.registry.addButton('newprint', {
    icon: 'print',
    tooltip: '列印',
    context: 'mode:readonly',  // **僅在 readonly 模式顯示**
    onAction: () => {
      
      // 执行列印命令
      editor.execCommand('mcePrint')
    }
  })

  editor.ui.registry.addButton('exportPDF', {
    icon: 'export-pdf',
    context: 'mode:readonly',
    onAction() {
      if (this.isEdited) {
        this.showNotification(editor, '請先套用樣板才能匯出 PDF！', 'warning')
        return
      }
      
      html2pdf().from(editor.getContent()).set({
        margin: 10,
        filename: '內容輸出.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      }).save().then(() => {
        this.showNotification(editor, 'PDF 匯出成功！', 'success')
      })
    }
  })
  }
  