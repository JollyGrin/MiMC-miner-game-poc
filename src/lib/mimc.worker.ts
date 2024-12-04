import { MiMC } from '$lib/mimc';

// Create a new instance of MiMC
const mimc = new MiMC();

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
	const { type, input, key } = event.data;

	try {
		let result;
		switch (type) {
			case 'hash':
				result = mimc.hash(input);
				break;
			case 'hashWithKey':
				result = mimc.hashWithKey(input, key);
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
