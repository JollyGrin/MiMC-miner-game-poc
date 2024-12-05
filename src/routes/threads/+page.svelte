<script lang="ts">
	import { onMount } from 'svelte';

	const baseUrl = 'http://localhost:3001';

	let thresholdMagnitude = 3; // Initial value corresponding to 0.001
	let threshold = 0.001; // Initial threshold
	let maxIterations = 100_000;
	let miningResult: {
		nonce?: number;
		result?: string;
		moduloRemain?: bigint;
		iteration?: number;
		chunks?: number;
	} = {};
	let isMining = false;
	let errorMessage = '';
	let taskId: string | null = null;

	// Mapping of slider value to threshold
	$: {
		// Magnitudes from 10^-6 to 10^-1
		const magnitudes = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1];
		threshold = magnitudes[thresholdMagnitude];
	}

	async function startMining() {
		if (isMining) return;

		isMining = true;
		miningResult = {};
		errorMessage = '';
		taskId = null;

		try {
			// Send a POST request to start the task
			const response = await fetch(baseUrl + '/start-task', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ threshold, maxIterations })
			});

			if (!response.ok) {
				throw new Error('Failed to start mining task.');
			}

			const data = await response.json();
			taskId = data.taskId;

			if (taskId === null) {
				throw new Error('No taskId created');
			}

			// Start polling for task status
			pollTaskStatus(taskId);
		} catch (error) {
			isMining = false;
			errorMessage = error instanceof Error ? error.message : 'An error occurred.';
		}
	}

	async function pollTaskStatus(taskId: string) {
		if (!taskId) return;

		try {
			while (isMining) {
				const response = await fetch(baseUrl + `/task-status/${taskId}`);
				if (!response.ok) {
					throw new Error('Failed to fetch task status.');
				}

				const status = await response.json();

				if (status.status === 'completed') {
					isMining = false;

					if (status.success) {
						miningResult = {
							nonce: status.nonce,
							result: status.result,
							moduloRemain: status.moduloRemain,
							iteration: status.iteration
						};
						errorMessage = '';
					} else {
						errorMessage = status.error;
						miningResult = {};
					}
					break;
				}

				// Wait before polling again
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		} catch (error) {
			isMining = false;
			errorMessage = error instanceof Error ? error.message : 'An error occurred.';
		}
	}
</script>

<div class="grid h-screen place-items-center p-4">
	<div
		class="grid min-h-[20rem] w-full max-w-[50rem] gap-8 bg-orange-300 p-4 font-mono text-gray-500"
	>
		<div class="flex flex-col">
			<div class="flex justify-between">
				<p>MiMC Miner - With Threads</p>
				<a href="/">webworker</a>
				<a href="/server">server</a>
			</div>

			<p class="text-orange-200">
				{Array.from({ length: 40 })
					.map(() => '/')
					.toString()
					.replaceAll(',', '')}
			</p>
			<code class=" rounded bg-gray-200 p-2">
				<span class="text-gray-300">// open seperate terminal to start server </span>
				<br />
				<span> pnpm run server:threads </span>
			</code>
			<p>Mine MiMC hashes until you find one below the threshold</p>
			<p>Runs with server threads (open console to view mining logs)</p>
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
					<p>Iteration: {miningResult?.iteration}</p>
				{/if}

				{#if errorMessage}
					<p>{errorMessage}</p>
				{/if}
			</div>
		</div>
	</div>
</div>
