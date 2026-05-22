<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let mobileMenuOpen = $state(false);

	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>MAMB - Museo de Arte Moderno de Barranquilla</title>
</svelte:head>

<div class="min-h-screen bg-stone-50 text-stone-900">
	<header class="bg-stone-900 text-stone-50 shadow-md">
		<div class="container mx-auto flex items-center justify-between px-4 py-4 md:py-6">
			<h1 class="font-serif text-xl font-bold tracking-tight md:text-2xl">
				<a href="/" class="transition-colors hover:text-stone-300">MAMB</a>
			</h1>

			<!-- Mobile menu button -->
			<button
				class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 transition-colors hover:bg-stone-800 md:hidden"
				onclick={toggleMenu}
				aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
				aria-expanded={mobileMenuOpen}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					{#if mobileMenuOpen}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					{/if}
				</svg>
			</button>

			<!-- Desktop nav -->
			<nav class="hidden md:block">
				<ul class="flex space-x-8 font-medium">
					<li>
						<a href="/" class="transition-colors hover:text-stone-300">Inicio</a>
					</li>
					<li>
						<a href="/galeria" class="transition-colors hover:text-stone-300">Galería</a>
					</li>
					<li>
						<a href="/subir" class="transition-colors hover:text-stone-300">Subir Obra</a>
					</li>
				</ul>
			</nav>
		</div>

		<!-- Mobile nav -->
		{#if mobileMenuOpen}
			<nav class="border-t border-stone-800 px-4 pb-4 md:hidden">
				<ul class="space-y-1 pt-2 font-medium">
					<li>
						<a
							href="/"
							class="block rounded-md px-2 py-3 transition-colors hover:bg-stone-800 hover:text-stone-300"
							onclick={closeMenu}
						>
							Inicio
						</a>
					</li>
					<li>
						<a
							href="/galeria"
							class="block rounded-md px-2 py-3 transition-colors hover:bg-stone-800 hover:text-stone-300"
							onclick={closeMenu}
						>
							Galería
						</a>
					</li>
					<li>
						<a
							href="/subir"
							class="block rounded-md px-2 py-3 transition-colors hover:bg-stone-800 hover:text-stone-300"
							onclick={closeMenu}
						>
							Subir Obra
						</a>
					</li>
				</ul>
			</nav>
		{/if}
	</header>

	<main class="container mx-auto px-4 py-8 md:py-12">
		{@render children()}
	</main>

	<footer class="border-t border-stone-200 bg-stone-100 py-6 md:py-8">
		<div class="container mx-auto px-4 text-center text-stone-600">
			<p class="text-sm md:text-base">
				&copy; 2024 MAMB - Museo de Arte Moderno de Barranquilla. Preservando nuestra historia.
			</p>
		</div>
	</footer>
</div>
