const URL = "https://teachablemachine.withgoogle.com/models/5_-QztO6B/";

let model, webcam, labelContainer, maxPredictions;
const body = document.body;
const themeToggle = document.querySelector('#theme-toggle');

// Theme Logic
const updateThemeUI = () => {
    const isDark = body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
};

updateThemeUI();

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateThemeUI();
});

// AI Logic
async function loadModel() {
    if (model) return;
    document.getElementById('loading').style.display = 'block';
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    document.getElementById('loading').style.display = 'none';
}

// Webcam Setup
async function startWebcam() {
    await loadModel();
    document.getElementById('upload-container').style.display = 'none';
    document.getElementById('webcam-container').style.display = 'block';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('start-webcam-btn').style.display = 'none';

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
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

async function loop() {
    if (webcam && webcam.canvas) {
        webcam.update();
        await predict(webcam.canvas);
        window.requestAnimationFrame(loop);
    }
}

// Image Upload Setup
const imageUpload = document.getElementById('image-upload');
imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await loadModel();
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
            document.getElementById('upload-container').style.display = 'none';
            document.getElementById('result-container').style.display = 'block';
            document.getElementById('face-image').src = img.src;
            document.getElementById('face-image').style.display = 'block';
            document.getElementById('start-webcam-btn').style.display = 'none';
            
            labelContainer = document.getElementById("label-container");
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
            await predict(img);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

async function predict(input) {
    const prediction = await model.predict(input);
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const item = labelContainer.childNodes[i];
        item.querySelector('.prediction-label span:first-child').textContent = className;
        item.querySelector('.prediction-label span:last-child').textContent = probability + '%';
        item.querySelector('.progress-fill').style.width = probability + '%';
    }
}

document.getElementById('start-webcam-btn').addEventListener('click', startWebcam);
document.getElementById('restart-btn').addEventListener('click', () => {
    location.reload();
});

// Formspree AJAX
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            const response = await fetch(e.target.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                alert('Success! Your inquiry has been sent.');
                contactForm.reset();
            }
        } catch (error) {
            alert('Oops! Something went wrong.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Inquiry';
        }
    });
}
