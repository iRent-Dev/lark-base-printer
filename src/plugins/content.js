import { bitable, FieldType, ToastType } from "@lark-base-open/js-sdk";
import { format as formatDate } from "date-fns";

// **套用樣板**
export async function applyTemplate(content, selectRecordId = "") {
  const activeTable = await bitable.base.getActiveTable();
  const selection = await bitable.base.getSelection();
  // console.log("selection", selection);

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const fields = doc.querySelectorAll(".template-field");

  let recordId = "";

  if (selection.recordId) {
    recordId = selection.recordId;
    // console.log("selection recordId", recordId);
  } else {
    const view = await activeTable.getViewById(selection.viewId);
    const recordIdList = await view.getVisibleRecordIdList();
    // let selectRecordList = await view.getSelectedRecordIdList();

    recordId = recordIdList[0];
    // console.log("Not selection recordId", recordId);
  }

  if (selectRecordId) {
    recordId = selectRecordId;
  }

  // console.log("recordId", recordId);

  for (let field of fields) {
    // field.style.maxWidth = "fit-content";
    field.style.color = "inherit";
    const tableId = field.getAttribute("data-tableid");
    const fieldId = field.getAttribute("data-fieldid");
    const fieldType = field.getAttribute("data-fieldtype");
    const father_fieldId = field.getAttribute("data-father-field");

    try {
      if (father_fieldId != "*") {
        // 關聯欄位

        const father_fieldData = await activeTable.getFieldById(father_fieldId);
        const father_fieldObject = await father_fieldData.getValue(recordId);
        const sub_table = await bitable.base.getTableById(tableId);

        if (father_fieldObject == null) {
          field.innerText = "";
        } else {
          let result_array = [];
          for (
            let index = 0;
            index < father_fieldObject.recordIds.length;
            index++
          ) {
            const sub_recordId = father_fieldObject.recordIds[index];
            const fieldData = await sub_table.getFieldById(fieldId);
            const fieldMeta = await sub_table.getFieldMetaById(fieldId);
            const fieldObject = await fieldData.getValue(sub_recordId);

            result_array.push({
              object: fieldObject,
              fieldMeta: fieldMeta,
            });
          }

          const results = await Promise.all(
            result_array.map((item) =>
              covertFileTypeData(fieldType, item.object, item.fieldMeta)
            )
          );

          // let resultHtml = results.join(
          //   "<hr style='border: 1px solid #000; margin-left: 6.4px; margin-right: 6.4px;'/>"
          // );
          // field.innerHTML = resultHtml; // **確保這行執行**
          // **判斷是否在 table 內**
          let resultHtml = "";
          if (isInsideTable(field)) {
            field.parentElement.parentElement.style.padding = "0";
            resultHtml = convertToTable(field, results);
          } else {
            resultHtml = convertToList(results);
          }
          field.innerHTML = resultHtml;
        }
      } else {
        const fieldData = await activeTable.getFieldById(fieldId);
        const fieldMeta = await activeTable.getFieldMetaById(fieldId);
        const fieldObject = await fieldData.getValue(recordId);
        if (fieldObject == null) {
          field.innerText = ""; // 無資料
        } else {
          field.innerHTML = await covertFileTypeData(
            fieldType,
            fieldObject,
            fieldMeta
          );
        }
      }
    } catch (error) {
      console.error(error);
      field.style.color = "red";
      field.innerText = "無法取得欄位資料";
    }
  }
  // console.log(doc.body.innerHTML)
  return doc.body.innerHTML || "";
}

// **還原樣板**
export function revertTemplate(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const fields = doc.querySelectorAll(".template-field");

  for (let field of fields) {
    field.style.maxWidth = "fit-content";
    const data = field.getAttribute("data-fieldname");
    field.innerText = `{{${data}}}` || "[無資料]";
  }

  return doc.body.innerHTML;
}

async function covertFileTypeData(fieldType, valueData, fieldData) {
  switch (fieldType) {
    case FieldType.Text.toString():
      return Array.isArray(valueData)
        ? valueData.map((item) => item.text || item.name).join("、")
        : "";
    case FieldType.AutoNumber.toString():
    case FieldType.Number.toString():
      return Array.isArray(valueData)
        ? valueData.map((item) => item.value).join("、")
        : valueData.value || valueData;
    case FieldType.SingleSelect.toString():
    case FieldType.MultiSelect.toString():
      return Array.isArray(valueData)
        ? valueData.map((item) => item.text || item.name).join("、")
        : valueData.text;
    case FieldType.CreatedTime.toString(): // 創建時間
    case FieldType.ModifiedTime.toString(): // 最後更新時間
    case FieldType.DateTime.toString(): // 日期
      return formatDate(new Date(valueData), fieldData.property.dateFormat);
    case FieldType.Checkbox.toString():
      return valueData ? "✔" : "X";
    case FieldType.CreatedUser.toString(): // 創建人
    case FieldType.ModifiedUser.toString(): // 修改人
    case FieldType.User.toString():
      return valueData.map((item) => item.name).join("、");
    case FieldType.Phone.toString(): // 電話號碼
      return valueData;
    case FieldType.Url.toString(): // 超連結
      return valueData.map((item) => `[${item.text}](${item.link})`).join("、");
    case FieldType.Attachment.toString(): {
      // 附件  // 這裡比較麻煩
      let result = "";
      const tempTable = await bitable.base.getTableById(
        valueData[0].permission.tableId
      );
      const attachmentField = await tempTable.getField(
        valueData[0].permission.fieldId
      );
      const attachmentUrls = await attachmentField.getAttachmentUrls(
        valueData[0].permission.recordId
      );
      for (let i = 0; i < attachmentUrls.length; i++) {
        const imgUrl = attachmentUrls[i];
        result += `<img style='width: 100%; height: 100%;' src='${imgUrl}' />`;
      }
      return result;
    }
    case FieldType.Lookup.toString(): // 這裡比較麻煩
      if (valueData) {
        return valueData.map((item) => item.text || item.name).join("、");
      } else {
        return "";
      }
    case FieldType.Location.toString():
      return valueData.fullAddress;
    case FieldType.GroupChat.toString():
      return valueData.map((item) => item.text || item.name).join("、");
    case FieldType.Progress.toString():
      return `${valueData * 100}%`;
    case FieldType.Currency.toString():
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: fieldData.property.currencyCode,
        minimumFractionDigits: fieldData.property.decimalDigits,
      }).format(valueData);
    case FieldType.Barcode.toString(): {
      let text = "";
      if (valueData.length == 0) {
        return "";
      } else {
        for (let index = 0; index < valueData.length; index++) {
          const element = valueData[index];
          if (element.type == "text") {
            text += element.text;
          }
        }
      }
      return `<img src='https://barcodeapi.org/api/auto/${text}'/>`;
    }
    case FieldType.Rating.toString():
      return `${valueData} / ${fieldData.property.max}`;
    case FieldType.Email.toString():
      return valueData;
    case FieldType.Formula.toString():
      if (typeof valueData == "object") {
        return valueData.map((item) => item.text || item.name).join("、");
      } else {
        return valueData;
      }
    case FieldType.SingleLink.toString():
    case FieldType.DuplexLink.toString():
      return valueData.text;
    default:
      return valueData;
  }
}

function isInsideTable(field) {
  let parent = field.parentElement;
  while (parent) {
    if (parent.tagName.toLowerCase() === "table") {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

function convertToTable(field, results) {
  let parent = field.parentElement;
  parent.style.padding = "0"; // 避免內部表格有間距

  if (!results || results.length === 0) return "";

  // 建立表格元素
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.border = "none"; // 外框
  table.style.width = "100%";

  // 建立外部 `<tr>`，包含一個大 `<td>`（合併列數）
  const outerRow = document.createElement("tr");
  const outerCell = document.createElement("td");
  outerCell.colSpan = results.length; // 外部 td 合併所有欄位
  outerCell.style.padding = "0"; // 避免內部表格有間距
  outerCell.style.border = "none"; // 外框

  // **建立內部表格**
  const innerTable = document.createElement("table");
  innerTable.style.width = "100%";
  innerTable.style.borderCollapse = "collapse";
  innerTable.style.border = "none"; // 外框

  // **建立 `tr` / `td`**
  for (let i = 0; i < results.length; i++) {
    const row = document.createElement("tr");
    row.style.border = "none"; // 外框

    const cell = document.createElement("td");
    if (i > 0) {
      cell.style.borderTop = "1px solid black"; // 只加上邊框
    } else {
      cell.style.border = "none"; // 第一列不加邊框
    }
    cell.style.padding = "8px";
    cell.innerHTML = results[i]; // 插入對應的資料

    row.appendChild(cell);
    innerTable.appendChild(row);
  }

  // 把內部表格加到外部 `td`，再加到 `tr`
  outerCell.appendChild(innerTable);
  outerRow.appendChild(outerCell);
  table.appendChild(outerRow);

  return table.outerHTML; // 回傳完整表格 HTML
}

function convertToList(values) {
  let ul = document.createElement("ul");
  values.forEach((value) => {
    let li = document.createElement("li");
    li.innerHTML = value;
    ul.appendChild(li);
  });
  return ul.outerHTML;
}
