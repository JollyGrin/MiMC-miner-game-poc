<script lang="ts">
	import { onMount } from 'svelte';

	let worker: Worker | null = null;

	let thresholdMagnitude = 3; // Initial value corresponding to 0.001
	let threshold = 0.001; // Initial threshold
	let maxIterations = 100_000;
	let miningResult: { nonce?: number; result?: string; moduloRemain?: BigInt } = {};
	let isMining = false;
	let errorMessage = '';

	// Mapping of slider value to threshold
	$: {
		// Magnitudes from 10^-6 to 10^-1
		const magnitudes = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1];
		threshold = magnitudes[thresholdMagnitude];
	}

	onMount(() => {
		worker = new Worker(new URL('$lib/mimc.worker.ts', import.meta.url), {
			type: 'module'
		});

		worker.addEventListener('message', (event) => {
			isMining = false;
			if (event.data.success) {
				miningResult = {
					nonce: event.data.nonce,
					result: event.data.result,
					moduloRemain: event.data.moduloRemain
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
			<p>MiMC Miner</p>
			<p class="text-orange-200">
				{Array.from({ length: 40 })
					.map(() => '/')
					.toString()
					.replaceAll(',', '')}
			</p>
			<p>Mine MiMC hashes until you find one is below the threshold</p>
			<p>Runs within a webworker (open console to view mining logs)</p>
		</div>

		<form>
			<label for="steps-range" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
				Threshold: must be below {threshold * 10_000_000}
			</label>
			<input
				id="steps-range"
				type="range"
				bind:value={thresholdMagnitude}
				min="0"
				max="6"
				step="1"
				class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
			/>
		</form>

		<div class="flex flex-col items-center gap-4">
			<button
				on:click={!isMining ? startMining : null}
				class={`w-fit min-w-[12rem] self-start rounded bg-orange-200 p-3 ${isMining && 'cursor-wait opacity-50'}`}
			>
				{isMining ? '> mining...' : '> Start Mining'}
			</button>
			<div class="h-full min-h-[5rem] w-full flex-grow-[1] rounded bg-orange-200 p-1">
				{#if isMining}
					<p>currently mining...</p>
				{/if}

				{#if miningResult.nonce !== undefined}
					<p>Nonce: {miningResult.nonce}</p>
					<p class="break-all">Hash: {miningResult.result}</p>
					<p>Found: {miningResult.moduloRemain}</p>
				{/if}

				{#if errorMessage}
					<p>{errorMessage}</p>
				{/if}
			</div>
		</div>
	</div>
</div>
