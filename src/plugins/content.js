import { bitable, FieldType } from "@lark-base-open/js-sdk";
import { format as formatDate } from 'date-fns';
// **套用樣板**
export async function applyTemplate(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const fields = doc.querySelectorAll('.template-field');

  const activeTable = await bitable.base.getActiveTable();
  const selection = await bitable.base.getSelection();

  let recordId = "";

  if (selection.recordId) {
    recordId = selection.recordId
  } else {
    const view = await activeTable.getViewById(selection.viewId);
    const recordIdList = await view.getVisibleRecordIdList();
    recordId = recordIdList[0]
  }

  for (let field of fields) {
    const tableId = field.getAttribute('data-tableid');
    const fieldId = field.getAttribute('data-fieldid');
    const fieldType = field.getAttribute('data-fieldtype');
    const father_fieldId = field.getAttribute('data-father-field');

    if (father_fieldId != "*") {
      const father_fieldData = await activeTable.getFieldById(father_fieldId);
      const father_fieldObject = await father_fieldData.getValue(recordId)
      const sub_table = await bitable.base.getTableById(tableId);


      if (father_fieldObject == null) {
        field.innerText = '';
      } else {
        let result_array = []
        for (let index = 0; index < father_fieldObject.recordIds.length; index++) {
          const sub_recordId = father_fieldObject.recordIds[index];
          const fieldData = await sub_table.getFieldById(fieldId);
          const fieldMeta = await sub_table.getFieldMetaById(fieldId);
          const fieldObject = await fieldData.getValue(sub_recordId)

          result_array.push({
            "object": fieldObject,
            "fieldMeta": fieldMeta
          })
        }

        Promise.all(
          result_array.map(item =>
            covertFileTypeData(fieldType, item.object, item.fieldMeta)
          )
        ).then(results => {
          field.innerHTML = results.join(","); // 合併結果並設定 innerHTML
        });

      }
    } else {
      const fieldData = await activeTable.getFieldById(fieldId);
      const fieldMeta = await activeTable.getFieldMetaById(fieldId);
      const fieldObject = await fieldData.getValue(recordId)
      if (fieldObject == null) {
        field.innerText = ''; // 無資料
      } else {
        field.innerHTML = await covertFileTypeData(fieldType, fieldObject, fieldMeta)
      }
    }
  }
  // console.log(doc.body.innerHTML)
  return doc.body.innerHTML || ''
}

// **還原樣板**
export function revertTemplate(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const fields = doc.querySelectorAll('.template-field');

  for (let field of fields) {
    const data = field.getAttribute('data-fieldname');
    field.innerText = `{{${data}}}` || '[無資料]';
  }

  return doc.body.innerHTML
}

async function covertFileTypeData(fieldType, valueData, fieldData) {
  switch (fieldType) {
    case FieldType.Text.toString():
      return Array.isArray(valueData) ? valueData.map(item => item.text || item.name).join("、") : '';
    case FieldType.AutoNumber.toString():
    case FieldType.Number.toString():
      return Array.isArray(valueData) ? valueData.map(item => item.value).join("、") : valueData;
    case FieldType.SingleSelect.toString():
    case FieldType.MultiSelect.toString():
      return Array.isArray(valueData) ? valueData.map(item => item.text || item.name).join("、") : valueData.text;
    case FieldType.CreatedTime.toString(): // 創建時間
    case FieldType.ModifiedTime.toString(): // 最後更新時間
    case FieldType.DateTime.toString(): // 日期      
      return formatDate(new Date(valueData), fieldData.property.dateFormat)
    case FieldType.Checkbox.toString():
      return valueData ? "✔" : "X";
    case FieldType.CreatedUser.toString(): // 創建人
    case FieldType.ModifiedUser.toString(): // 修改人
    case FieldType.User.toString():
      return valueData.map(item => item.name).join("、");
    case FieldType.Phone.toString(): // 電話號碼
      return valueData
    case FieldType.Url.toString(): // 超連結
      return valueData.map(item => `[${item.text}](${item.link})`).join("、");
    case FieldType.Attachment.toString(): // 附件  // 這裡比較麻煩
      {
        let result = '';
        const tempTable = await bitable.base.getTableById(valueData[0].permission.tableId);
        const attachmentField = await tempTable.getField(valueData[0].permission.fieldId);
        const attachmentUrls = await attachmentField.getAttachmentUrls(valueData[0].permission.recordId);
        for (let i = 0; i < attachmentUrls.length; i++) {
          const imgUrl = attachmentUrls[i];
          console.log(imgUrl)
          result += `<img style='width: 100%; height: 100%;' src='${imgUrl}' />`;
        }
        return result;
      }
    case FieldType.Lookup.toString(): // 這裡比較麻煩
      return valueData.map(item => item.value || item.text || item).join("、");
    case FieldType.Location.toString():
      return valueData.fullAddress
    case FieldType.GroupChat.toString():
      return valueData.map(item => item.text || item.name).join("、");
    case FieldType.Progress.toString():
      return `${valueData * 100}%`;
    case FieldType.Currency.toString():
      return new Intl.NumberFormat("en-US", { style: "currency", currency: fieldData.property.currencyCode, minimumFractionDigits: fieldData.property.decimalDigits }).format(valueData);
    case FieldType.Barcode.toString():
      {
        let text = ''
        if (valueData.length == 0) {
          return ''
        } else {
          for (let index = 0; index < valueData.length; index++) {
            const element = valueData[index];
            if (element.type == 'text') {
              text += element.text
            }
          }
        }
        return `<img src='https://barcodeapi.org/api/auto/${text}'/>`
      }
    case FieldType.Rating.toString():
      return `${valueData} / ${fieldData.property.max}`
    case FieldType.Email.toString():
      return valueData
    case FieldType.Formula.toString():
      if (typeof valueData == "object") {
        return valueData.map(item => item.text || item.name).join("、")
      } else {
        return valueData
      }
    case FieldType.SingleLink.toString():
    case FieldType.DuplexLink.toString():
      return valueData.text;
    default:
      return valueData;
  }

}
