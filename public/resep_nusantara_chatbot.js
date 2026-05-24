// Recipe Database (Beautifully Curated)
let recipes = [];

// Load recipes from external JSON file (try dynamic import, fallback to fetch)
async function loadRecipes() {

   try {
        const response = await fetch('/api/recipes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
        });

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        recipes = data.data
        renderCategories();
        renderRecipes();
    } catch (error) {
        console.error('Error fetching response:', error);
    }
}

// Active State variables
let selectedCategory = "Semua";
let searchQuery = "";
let chatHistory = []; // Local memory container for Gemini Chat Session
let chefName = "Deo"; // Default fallback

// Initialize App
window.onload = function() {
    // renderCategories();
    // renderRecipes();
    setupSearchListeners();
    loadConfig();
    loadRecipes();
};

async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const data = await response.json();
            if (data.chefName) {
                chefName = data.chefName;
                updateChefNameDOM();
            }
        }
    } catch (error) {
        console.error("Failed to load chef configuration:", error);
    }
}

function updateChefNameDOM() {
    const heroElement = document.getElementById("heroChefName");
    if (heroElement) {
        heroElement.textContent = `Chef ${chefName}`;
    }
    const headerTitle = document.getElementById("chatHeaderTitle");
    if (headerTitle) {
        headerTitle.textContent = `Chef ${chefName} AI`;
    }
    const greetingName = document.getElementById("chatGreetingName");
    if (greetingName) {
        greetingName.textContent = `Chef ${chefName} AI`;
    }
    const typingIndicatorText = document.getElementById("chatTypingIndicatorText");
    if (typingIndicatorText) {
        typingIndicatorText.textContent = `Chef ${chefName} sedang berpikir...`;
    }
    const chatInput = document.getElementById("chatInput");
    if (chatInput) {
        chatInput.placeholder = `Tanya Chef ${chefName}...`;
    }
}

// Render Kategori Tabs
function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    // Extract unique categories
    const categoriesSet = new Set(recipes.map(r => r.category));
    const categories = ["Semua", ...Array.from(categoriesSet)];

    container.innerHTML = categories.map(cat => {
        const isActive = selectedCategory === cat;
        const activeClasses = "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/10";
        const inactiveClasses = "bg-white hover:bg-amber-100 text-slate-600 font-medium hover:text-amber-700 border border-slate-100";
        
        return `
            <button onclick="setCategory('${cat}')" 
                class="px-5 py-2 rounded-2xl text-sm transition-all whitespace-nowrap focus:outline-none ${isActive ? activeClasses : inactiveClasses}">
                ${cat}
            </button>
        `;
    }).join("");
}

// Set Category filter
function setCategory(category) {
    selectedCategory = category;
    renderCategories();
    renderRecipes();
}

// Set up search inputs listeners
function setupSearchListeners() {
    const desktopSearch = document.getElementById("desktopSearchInput");
    const mobileSearch = document.getElementById("mobileSearchInput");

    const handleSearchInput = (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        // Sync the search inputs visually
        desktopSearch.value = e.target.value;
        mobileSearch.value = e.target.value;
        renderRecipes();
    };

    desktopSearch.addEventListener("input", handleSearchInput);
    mobileSearch.addEventListener("input", handleSearchInput);
}

// Render Card Resep di Grid
function renderRecipes() {
    const grid = document.getElementById("recipeGrid");
    const noState = document.getElementById("noRecipesState");

    // Filter logic
    const filtered = recipes.filter(r => {
        const matchesCategory = selectedCategory === "Semua" || r.category === selectedCategory;
        const matchesSearch = r.title.toLowerCase().includes(searchQuery) || 
                              r.description.toLowerCase().includes(searchQuery) ||
                              r.ingredients.some(ing => ing.toLowerCase().includes(searchQuery));
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = "";
        noState.classList.remove("hidden");
        return;
    }

    noState.classList.add("hidden");
    grid.innerHTML = filtered.map(recipe => `
        <div class="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col group">
            <!-- Image -->
            <div class="h-48 w-full overflow-hidden relative">
                <img src="${recipe.image}" alt="${recipe.title}" 
                     onerror="this.src='https://placehold.co/600x400/FFF8E7/9A3412?text=${encodeURIComponent(recipe.title)}'"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-white/90 backdrop-blur-md text-amber-600 rounded-lg shadow-sm">
                    ${recipe.category}
                </span>
            </div>
            <!-- Body Info -->
            <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-3 text-xs text-slate-400 font-medium mb-2.5">
                        <span class="flex items-center gap-1">
                            ⏱️ ${recipe.duration}
                        </span>
                        <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span class="flex items-center gap-1">
                            ⭐ ${recipe.difficulty}
                        </span>
                    </div>
                    <h3 class="text-xl font-bold font-serif text-slate-900 group-hover:text-amber-600 transition-colors mb-2 line-clamp-1">
                        ${recipe.title}
                    </h3>
                    <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
                        ${recipe.description}
                    </p>
                </div>
                <button onclick="openRecipeModal(${recipe.id})" 
                    class="w-full py-3 rounded-2xl bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-amber-100/30">
                    Lihat Resep Lengkap
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join("");
}

// Recipe Detailed Modal Control
let currentRecipeContext = null;

function openRecipeModal(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    currentRecipeContext = recipe;

    // Populate Modal DOM elements
    document.getElementById("modalImage").src = recipe.image;
    document.getElementById("modalImage").onerror = function() {
        this.src = `https://placehold.co/600x400/FFF8E7/9A3412?text=${encodeURIComponent(recipe.title)}`;
    };
    document.getElementById("modalCategory").textContent = recipe.category;
    document.getElementById("modalTitle").textContent = recipe.title;
    document.getElementById("modalPortion").textContent = recipe.portion;
    document.getElementById("modalDuration").textContent = recipe.duration;
    document.getElementById("modalDifficulty").textContent = recipe.difficulty;
    document.getElementById("modalDescription").textContent = recipe.description;

    // Ingredients list
    const ingList = document.getElementById("modalIngredients");
    ingList.innerHTML = recipe.ingredients.map(ing => `
        <li class="flex items-start gap-2 py-1.5 border-b border-slate-50">
            <span class="text-amber-500 text-base mt-0.5">✔</span>
            <span>${ing}</span>
        </li>
    `).join("");

    // Steps list
    const stepList = document.getElementById("modalSteps");
    stepList.innerHTML = recipe.steps.map(step => `
        <li class="pl-2 leading-relaxed">
            ${step}
        </li>
    `).join("");

    // Show Modal with clean display flex
    const modal = document.getElementById("recipeModal");
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
}

function closeRecipeModal() {
    const modal = document.getElementById("recipeModal");
    modal.classList.add("hidden");
    document.body.style.overflow = "auto"; // Re-enable scroll
    currentRecipeContext = null;
}

// Quick trigger from Modal to Chatbot about current recipe
function askChatbotAboutCurrentRecipe() {
    if (!currentRecipeContext) return;
    
    // Simpan judul resep terlebih dahulu sebelum context disetel ke null saat modal ditutup
    const recipeTitle = currentRecipeContext.title;
    
    // Tutup modal
    closeRecipeModal();
    
    // Buka jendela chatbot jika sedang tertutup
    const chatWindow = document.getElementById("chatWindow");
    if (chatWindow.classList.contains("pointer-events-none")) {
        toggleChatWindow();
    }

    // Kirim pesan prompt otomatis menggunakan judul resep yang sudah disimpan aman
    const query = `Bantu saya memberikan saran atau variasi rahasia untuk resep "${recipeTitle}" ini!`;
    sendQuickPrompt(query);
}

// Chatbot Windows Toggle Panel
function toggleChatWindow() {
    const chatWindow = document.getElementById("chatWindow");
    const normalIcon = document.getElementById("chatIconNormal");
    const closeIcon = document.getElementById("chatIconClose");

    const isClosed = chatWindow.classList.contains("pointer-events-none");

    if (isClosed) {
        // Open Animations
        chatWindow.classList.remove("pointer-events-none", "translate-y-8", "opacity-0", "scale-95");
        chatWindow.classList.add("translate-y-0", "opacity-100", "scale-100");
        normalIcon.classList.add("hidden");
        closeIcon.classList.remove("hidden");
        // Focus input automatically
        setTimeout(() => document.getElementById("chatInput").focus(), 300);
    } else {
        // Close Animations
        chatWindow.classList.add("pointer-events-none", "translate-y-8", "opacity-0", "scale-95");
        chatWindow.classList.remove("translate-y-0", "opacity-100", "scale-100");
        normalIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
    }
}

// Quick Suggestion Click Action
function sendQuickPrompt(text) {
    const input = document.getElementById("chatInput");
    input.value = text;
    document.getElementById("chatForm").requestSubmit();
}

// Append Single Message to chat messages body
function appendChatMessage(sender, text) {
    const container = document.getElementById("chatMessages");
    const isChef = sender === "chef";
    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const itemHTML = isChef ? `
        <div class="flex items-start gap-2.5 max-w-[85%] animate-fade-in-up">
            <div class="w-8 h-8 rounded-full bg-amber-500/10 text-base flex items-center justify-center flex-shrink-0">
                👨‍🍳
            </div>
            <div class="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">${text}</p>
                <span class="text-[10px] text-slate-400 mt-1 block">${timeString}</span>
            </div>
        </div>
    ` : `
        <div class="flex items-start gap-2.5 max-w-[85%] ml-auto justify-end animate-fade-in-up">
            <div class="bg-amber-500 text-white p-3.5 rounded-2xl rounded-tr-none shadow-md shadow-amber-500/10">
                <p class="text-sm leading-relaxed">${text}</p>
                <span class="text-[10px] text-amber-100/80 mt-1 block text-right">${timeString}</span>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', itemHTML);
    container.scrollTop = container.scrollHeight; // Auto-scroll to bottom
}

// Main Send Message Form Trigger handler
async function handleSendMessage(event) {
    event.preventDefault();
    const input = document.getElementById("chatInput");
    const query = input.value.trim();
    if (!query) return;

    // Render user message immediately
    appendChatMessage("user", query);
    input.value = ""; // clear input

    // Show Thinking state loader
    const loader = document.getElementById("typingIndicator");
    const msgContainer = document.getElementById("chatMessages");
    loader.classList.remove("hidden");
    msgContainer.scrollTop = msgContainer.scrollHeight;

    try {
        // Call Gemini Model API
        const answer = await getGeminiAIResponse(query);
        // Hide loader and append AI output
        loader.classList.add("hidden");
        appendChatMessage("chef", answer);
    } catch (error) {
        console.error("Gemini Error:", error);
        loader.classList.add("hidden");
        appendChatMessage("chef", `Maaf ya hari ini Chef ${chefName} belum bisa bantu di dapur 🙏. Tapi jangan khawatir! 🍳✨
Kapan pun kamu butuh resep, tips memasak, atau ide menu lezat, Chef ${chefName} siap bantu kamu lagi! Semangat terus masaknya ya! 🔥👨‍🍳`);
    }
}

// Call Gemini Model API (gemini-3-flash-preview)
async function getGeminiAIResponse(userMessage) {
    const apiUrl = `/api/chat`;

    // Build chatHistory cache into payload format
    // First time, initialize chat memory
    if (chatHistory.length === 0) {
        chatHistory.push({
            role: "user",
            text: `Halo Chef ${chefName}! Saya ingin belajar memasak.`
        });
        chatHistory.push({
            role: "model",
            text: "Halo koki muda! Tentu, saya di sini untuk membantumu membuat masakan luar biasa di dapur. Mari mulai dengan rasa gembira!"
        });
    }

    // Append current user query to internal history
    chatHistory.push({
        role: "user",
        text: userMessage
    });

    const payload = {
        conversations: chatHistory,
    };

    // Implement Backoff Retries logic
    let response = null;
    let delay = 1000;
    for (let i = 0; i < 3; i++) {
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) break;
        } catch (e) {
            if (i === 2) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }

    if (!response || !response.ok) {
        throw new Error("Gagal mendapatkan respons dari Gemini API.");
    }

    const result = await response.json();
    // const candidate = result.candidates?.[0];
    
    if (result.generatedText && result.generatedText !="") {
        const generatedText = result.generatedText;
        // Save model answer to internal chatHistory to persist context
        chatHistory.push({
            role: "model",
            parts: [{ text: generatedText }]
        });
        return generatedText;
    } else {
        throw new Error("Format respons API tidak sesuai.");
    }
}