import { MiMC } from '../src/lib/mimc';

const tasks: Record<string, any> = {};

function startHashing(
	threshold: number,
	maxIterations: number,
	taskId: string
) {
	const mimc = new MiMC();
	const thresholdSize = 10_000_000n;
	const percentage = BigInt(Math.floor(threshold * 1_000_000));
	let nonce = Date.now();
	let iteration = 0;
	let result = '';

	console.log(
		`[TASK STARTED] Task ID: ${taskId}, Threshold: ${threshold}, Max Iterations: ${maxIterations}`
	);

	while (iteration < maxIterations) {
		result = mimc.hash(BigInt(nonce));
		const hashValue = BigInt(result);
		const moduloRemain = hashValue % thresholdSize;
		const hitTarget = (thresholdSize * percentage) / 1_000_000n;

		if (moduloRemain < hitTarget) {
			console.log(
				`[TASK COMPLETED] Task ID: ${taskId}, Nonce: ${nonce}, Iteration: ${iteration}`
			);
			tasks[taskId] = {
				status: 'completed',
				success: true,
				nonce,
				result,
				iteration
			};
			return;
		}

		iteration++;
		nonce = Date.now();
	}

	console.log(
		`[TASK FAILED] Task ID: ${taskId}, No solution found within max iterations`
	);
	tasks[taskId] = {
		status: 'completed',
		success: false,
		error: 'No solution found'
	};
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*', // Allow all origins (use specific origin in production)
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

//@ts-expect-error: type issue
Bun.serve({
	port: 3001,
	fetch(req) {
		// Handle preflight requests
		if (req.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(req.url);

		if (url.pathname === '/start-task' && req.method === 'POST') {
			console.log(`[POST] /start-task - Received request`);
			return req.json().then((body) => {
				const { threshold, maxIterations } = body;
				const taskId = Date.now().toString();
				tasks[taskId] = { status: 'in-progress' };

				console.log(`[TASK INITIATED] Task ID: ${taskId}`);
				// Run hashing asynchronously
				setTimeout(() => startHashing(threshold, maxIterations, taskId), 0);

				return new Response(JSON.stringify({ taskId }), {
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					},
					status: 202
				});
			});
		}

		if (url.pathname.startsWith('/task-status/') && req.method === 'GET') {
			const taskId = url.pathname.split('/').pop();
			console.log(`[GET] /task-status/${taskId} - Received request`);
			const task = tasks[taskId!];
			if (!task) {
				console.log(`[TASK NOT FOUND] Task ID: ${taskId}`);
				return new Response(JSON.stringify({ error: 'Task not found' }), {
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json'
					},
					status: 404
				});
			}
			console.log(`[TASK STATUS] Task ID: ${taskId} - Status: ${task.status}`);
			return new Response(JSON.stringify(task), {
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json'
				},
				status: 200
			});
		}

		console.log(
			`[UNKNOWN REQUEST] Path: ${url.pathname}, Method: ${req.method}`
		);
		return new Response(JSON.stringify({ error: 'Not Found' }), {
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json'
			},
			status: 404
		});
	}
});
