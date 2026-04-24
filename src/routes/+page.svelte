<script lang="ts">
	let { data } = $props();
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
				<article
					class="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
				>
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
							<span>{obra.fecha}</span>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
