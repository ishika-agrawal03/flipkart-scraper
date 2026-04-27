document.addEventListener('DOMContentLoaded', () => {
    // API CONFIG
    const API_URL = 'https://flipkart-api-xbmr.onrender.com/mobiles';

    // DOM ELEMENTS
    const navHome = document.getElementById('navHome');
    const navAbout = document.getElementById('navAbout');
    const homeView = document.getElementById('homeView');
    const aboutView = document.getElementById('aboutView');

    const themeToggle = document.getElementById('themeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    
    const searchBtn = document.getElementById('searchBtn');
    const maxPriceInput = document.getElementById('maxPrice');
    const minRatingInput = document.getElementById('minRating');
    const sortOptionSelect = document.getElementById('sortOption');
    
    const loader = document.getElementById('loader');
    const dataContainer = document.getElementById('dataContainer');
    const tableView = document.getElementById('tableView');
    
    const noResults = document.getElementById('noResults');
    const resultsBody = document.getElementById('resultsBody');
    const itemCount = document.getElementById('itemCount');
    
    // STATE
    let fetchedData = [];
    
    // INITIALIZATION
    initTheme();
    initNavigation();

    fetchData(); // Load initial data without filters

    // NAVIGATION HANDLING
    function initNavigation() {
        navHome.addEventListener('click', (e) => {
            e.preventDefault();
            homeView.classList.remove('hidden');
            aboutView.classList.add('hidden');
            navHome.classList.add('active');
            navAbout.classList.remove('active');
        });

        navAbout.addEventListener('click', (e) => {
            e.preventDefault();
            homeView.classList.add('hidden');
            aboutView.classList.remove('hidden');
            navAbout.classList.add('active');
            navHome.classList.remove('active');
        });
    }

    // THEME HANDLING
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            document.documentElement.removeAttribute('data-theme');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
        localStorage.setItem('theme', theme);
    }

    // SEARCH & FILTER HANDLING
    searchBtn.addEventListener('click', () => {
        fetchData();
    });

    // Fetch on Enter key press
    [maxPriceInput, minRatingInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchData();
            }
        });
    });


    // API INTEGRATION
    function buildUrl() {
        const url = new URL(API_URL);
        
        const maxPrice = maxPriceInput.value;
        const minRating = minRatingInput.value;
        const sortValue = sortOptionSelect.value; // ex: "sort_price=low"

        if (maxPrice) url.searchParams.append('max_price', maxPrice);
        if (minRating) url.searchParams.append('min_rating', minRating);
        
        if (sortValue) {
            const [key, value] = sortValue.split('=');
            if (key && value) {
                url.searchParams.append(key, value);
            }
        }
        
        return url.toString();
    }

    async function fetchData() {
        // UI Updates
        dataContainer.classList.add('hidden');
        noResults.classList.add('hidden');
        loader.classList.remove('hidden');
        resultsBody.innerHTML = ''; // Clear existing data
        itemCount.textContent = `0 items`;

        try {
            const fetchUrl = buildUrl();
            const response = await fetch(fetchUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if there are results
            if (data && data.length > 0) {
                fetchedData = data;
                renderTable(data);
                
                
                dataContainer.classList.remove('hidden');
            } else {
                fetchedData = [];
                noResults.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            noResults.querySelector('h2').textContent = "Connection Error";
            noResults.querySelector('p').textContent = "Failed to fetch from backend. Ensure FastAPI runs on 127.0.0.1:8000.";
            noResults.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
        }
    }

    // RENDER DATA
    function renderTable(data) {
        itemCount.textContent = `${data.length} items`;
        
        data.forEach(item => {
            const tr = document.createElement('tr');
            
            // Handle missing fields gracefully (Matches backend signature exactly)
            const imageSrc = item.image || 'https://via.placeholder.com/100x100?text=No+Image';
            const name = item.name || 'Unknown Product';
            const price = item.price || 0;
            const rating = item.rating || 0;
            
            // Generate link dynamically using product name
            const productUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(name)}`;

            tr.innerHTML = `
                <td>
                    <img src="${imageSrc}" alt="${name}" class="product-img" loading="lazy" onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
                </td>
                <td>
                    <div class="product-name" title="${name}">${name}</div>
                </td>
                <td>
                    <span class="price">₹${price.toLocaleString('en-IN')}</span>
                </td>
                <td>
                    <div class="rating">
                        <span>★</span>
                        <span>${rating}</span>
                    </div>
                </td>
                <td>
                    <a href="${productUrl}" target="_blank" rel="noopener noreferrer" class="product-link">
                        View Deal 
                        <svg style="margin-left:2px;" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </a>
                </td>
            `;
            
            resultsBody.appendChild(tr);
        });
    }

});
