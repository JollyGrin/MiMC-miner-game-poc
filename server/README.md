# mimc-server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.36. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

---

```
% curl -X POST http://localhost:3001/start-task \
    -H "Content-Type: application/json" \
    -d '{"threshold": 0.5, "maxIterations": 1000000}'

{"taskId":"1733368538404"}

% curl http://localhost:3001/task-status/1733368538404
{"status":"completed","success":true,"nonce":1733368538407,"result":"0x18e1e7b5ca64b2972b725ae0e92f1f48a0948a19df921c7f4640c6203dff7161","iteration":0}%  
```
