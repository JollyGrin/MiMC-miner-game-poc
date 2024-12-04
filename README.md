# Miner Game PoC

To learn more about the MiMC hashing function when used in browser, setting up a mini demo.

## Game Idea

You are attempting to setup a hackers network state collective to collaborate on projects. You will need to scour the web for recruits, send out invites, wait for responses (yes/no), and then send off recruits on missions to earn funds.

You setup a CLI tool on your computer.
- run a program to scour social networks to create a list of recruits to cold-call
- send out encrypted invites and wait for responses 
- when recruits say yes, you can task them with missions to earn funds for your state


### Todo

- [ ] implement a MiMC webworker
- [ ] setup a nonce restriction to limit how often one can hit a successful result
- [ ] use localstorage (with zustand?) to manage saving progress

- [ ] add server instead of webworker (2nd page as example)
- [ ] perlin noise: generate stuff procedurally with the hashes


## Setup Static Github Pages

1. Update adapter to static in `svelte.config.ts`
2. update `+layout.ts`
