const lottoNumbersDiv = document.querySelector('#lotto-display');
const generateBtn = document.querySelector('#generate-btn');
const themeToggle = document.querySelector('#theme-toggle');
const body = document.body;

/**
 * Theme Management
 */
const updateThemeUI = () => {
    const isDark = body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
};

// Sync UI with initial state (already set by head script)
updateThemeUI();

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI();
});

/**
 * Lotto Generation
 */
function generateNumbers() {
    // Clear previous numbers with a slight fade effect if desired
    lottoNumbersDiv.innerHTML = '';
    
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
        
        // Staggered animation effect
        numberDiv.style.opacity = '0';
        numberDiv.style.transform = 'translateY(20px)';
        lottoNumbersDiv.appendChild(numberDiv);
        
        setTimeout(() => {
            numberDiv.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            numberDiv.style.opacity = '1';
            numberDiv.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

generateBtn.addEventListener('click', generateNumbers);

// Initial generation
generateNumbers();
