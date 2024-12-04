<script lang="ts">
	import { onMount } from 'svelte';

	let worker: Worker | null = null;
	let threshold = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'; // Adjustable
	let maxIterations = 50_000;
	let miningResult: { nonce?: number; result?: string } = {};
	let isMining = false;
	let errorMessage = '';

	onMount(() => {
		worker = new Worker(new URL('$lib/mimc.worker.ts', import.meta.url), {
			type: 'module'
		});

		worker.addEventListener('message', (event) => {
			isMining = false;
			if (event.data.success) {
				miningResult = {
					nonce: event.data.nonce,
					result: event.data.result
				};
				errorMessage = '';
			} else {
				errorMessage = event.data.error;
				miningResult = {};
			}
		});

		return () => worker?.terminate();
	});

	function startMining() {
		if (!worker) return;

		isMining = true;
		miningResult = {};
		errorMessage = '';

		worker.postMessage({
			threshold,
			maxIterations
		});
	}
</script>

<div class="grid h-screen place-items-center p-4">
	<div
		class="grid min-h-[20rem] w-full max-w-[50rem] gap-8 bg-orange-300 p-4 font-mono text-gray-500"
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
		<div class="flex flex-col items-center gap-4">
			<button
				on:click={!isMining ? startMining : null}
				class={`w-fit min-w-[12rem] self-start rounded bg-orange-200 p-3 ${isMining && 'cursor-wait opacity-50'}`}
			>
				{isMining ? '> scrapping...' : '> Start Scraping'}
			</button>
			<div class="h-full min-h-[5rem] w-full flex-grow-[1] break-words rounded bg-orange-200 p-1">
				{#if isMining}
					<p>currently mining...</p>
				{/if}

				{#if miningResult.nonce !== undefined}
					<p>Nonce: {miningResult.nonce}</p>
					<p>Hash: {miningResult.result}</p>
				{/if}

				{#if errorMessage}
					<p>{errorMessage}</p>
				{/if}
			</div>
		</div>
	</div>
</div>
