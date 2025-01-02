import { App } from './app';

async function main() {
    const app = new App(3306);
    await app.listen();
}

main();
