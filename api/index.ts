import { App } from './app';

async function main() {
    const app = new App(3001);
    await app.listen();
}

main();
