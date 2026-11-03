# Rules: 
{ "permissions": { "deny": ["Read(./.env)", "Read(./.env.*)"] } }

Always keep a copy of any plan we create in the docs folder. 

Always add tasks that need to be completed from our planning sessions or any prompts to a master task list called kanban-list.md which is in the root of this project. Add a status next to each task that tells the agents the status of the work (TO DO, IN PROGRESS, COMPLETE)


# Build: Immersive Casino Leaderboard

This is a Leaderboard for an immersive quantum casino. The games in the casino include: 
- Uncertainty  
- Plinko 
- 17 
- Quant'em
- Quabble 

When a player enters the casino they are given a wristband with NFC chip in it. 

As the player goes from game to game their score is written to their record, and overall score is shown on a leader board. We are designing the front end of the leaderboard. 

-- 

### The tech stack for this project is: 

Next.js - code 
Vercel - hosting

--

### The UI/UX: 
Clean modern design that looks like HUD, it should have a futuristic quantum computing feel and vibe. Think Tony Stark / Ironman vibe. It should be modern and look ahead of it's time. It will display the player's username, their avatar image, score achieved on each game, and the total score. 

The leaderboard is ranked by total score, showing the top 10 players with the leader on top. 
--


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
