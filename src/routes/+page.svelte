<script lang="ts">
	import { onMount } from 'svelte';

	let worker: Worker | null = null;
	let inputValue = '';
	let keyValue = '';
	let hashResult = '';
	let errorMessage = '';
	let isLoading = false;

	onMount(() => {
		// Create the worker
		worker = new Worker(new URL('$lib/mimc.worker.ts', import.meta.url), {
			type: 'module'
		});

		// Listen for messages from the worker
		worker.addEventListener('message', (event) => {
			isLoading = false;
			if (event.data.success) {
				hashResult = event.data.result;
				errorMessage = '';
			} else {
				errorMessage = event.data.error;
				hashResult = '';
			}
		});

		// Cleanup worker when component is destroyed
		return () => {
			worker?.terminate();
		};
	});

	function handleHash() {
		if (!worker) {
			console.log('NO WORKER!');
			return;
		}

		isLoading = true;
		hashResult = '';
		errorMessage = '';

		// Determine which method to use based on key input
		const messageType = keyValue ? 'hashWithKey' : 'hash';
		const messageData =
			messageType === 'hash'
				? { type: 'hash', input: inputValue }
				: { type: 'hashWithKey', input: inputValue, key: keyValue };

		worker.postMessage(messageData);
	}
</script>

<div class="grid h-screen place-items-center p-4">
	<div
		class="grid h-full max-h-[20rem] w-full max-w-[50rem] bg-orange-300 p-4 font-mono text-gray-500"
	>
		<div class="flex flex-col">
			<p>Network Scraper CLI</p>
			<p class="text-orange-200">
				{Array.from({ length: 40 })
					.map(() => '/')
					.toString()
					.replaceAll(',', '')}
			</p>
			<p>Scrape social networks to find contacts that match specified criteria.</p>
			<p>Once you have contacts, reach out via signed messages to recruit.</p>
		</div>
		<div class="flex gap-4">
			<div>
				<p>Contacts found: 0</p>
				<p>Pending invites sent: 0</p>
			</div>
			<div>
				<p>Recruits joined: 0</p>
				<p>Recruits available: 0/0</p>
			</div>
		</div>
		<div class="flex items-center gap-4">
			{#if isLoading}
				<pre>Loading!</pre>
			{/if}

			<button on:click={handleHash} class="self-end rounded bg-orange-200 p-3">
				{'> Start Scraping'}
			</button>
			<div class="h-full flex-grow-[1] rounded bg-orange-200 p-1">
				{#if hashResult}
					<pre>{hashResult}</pre>
				{/if}

				{#if errorMessage}
					<pre>{errorMessage}</pre>
				{/if}
			</div>
		</div>
	</div>
</div>
