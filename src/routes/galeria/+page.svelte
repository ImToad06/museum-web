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

<div class="space-y-8 md:space-y-12">
	<div class="space-y-3 text-center md:space-y-4">
		<h2 class="font-serif text-3xl font-bold text-stone-900 md:text-4xl">Colección del MAMB</h2>
		<p class="mx-auto max-w-2xl text-base text-stone-600 md:text-lg">
			Explore nuestra selección de obras de arte. Cada pieza cuenta una historia única de nuestra
			herencia y creatividad.
		</p>
	</div>

	{#if data.obras.length === 0}
		<div
			class="rounded-lg border-2 border-dashed border-stone-300 bg-stone-100 py-16 text-center md:py-20"
		>
			<p class="text-lg text-stone-500">No hay obras en la galería todavía.</p>
			<a href="/subir" class="mt-4 inline-block font-bold text-stone-900 hover:underline">
				Sé el primero en subir una obra &rarr;
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
			{#each data.obras as obra (obra.id)}
				<button
					onclick={() => openModal(obra)}
					class="group overflow-hidden rounded-lg border border-stone-200 bg-white text-left shadow-sm transition-all duration-300 hover:shadow-xl focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:outline-none"
				>
					<article>
						<div class="aspect-[4/3] overflow-hidden bg-stone-200">
							<img
								src={obra.imagen_url}
								alt={obra.titulo}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						</div>
						<div class="space-y-2 p-4 md:p-6">
							<h3 class="font-serif text-lg font-bold text-stone-800 md:text-xl">{obra.titulo}</h3>
							<div class="flex flex-col text-sm text-stone-600">
								<span class="font-medium">{obra.autor}</span>
								<span
									>{new Date(obra.fecha).toLocaleDateString('es-CO', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}</span
								>
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
			class="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="presentation"
		>
			<button
				onclick={closeModal}
				class="absolute top-3 right-3 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-stone-900/50 p-2 text-white transition-colors hover:bg-stone-900 sm:top-4 sm:right-4"
				aria-label="Cerrar modal"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 sm:h-6 sm:w-6"
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
				<div class="max-h-[60vh] overflow-hidden bg-stone-200 md:max-h-[80vh] md:max-w-[70%]">
					<img
						src={selectedObra.imagen_url}
						alt={selectedObra.titulo}
						class="h-full w-full object-contain"
					/>
				</div>
				<div class="flex flex-col justify-center p-6 md:max-w-[30%] md:p-8">
					<h3 class="font-serif text-2xl font-bold text-stone-900 md:text-3xl">
						{selectedObra.titulo}
					</h3>
					<div class="mt-3 space-y-2 md:mt-4">
						<p class="text-base font-medium text-stone-700 md:text-lg">{selectedObra.autor}</p>
						<p class="text-stone-500">
							{new Date(selectedObra.fecha).toLocaleDateString('es-CO', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</p>
					</div>
					<div class="mt-6 border-t border-stone-100 pt-4 md:mt-8 md:pt-6">
						<p class="text-sm text-stone-400 italic">Parte de la colección digital permanente.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
