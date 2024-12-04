export const prerender = true;

export function load() {
	const basePath =
		import.meta.env.MODE === 'production' ? '/miner-game-poc' : '';
	return { basePath };
}
