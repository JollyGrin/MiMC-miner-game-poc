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
	const { type, input, key } = event.data;

	try {
		let result;
		console.log({ input, key });
		let safeInput = safeConvertToBigInt(input);
		let safeKey = safeConvertToBigInt(key);
		switch (type) {
			case 'hash':
				result = mimc.hash(safeInput);
				break;
			case 'hashWithKey':
				result = mimc.hashWithKey(safeInput, key ? safeKey : BigInt(0));
				break;
			default:
				throw new Error('Invalid operation type');
		}

		// Send the result back to the main thread
		self.postMessage({ success: true, result });
	} catch (error) {
		// Send any errors back to the main thread
		self.postMessage({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});
