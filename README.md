# C++ Code Lab

Interactive C++ learning platform with built-in IDE, test runner, and AI teacher.

## Requirements

Server must install g++
```bash
sudo apt install g++
```

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure required variables in `.env`:
   ```env
   # Required
   GENAI_API_KEY=your_genai_api_key_here

   # Optional (has defaults)
   LOG_INTAKE_URL=https://digitech-sandbox.sut.ac.th/c-playground/api/log-intake
   ```

3. For **external log-intake server** only (not needed for K8s pods):
   ```env
   POSTGRES_URL=postgresql://username:password@host:5432/database
   ```

## Documentation

- [LOGGING.md](./LOGGING.md) - Logging system and analytics
- [DATABASE.md](./DATABASE.md) - Database schema and setup

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
