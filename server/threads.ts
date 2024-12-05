import { MiMC } from '../src/lib/mimc';
import os from 'os';

const tasks: Record<string, any> = {};

interface WorkerMessage {
	success: boolean;
	nonce?: number;
	result?: string;
	iteration?: number;
	moduloRemain?: bigint;
	error?: string;
}

function startHashing(
	threshold: number,
	maxIterations: number,
	taskId: string,
	maxThreads: number = os.cpus().length
): void {
	const chunkSize = Math.ceil(maxIterations / maxThreads);
	const workers: Worker[] = [];
	let completed = false;

	console.log(
		`[TASK STARTED] Task ID: ${taskId}, Threshold: ${threshold}, Max Iterations: ${maxIterations}, Max Threads: ${maxThreads}`
	);

	for (let i = 0; i < maxThreads; i++) {
		const startNonce = i * chunkSize;
		const worker = new Worker(
			new URL('../src/lib/mimc.worker.ts', import.meta.url),
			{
				type: 'module'
			}
		);

		workers.push(worker);

		worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
			const message = event.data;

			if (message.success && !completed) {
				console.log(
					`[TASK COMPLETED] Task ID: ${taskId}, Nonce: ${message.nonce}, Iteration: ${message.iteration}`
				);
				completed = true;

				tasks[taskId] = {
					taskId,
					status: 'completed',
					nonce: message.nonce?.toString(),
					result: message.result?.toString(),
					iteration: message.iteration,
					moduloRemain: message.moduloRemain?.toString(),
					success: true,
					chunks: chunkSize,
					maxThreads,
					workers: workers.length
				};

				// Terminate all workers
				workers.forEach((w) => w.terminate());
			} else if (!message.success && i === workers.length - 1 && !completed) {
				console.log(`[TASK FAILED] Task ID: ${taskId}, No solution found`);
			}
		};

		worker.onerror = (err: ErrorEvent) => {
			console.error(`[WORKER ERROR] Task ID: ${taskId}, Error: ${err.message}`);
		};

		// worker.onexit = (code: number) => {
		// 	if (code !== 0 && !completed) {
		// 		console.error(
		// 			`[WORKER EXIT] Task ID: ${taskId}, Worker exited with code ${code}`
		// 		);
		// 	}
		// };

		// Send initial data to the worker
		worker.postMessage({
			threshold,
			maxIterations: chunkSize,
			startNonce
		});
	}
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

				if (tasks[taskId]?.status !== 'completed') {
					tasks[taskId] = { status: 'in-progress' };
				}

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
