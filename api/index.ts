import { App } from './app';

async function main() {
    const app = new App(8081);
    await app.listen();
}

main();
