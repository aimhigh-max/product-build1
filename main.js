const lottoNumbersDiv = document.querySelector('.lotto-numbers');
const generateBtn = document.querySelector('#generate-btn');
const themeToggle = document.querySelector('#theme-toggle');
const body = document.body;

// Theme Toggle Logic
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
});

// Lotto Number Generation Logic
function generateNumbers() {
    lottoNumbersDiv.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach(number => {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        numberDiv.textContent = number;
        lottoNumbersDiv.appendChild(numberDiv);
    });
}

generateBtn.addEventListener('click', generateNumbers);

// Generate numbers on initial load
generateNumbers();
