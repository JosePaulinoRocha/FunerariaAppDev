import { App } from './app';

async function main() {
    const app = new App(3309);
    await app.listen();
}

main();
