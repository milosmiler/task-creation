<script setup>
import { computed, reactive, watch } from 'vue'
import SectionHeading from '../molecules/SectionHeading.vue'

const props = defineProps({
	categories: {
		type: Array,
		required: true
	},
	editingTask: {
		type: Object,
		default: null
	},
	isSaving: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['submit', 'cancel'])

const emptyForm = () => ({
	title: '',
	description: '',
	status: 'Pendiente',
	due_date: '',
	category_id: ''
})

const form = reactive(emptyForm())

const isEditing = computed(() => Boolean(props.editingTask))

watch(
	() => props.editingTask,
	(task) => {
		Object.assign(form, task ? {
			title: task.title ?? '',
			description: task.description ?? '',
			status: task.status ?? 'Pendiente',
			due_date: task.due_date ?? '',
			category_id: task.category_id ?? ''
		} : emptyForm())
	},
	{ immediate: true }
)

const submitForm = () => {
	emit('submit', {
		title: form.title.trim(),
		description: form.description.trim(),
		status: form.status,
		due_date: form.due_date,
		category_id: Number(form.category_id)
	})

	if (!isEditing.value) {
		Object.assign(form, emptyForm())
	}
}
</script>

<template>
	<form class="panel-form" @submit.prevent="submitForm">
		<SectionHeading eyebrow="Tareas" :title="isEditing ? 'Editar tarea' : 'Nueva tarea'" />

		<label class="field">
			<span>Título</span>
			<input v-model="form.title" type="text" maxlength="120" required />
		</label>

		<label class="field">
			<span>Descripción</span>
			<textarea v-model="form.description" rows="4" required />
		</label>

		<div class="form-row">
			<label class="field">
				<span>Estado</span>
				<select v-model="form.status" required>
					<option>Pendiente</option>
					<option>Completada</option>
				</select>
			</label>

			<label class="field">
				<span>Fecha límite</span>
				<input v-model="form.due_date" type="date" required />
			</label>
		</div>

		<label class="field">
			<span>Categoría</span>
			<select v-model="form.category_id" required>
				<option value="" disabled>Selecciona una categoría</option>
				<option v-for="category in categories" :key="category.id" :value="category.id">
					{{ category.name }}
				</option>
			</select>
		</label>

		<div class="form-actions">
			<button class="primary-button" type="submit" :disabled="isSaving || !categories.length">
				{{ isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear tarea' }}
			</button>

			<button v-if="isEditing" class="ghost-button" type="button" @click="emit('cancel')">
				Cancelar
			</button>
		</div>
	</form>
</template>
