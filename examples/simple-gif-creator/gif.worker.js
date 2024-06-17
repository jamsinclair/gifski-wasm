import encode from 'gifski-wasm/multi-thread';

let encoding = false;

addEventListener('message', async function (event) {
        if (encoding) return;
        encoding = true;
        console.log('starting encoding');
        let start = performance.now();
        const result = await encode(event.data);
        console.log('finished encoding', performance.now() - start, 'ms');
        postMessage(result);
});
