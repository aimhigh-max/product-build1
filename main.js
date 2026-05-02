const URL = "https://teachablemachine.withgoogle.com/models/5_-QztO6B/";

let model, webcam, labelContainer, maxPredictions;
const body = document.body;
const themeToggle = document.querySelector('#theme-toggle');

/**
 * Theme Management
 */
const updateThemeUI = () => {
    if (!themeToggle) return;
    const isDark = body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
};

if (themeToggle) {
    updateThemeUI();
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
        updateThemeUI();
    });
}

/**
 * AI Logic
 */
const startWebcamBtn = document.getElementById('start-webcam-btn');
const imageUpload = document.getElementById('image-upload');

async function loadModel() {
    if (model) return;
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'block';
    
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    if (loadingEl) loadingEl.style.display = 'none';
}

async function startWebcam() {
    await loadModel();
    const uploadContainer = document.getElementById('upload-container');
    const webcamContainer = document.getElementById('webcam-container');
    const resultContainer = document.getElementById('result-container');
    
    if (uploadContainer) uploadContainer.style.display = 'none';
    if (webcamContainer) webcamContainer.style.display = 'block';
    if (resultContainer) resultContainer.style.display = 'block';
    if (startWebcamBtn) startWebcamBtn.style.display = 'none';

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    if (webcamContainer) {
        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);
    }
    
    labelContainer = document.getElementById("label-container");
    if (labelContainer) {
        labelContainer.innerHTML = '';
        for (let i = 0; i < maxPredictions; i++) {
            const item = document.createElement("div");
            item.className = 'prediction-item';
            item.innerHTML = `
                <div class="prediction-label">
                    <span></span>
                    <span>0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            `;
            labelContainer.appendChild(item);
        }
    }
}

async function loop() {
    if (webcam && webcam.canvas) {
        webcam.update();
        await predict(webcam.canvas);
        window.requestAnimationFrame(loop);
    }
}

if (imageUpload) {
    imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        await loadModel();
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            const img = new Image();
            img.onload = async () => {
                const uploadContainer = document.getElementById('upload-container');
                const resultContainer = document.getElementById('result-container');
                const faceImage = document.getElementById('face-image');
                
                if (uploadContainer) uploadContainer.style.display = 'none';
                if (resultContainer) resultContainer.style.display = 'block';
                if (faceImage) {
                    faceImage.src = img.src;
                    faceImage.style.display = 'block';
                }
                if (startWebcamBtn) startWebcamBtn.style.display = 'none';
                
                labelContainer = document.getElementById("label-container");
                if (labelContainer) {
                    labelContainer.innerHTML = '';
                    for (let i = 0; i < maxPredictions; i++) {
                        const item = document.createElement("div");
                        item.className = 'prediction-item';
                        item.innerHTML = `
                            <div class="prediction-label">
                                <span></span>
                                <span>0%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                        `;
                        labelContainer.appendChild(item);
                    }
                }
                await predict(img);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function predict(input) {
    if (!model || !labelContainer) return;
    const prediction = await model.predict(input);
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const item = labelContainer.childNodes[i];
        if (item) {
            const labelSpan = item.querySelector('.prediction-label span:first-child');
            const probSpan = item.querySelector('.prediction-label span:last-child');
            const progressFill = item.querySelector('.progress-fill');
            
            if (labelSpan) labelSpan.textContent = className;
            if (probSpan) probSpan.textContent = probability + '%';
            if (progressFill) progressFill.style.width = probability + '%';
        }
    }
}

if (startWebcamBtn) startWebcamBtn.addEventListener('click', startWebcam);

const restartBtn = document.getElementById('restart-btn');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        location.reload();
    });
}

/**
 * Lotto Generation
 */
const lottoDisplay = document.querySelector('#lotto-display');
const generateLottoBtn = document.querySelector('#generate-lotto-btn');

function generateLottoNumbers() {
    if (!lottoDisplay) return;
    lottoDisplay.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach((number, index) => {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        numberDiv.textContent = number;
        
        numberDiv.style.opacity = '0';
        numberDiv.style.transform = 'translateY(10px)';
        lottoDisplay.appendChild(numberDiv);
        
        setTimeout(() => {
            numberDiv.style.opacity = '1';
            numberDiv.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

if (generateLottoBtn) {
    generateLottoBtn.addEventListener('click', generateLottoNumbers);
    generateLottoNumbers(); // Initial generation
}

/**
 * Formspree AJAX
 */
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            const response = await fetch(e.target.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                alert('Success! Your message has been sent.');
                contactForm.reset();
            } else {
                alert('Oops! There was a problem sending your message.');
            }
        } catch (error) {
            alert('Oops! Something went wrong.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}
