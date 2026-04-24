<script lang="ts">
	let { data } = $props();

	let selectedObra = $state<
		| {
				id: number;
				titulo: string;
				autor: string;
				fecha: string;
				imagen_url: string;
				creado_en: string;
		  }
		| undefined
	>(undefined);

	function openModal(obra: (typeof data.obras)[0]) {
		selectedObra = obra;
		document.body.style.overflow = 'hidden';
	}

	function closeModal() {
		selectedObra = undefined;
		document.body.style.overflow = 'auto';
	}
</script>

<div class="space-y-12">
	<div class="space-y-4 text-center">
		<h2 class="font-serif text-4xl font-bold text-stone-900">Colección del Museo</h2>
		<p class="mx-auto max-w-2xl text-stone-600">
			Explore nuestra selección de obras de arte digitales. Cada pieza cuenta una historia única de
			nuestra herencia y creatividad.
		</p>
	</div>

	{#if data.obras.length === 0}
		<div class="rounded-lg border-2 border-dashed border-stone-300 bg-stone-100 py-20 text-center">
			<p class="text-lg text-stone-500">No hay obras en la galería todavía.</p>
			<a href="/subir" class="mt-4 inline-block font-bold text-stone-900 hover:underline">
				Sé el primero en subir una obra &rarr;
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
			{#each data.obras as obra}
				<button
					onclick={() => openModal(obra)}
					class="group overflow-hidden rounded-lg border border-stone-200 bg-white text-left shadow-sm transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
				>
					<article>
						<div class="aspect-[4/3] overflow-hidden bg-stone-200">
							<img
								src={obra.imagen_url}
								alt={obra.titulo}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						</div>
						<div class="space-y-2 p-6">
							<h3 class="font-serif text-xl font-bold text-stone-800">{obra.titulo}</h3>
							<div class="flex flex-col text-sm text-stone-600">
								<span class="font-medium">{obra.autor}</span>
								<span>{new Date(obra.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
							</div>
						</div>
					</article>
				</button>
			{/each}
		</div>
	{/if}
</div>

{#if selectedObra}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 p-4 transition-opacity duration-300"
		onclick={closeModal}
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
		role="button"
		tabindex="0"
	>
		<div
			class="relative max-h-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="presentation"
		>
			<button
				onclick={closeModal}
				class="absolute right-4 top-4 z-10 rounded-full bg-stone-900/50 p-2 text-white transition-colors hover:bg-stone-900"
				aria-label="Cerrar modal"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<div class="flex flex-col md:flex-row">
				<div class="bg-stone-200 md:max-w-[70%]">
					<img
						src={selectedObra.imagen_url}
						alt={selectedObra.titulo}
						class="h-auto w-full object-contain"
					/>
				</div>
				<div class="flex flex-col justify-center p-8 md:max-w-[30%]">
					<h3 class="font-serif text-3xl font-bold text-stone-900">{selectedObra.titulo}</h3>
					<div class="mt-4 space-y-2">
						<p class="text-lg font-medium text-stone-700">{selectedObra.autor}</p>
						<p class="text-stone-500">
							{new Date(selectedObra.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
						</p>
					</div>
					<div class="mt-8 border-t border-stone-100 pt-6">
						<p class="text-sm italic text-stone-400">Parte de la colección digital permanente.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
