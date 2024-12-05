# Miner Game PoC

To learn more about the MiMC hashing function when used in browser, setting up a mini demo.

`/` landing page with webworker

`/server` landing page with longpolling a server
- need to run `bun run ./server/index.ts` to use longpolling



### Todo

- [x] implement a MiMC webworker
- [x] setup a nonce restriction to limit how often one can hit a successful result
- [x] threshold a slider
- [x] add server instead of webworker (2nd page as example)
- [ ] perlin noise: generate stuff procedurally with the hashes
- [ ] use localstorage (with zustand?) to manage saving progress

## Setup Static Github Pages

1. Update adapter to static in `svelte.config.ts`
2. update `+layout.ts`
