import { MiMC } from '$lib/mimc';

// Create a new instance of MiMC
const mimc = new MiMC();

// Helper function to safely convert input to BigInt
function safeConvertToBigInt(input: string | number | bigint): bigint {
	if (typeof input === 'bigint') return input;

	// Remove '0x' prefix if present
	if (typeof input === 'string') {
		input = input.replace(/^0x/, '');
	}

	return BigInt(input);
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
	const { threshold, maxIterations } = event.data;

	let nonce = 0;
	let result = '';

	while (nonce < maxIterations) {
		result = mimc.hash(BigInt(nonce));

		// Convert hex result to BigInt and compare with threshold
		const hashValue = BigInt(result);

		if (hashValue < BigInt(threshold)) {
			self.postMessage({
				success: true,
				nonce,
				result
			});
			return;
		}

		console.log('mined nonce', nonce, 'with result', result);

		nonce++;
	}

	// If no solution found
	self.postMessage({
		success: false,
		error: 'No solution found within max iterations'
	});
});
