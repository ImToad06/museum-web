<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Museo Digital de Colombia</title>
</svelte:head>

<div class="min-h-screen bg-stone-50 text-stone-900">
	<header class="bg-stone-900 text-stone-50 shadow-md">
		<div class="container mx-auto flex items-center justify-between px-4 py-6">
			<h1 class="font-serif text-2xl font-bold tracking-tight">
				<a href="/">Museo Digital</a>
			</h1>
			<nav>
				<ul class="flex space-x-8 font-medium">
					<li>
						<a href="/" class="transition-colors hover:text-stone-300">Galería</a>
					</li>
					<li>
						<a href="/subir" class="transition-colors hover:text-stone-300">Subir Obra</a>
					</li>
				</ul>
			</nav>
		</div>
	</header>

	<main class="container mx-auto px-4 py-12">
		{@render children()}
	</main>

	<footer class="border-t border-stone-200 bg-stone-100 py-8">
		<div class="container mx-auto px-4 text-center text-stone-600">
			<p>&copy; 2024 Museo Digital de Colombia. Preservando nuestra historia.</p>
		</div>
	</footer>
</div>
