<script lang="ts">
	let { form } = $props();
	let isDragging = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();
	let fileName = $state('');

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			if (fileInput) {
				fileInput.files = e.dataTransfer.files;
				fileName = e.dataTransfer.files[0].name;
			}
		}
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			fileName = target.files[0].name;
		}
	}
</script>

<div class="mx-auto max-w-2xl rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
	<h2 class="mb-6 font-serif text-3xl font-bold text-stone-800">Subir Nueva Obra de Arte</h2>

	<p class="mb-8 text-stone-600">
		Complete los siguientes campos para agregar una nueva pieza a la colección del museo digital.
	</p>

	{#if form?.error}
		<div class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
			<p class="text-red-700">{form.error}</p>
		</div>
	{/if}

	<form method="POST" enctype="multipart/form-data" class="space-y-6">
		<div>
			<label for="titulo" class="mb-1 block text-sm font-medium text-stone-700"
				>Título de la Obra</label
			>
			<input
				type="text"
				id="titulo"
				name="titulo"
				required
				placeholder="Ej: El Grito"
				class="w-full rounded-md border border-stone-300 px-4 py-2 transition-all outline-none focus:border-stone-500 focus:ring-stone-500"
			/>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div>
				<label for="autor" class="mb-1 block text-sm font-medium text-stone-700"
					>Nombre del Autor</label
				>
				<input
					type="text"
					id="autor"
					name="autor"
					required
					placeholder="Ej: Vincent van Gogh"
					class="w-full rounded-md border border-stone-300 px-4 py-2 transition-all outline-none focus:border-stone-500 focus:ring-stone-500"
				/>
			</div>

			<div>
				<label for="fecha" class="mb-1 block text-sm font-medium text-stone-700"
					>Fecha de Creación</label
				>
				<input
					type="date"
					id="fecha"
					name="fecha"
					required
					class="w-full rounded-md border border-stone-300 px-4 py-2 transition-all outline-none focus:border-stone-500 focus:ring-stone-500"
				/>
			</div>
		</div>

		<div>
			<span class="mb-1 block text-sm font-medium text-stone-700">Imagen de la Obra</span>
			<label
				for="imagen"
				class="mt-1 flex cursor-pointer justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 transition-colors
        {isDragging ? 'border-stone-600 bg-stone-50' : 'border-stone-300 hover:border-stone-400'}"
				ondragover={handleDragOver}
				ondragenter={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
			>
				<div class="space-y-1 text-center">
					<svg
						class="mx-auto h-12 w-12 text-stone-400"
						stroke="currentColor"
						fill="none"
						viewBox="0 0 48 48"
						aria-hidden="true"
					>
						<path
							d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<div class="flex text-sm text-stone-600">
						<span class="relative rounded-md font-medium text-stone-900 focus-within:outline-none">
							{#if fileName}
								Archivo seleccionado: <span class="text-stone-700">{fileName}</span>
							{:else}
								Haz clic para subir un archivo
							{/if}
						</span>
						{#if !fileName}
							<p class="pl-1 text-stone-500">o arrastrar y suelta</p>
						{/if}
					</div>
					<p class="text-xs text-stone-500">PNG, JPG, GIF hasta 10MB</p>
				</div>
				<input
					id="imagen"
					name="imagen"
					type="file"
					accept="image/*"
					required
					class="sr-only"
					bind:this={fileInput}
					onchange={handleFileChange}
				/>
			</label>
		</div>

		<div class="pt-4">
			<button
				type="submit"
				class="w-full rounded-md bg-stone-900 px-4 py-3 font-bold text-stone-50 shadow-sm transition-colors hover:bg-stone-800"
			>
				Guardar en la Colección
			</button>
		</div>
	</form>
</div>
