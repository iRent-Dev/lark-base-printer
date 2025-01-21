<template>
	<el-card>
		<template #header>
			<div>{{ displayField.name }}</div>
		</template>
		<el-button @click="handleInsert"><el-icon><Plus /></el-icon>加入</el-button>
	</el-card>
</template>

<script>
import { Plus } from '@element-plus/icons-vue';

export default {
	name: "FieldCard",
	components: {
		Plus
	},
	props: {
		field: {
			type: Object,
			required: true
		},
		subfield: {
			type: Object,
			default: null
		},
		insertVariable: {
			type: Function,
			required: true
		}
	},
	computed: {
		// 根據有無 subfield 決定要顯示的對象
		displayField() {
			return this.subfield || this.field;
		}
	},
	methods: {
		handleInsert() {
			// 根據有無 subfield 決定呼叫邏輯
			if (this.subfield) {
				this.insertVariable(this.subfield, this.field, true);
			} else {
				this.insertVariable(this.field);
			}
		}
	}
}
</script>
