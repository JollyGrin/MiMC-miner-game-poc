import { MiMC } from '$lib/mimc';

// Create a new instance of MiMC
const mimc = new MiMC();
const thresholdSize = 10_000_000n;

function percentageOfBigInt(value: bigint, percentage: number): bigint {
	return (value * BigInt(Math.round(percentage * 100))) / 100n;
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
	const { threshold, maxIterations } = event.data;

	const percentage = BigInt(Math.floor(threshold * 1_000_000));
	let nonce = event.data.nonce ?? 0;
	let iteration = 0;
	let result = '';

	while (iteration < maxIterations) {
		result = mimc.hash(BigInt(nonce));

		// Convert hex result to BigInt and compare with threshold
		const hashValue = BigInt(result);

		const moduloRemain = hashValue % thresholdSize;
		const hitTarget = (thresholdSize * percentage) / 1_000_000n;
		console.info(`Found ${moduloRemain}: (must be below ${hitTarget})`);
		const thresholdHit = moduloRemain < hitTarget;

		if (thresholdHit) {
			console.info(
				'HIT! FOUND',
				hitTarget,
				moduloRemain,
				moduloRemain < hitTarget
			);
			self.postMessage({
				success: true,
				nonce,
				result,
				iteration,
				moduloRemain
			});
			return;
		}

		iteration++;
		nonce++;
	}

	// If no solution found
	self.postMessage({
		success: false,
		error: 'No solution found within max iterations'
	});
});
