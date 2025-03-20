const QUOTE_API = 'https://api.freeapi.app/api/v1/public/quotes/quote/random';

// reusable method to fetch DOM elements
const getElement = query => document.querySelector(`${query}`);

const quoteElement = getElement('[data-quote]');
const authorElement = getElement('[data-author]');
const newButton = getElement('.new-quote');
const container = getElement('.container');
const copy = getElement('.copy');
const tooltip = getElement('.tooltip');
const overlay = getElement('.overlay');
const shareX = getElement('.share');
const download = getElement('.download');

// random ids to fetch random background images
const ids = [4,6,7,14,17,20,28,29,38,41];

const getRandomId = () => Math.floor(Math.random()*10);
const randomUrl = id => `https://picsum.photos/id/${id}/600/400`;

async function setQuote() {
    try{
        let response = await fetch(`${QUOTE_API}`);
        response = await response.json();
        const {content:quote,author} = response?.data;
        quoteElement.innerText = quote;
        authorElement.innerText = author;

        let id = getRandomId();
        let randomImage = randomUrl(id);
        overlay.style.backgroundImage = `url(${randomImage})`;
    }
    catch(e) {
        console.log('Error in fetching Quote');
    }
}

async function copyQuote() {
    try{
        if(quoteElement.innerText !== "") {
            await navigator.clipboard.writeText(quoteElement.innerText);
            tooltip.classList.add('visible');
            setTimeout(() => {
                tooltip.classList.remove('visible');
            },1200);
        }
    }
    catch(e){
        tooltip.innerText = 'Failed';
        tooltip.classList.add('visible');
        setTimeout(() => {
            tooltip.classList.remove('visible');
        },1200);
    }
}

function shareOnX() {
    if(!quoteElement.innerText || !authorElement.innerText) return;

    const tweetQuoteText = encodeURIComponent(`"${quoteElement.innerText}"\n\n ~ by "${authorElement.innerText}"`);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetQuoteText}&hashtags=quotes`;
    window.open(tweetUrl,"_blank","width=600,height=400");
}

function wrapTextForCanvas(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    
    for(const word of words) {
        const testLine = line + word + ' ';
        // Check the width of the testline, before drawing or writing it on the canvas
        const metrics = ctx.measureText(testLine);
        if(metrics.width > maxWidth && line !== '') {
            ctx.fillText(line.trim(), x, y);
            line = word + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), x, y);
}

async function downloadQuote() {
    // Create Temporary Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set Canvas Size to quote container size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // remove 'url( ) text' and get only the inside link text
    const bgUrl = window.getComputedStyle(overlay).backgroundImage.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = bgUrl;

    // resolve promise once image is loaded
    await new Promise(resolve => bgImg.onload = resolve);

    // Draw background image once image is loaded
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    
    // transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // quote and author text styles
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'justify';
    ctx.textBaseline = 'top';
    ctx.font = 'italic 700 24px Poppins';

    // Draw quote text
    wrapTextForCanvas(ctx, `"${quoteElement.textContent}"`, 10, 14, canvas.width - 40, 40);
    
    // Draw author text
    ctx.fillText(`${authorElement.textContent}`, 10, canvas.height - 30);

    // Trigger Download
    const link = document.createElement('a');
    link.download = 'quote.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}


// Action listeners
newButton.addEventListener('click',setQuote);
copy.addEventListener('click',copyQuote);
shareX.addEventListener('click',shareOnX);
download.addEventListener('click', downloadQuote);

// load Quote on first render
setQuote();