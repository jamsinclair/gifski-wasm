const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

function getImageData (url) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0 );
            resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
    });
}

function blobToBase64(blob) {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
}

let encoding = false;
let framesCollection = [];

const framesPreview = document.querySelector('#frames-preview');
const framesInput = document.querySelector('#frames');
const createGifButton = document.querySelector('#start');

framesInput.addEventListener('change', async (event) => {
    // get the image files from the input element
    createGifButton.disabled = true;
    const files = event.target.files;
    framesCollection = await Promise.all(Array.from(files).map(blobToBase64));
    framesPreview.innerHTML = '';
    for (let i = 0; i < framesCollection.length; i++) {
        const image = document.createElement('img');
        image.src = framesCollection[i];
        framesPreview.appendChild(image);
    }
    setTimeout(() => {
        createGifButton.disabled = false;
    }, 0);
});

createGifButton.addEventListener('click', async (event) => {
    createGifButton.disabled = true;

    if (encoding || framesCollection.length < 1) {
        return;
    }

    encoding = true;

    const frames = [];
    let frameWidth = 0;
    let frameHeight = 0;
    for (let i = 0; i < framesCollection.length; i++) {
        const data = await getImageData(framesCollection[i]);
        if (i === 0) {
            frameWidth = data.width;
            frameHeight = data.height;
        }
        if (data.width !== frameWidth || data.height !== frameHeight) {
            alert('All frames must have the same dimensions');
            encoding = false;
            createGifButton.disabled = false;
            return;
        }
        frames.push(data);
    }

    const worker = new Worker(new URL('./gif.worker.js', import.meta.url), { type: 'module' });

    let quality = parseInt(document.querySelector('#quality')?.value, 10) || 60;
    quality = Math.max(1, Math.min(100, quality));
    let fps = parseInt(document.querySelector('#fps')?.value, 10) || 24;
    fps = Math.max(1, Math.min(60, fps));

    worker.postMessage({ frames, fps, width: frameWidth, height: frameHeight, quality });

    worker.addEventListener('message', async event => {
        const imageBlob = new Blob([event.data], {type: `image/gif`});
		const imageSrc = await blobToBase64(imageBlob);
        const image = document.createElement('img');
        image.src = imageSrc;
        document.querySelector('#output').innerHTML = '';
        document.querySelector('#output').appendChild(image);
        encoding = false;
        createGifButton.disabled = false;
    });

    worker.addEventListener('error', error => {
        console.error(error);
        encoding = false;
        createGifButton.disabled = false;
    });
});
