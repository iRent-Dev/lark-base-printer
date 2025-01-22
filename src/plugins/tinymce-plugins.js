import html2pdf from "html2pdf.js"

export function registerButtons(editor,getPrintSettings) {
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

      const pdfName = prompt("請輸入想要輸出的 PDF 檔案名稱", "sample.pdf");
      
      const content = editor.getContent()
      const printSettings = getPrintSettings()
      
      html2pdf().from(content).set({
        margin: [
          printSettings.marginTop,
          printSettings.marginRight,
          printSettings.marginBottom,
          printSettings.marginLeft,
        ],
        filename: pdfName,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: printSettings.orientation, unit: 'mm', format: 'a4' }
      }).save().then(() => {
        this.showNotification(editor, 'PDF 匯出成功！', 'success')
      })
    }
  })
  }
  