import { MiMC } from '$lib/mimc';

// Create a new instance of MiMC
const mimc = new MiMC();

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
	const { threshold, maxIterations } = event.data;

	let nonce = 0;
	let result = '';

	while (nonce < maxIterations) {
		result = mimc.hash(BigInt(nonce));

		// Convert hex result to BigInt and compare with threshold
		const hashValue = BigInt(result);
		const hashThreshold = BigInt(threshold);

		const moduloRemain = hashValue % 10_000n;
		const thresholHit = moduloRemain < 500n;

		if (thresholHit) {
			console.log('HIT! FOUND');
			self.postMessage({
				success: true,
				nonce,
				result
			});
			return;
		}

		if (nonce % 1000 === 0) {
			console.log('mined nonce', nonce, 'with result', result);
		}

		nonce++;
	}

	// If no solution found
	self.postMessage({
		success: false,
		error: 'No solution found within max iterations'
	});
});
