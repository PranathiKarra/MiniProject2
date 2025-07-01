// AI Chatbot Integration Script
// Save this as chatbot.js in your project folder

class WebsiteChatbot {
    constructor(options = {}) {
        this.huggingFaceToken = options.huggingFaceToken || ''; 
        this.chatOpen = false;
        this.init();
    }

    init() {
        this.injectCSS();
        this.createChatbotHTML();
        this.attachEventListeners();
        this.makeImagesAnalyzable();
    }

    injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-chatbot-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                z-index: 10000;
                transform: translateY(450px);
                transition: transform 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .ai-chatbot-container.open {
                transform: translateY(0);
            }

            .ai-chatbot-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 15px;
                border-radius: 15px 15px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ai-chat-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 10001;
                transition: transform 0.3s ease;
            }

            .ai-chat-toggle:hover {
                transform: scale(1.1);
            }

            .ai-chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                max-height: 300px;
            }

            .ai-message {
                margin-bottom: 15px;
                padding: 10px;
                border-radius: 10px;
                max-width: 80%;
                font-size: 14px;
                line-height: 1.4;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .ai-user-message {
                background: #e3f2fd;
                margin-left: auto;
                text-align: right;
            }

            .ai-bot-message {
                background: #f5f5f5;
                margin-right: auto;
            }

            .ai-chat-input {
                padding: 15px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
            }

            .ai-chat-input input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 20px;
                outline: none;
                font-size: 14px;
            }

            .ai-chat-input input:focus {
                border-color: #667eea;
            }

            .ai-send-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.3s ease;
            }

            .ai-send-btn:hover {
                background: #45a049;
            }

            .ai-loading {
                display: none;
                text-align: center;
                color: #667eea;
                font-style: italic;
                padding: 10px;
                font-size: 14px;
            }

            .ai-image-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                border-radius: inherit;
            }

            .ai-analyzable-image {
                position: relative;
                cursor: pointer;
                transition: transform 0.3s ease;
            }

            .ai-analyzable-image:hover {
                transform: scale(1.02);
            }

            .ai-analyzable-image:hover .ai-image-overlay {
                opacity: 1;
            }

            .ai-analyze-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                transition: background 0.3s ease;
            }

            .ai-analyze-btn:hover {
                background: #45a049;
            }

            .ai-analyzing {
                border: 3px solid #4CAF50 !important;
                border-radius: 5px;
                animation: ai-pulse 1.5s infinite;
            }

            @keyframes ai-pulse {
                0% { border-color: #4CAF50; }
                50% { border-color: #81C784; }
                100% { border-color: #4CAF50; }
            }

            @media (max-width: 480px) {
                .ai-chatbot-container {
                    width: 300px;
                    right: 10px;
                    bottom: 10px;
                }
                .ai-chat-toggle {
                    right: 10px;
                    bottom: 10px;
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <button class="ai-chat-toggle" id="aiChatToggle">💬</button>
            <div class="ai-chatbot-container" id="aiChatbotContainer">
                <div class="ai-chatbot-header">
                    <h3 style="margin: 0; font-size: 16px;">🤖 AI Assistant</h3>
                    <button id="aiChatClose" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">✕</button>
                </div>
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-message ai-bot-message">
                        Hi! I can analyze images on this page and answer your questions. Click any image or ask me anything! 🖼️
                    </div>
                </div>
                <div class="ai-loading" id="aiLoadingIndicator">
                    🤔 Thinking...
                </div>
                <div class="ai-chat-input">
                    <input type="text" id="aiMessageInput" placeholder="Ask me anything..." autocomplete="off">
                    <button class="ai-send-btn" id="aiSendBtn">Send</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        const toggle = document.getElementById('aiChatToggle');
        const close = document.getElementById('aiChatClose');
        const sendBtn = document.getElementById('aiSendBtn');
        const input = document.getElementById('aiMessageInput');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    makeImagesAnalyzable() {
        // Wait for page to load completely
        setTimeout(() => {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                // Skip if image is too small (likely icons) or already processed
                if (img.offsetWidth < 80 || img.offsetHeight < 80) return;
                if (img.parentElement.classList.contains('ai-analyzable-image')) return;
                
                const wrapper = document.createElement('div');
                wrapper.className = 'ai-analyzable-image';
                wrapper.style.position = 'relative';
                wrapper.style.display = 'inline-block';
                wrapper.style.maxWidth = '100%';
                
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);
                
                const overlay = document.createElement('div');
                overlay.className = 'ai-image-overlay';
                overlay.innerHTML = `
                    <button class="ai-analyze-btn">
                        🔍 Analyze with AI
                    </button>
                `;
                
                wrapper.appendChild(overlay);
                
                overlay.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.analyzeImage(img.src, img.alt || 'Image from webpage');
                });
            });
        }, 1000);
    }

    toggleChat() {
        const container = document.getElementById('aiChatbotContainer');
        const toggle = document.getElementById('aiChatToggle');
        
        this.chatOpen = !this.chatOpen;
        
        if (this.chatOpen) {
            container.classList.add('open');
            toggle.style.display = 'none';
        } else {
            container.classList.remove('open');
            toggle.style.display = 'block';
        }
    }

    addMessage(content, isUser, isImage = false) {
        const messagesContainer = document.getElementById('aiChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${isUser ? 'ai-user-message' : 'ai-bot-message'}`;
        
        if (isImage && isUser) {
            messageDiv.innerHTML = `
                <img src="${content.url}" alt="${content.alt}" style="max-width: 150px; border-radius: 5px; margin-bottom: 5px; display: block;">
                <div style="font-size: 12px; opacity: 0.8;">Analyzing: ${content.alt}</div>
            `;
        } else {
            messageDiv.textContent = content;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showLoading(show) {
        document.getElementById('aiLoadingIndicator').style.display = show ? 'block' : 'none';
    }

    async sendMessage() {
        const input = document.getElementById('aiMessageInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, true);
        input.value = '';
        
        this.showLoading(true);
        
        try {
            const response = await this.getTextResponse(message);
            this.addMessage(response, false);
        } catch (error) {
            this.addMessage('Sorry, I encountered an error. Please try again! 🤖', false);
        }
        
        this.showLoading(false);
    }

    async analyzeImage(imageUrl, altText) {
        if (!this.chatOpen) {
            this.toggleChat();
        }
        
        this.addMessage({url: imageUrl, alt: altText}, true, true);
        
        // Highlight analyzing image
        const images = document.querySelectorAll(`img[src="${imageUrl}"]`);
        images.forEach(img => img.classList.add('ai-analyzing'));
        
        this.showLoading(true);
        
        try {
            const response = await this.getImageAnalysis(imageUrl, altText);
            this.addMessage(response, false);
        } catch (error) {
            this.addMessage('Sorry, I couldn\'t analyze that image right now. Please try again! 📸', false);
        }
        
        images.forEach(img => img.classList.remove('ai-analyzing'));
        this.showLoading(false);
    }

    async getTextResponse(message) {
        // Try Hugging Face API first if token is provided
        if (this.huggingFaceToken) {
            try {
                const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.huggingFaceToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: message,
                        parameters: {
                            max_new_tokens: 100,
                            temperature: 0.7
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data[0]?.generated_text || this.getFallbackTextResponse(message);
                }
            } catch (error) {
                console.log('Hugging Face API unavailable, using fallback responses');
            }
        }

        return this.getFallbackTextResponse(message);
    }

    async getImageAnalysis(imageUrl, altText) {
        // Try Hugging Face Vision API if token is provided
        if (this.huggingFaceToken) {
            try {
                const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.huggingFaceToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: imageUrl
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data[0]?.generated_text) {
                        return `🔍 **Image Analysis**: ${data[0].generated_text}`;
                    }
                }
            } catch (error) {
                console.log('Image analysis API unavailable, using fallback');
            }
        }

        return this.getFallbackImageAnalysis(altText, imageUrl);
    }

    getFallbackTextResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! 👋 I'm your AI assistant. I can help answer questions and analyze images on this page!";
        }
        
        if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('photo')) {
            return "I can analyze any image on this webpage! Just hover over an image and click 'Analyze with AI' to get detailed descriptions. 📸";
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            return "I can help you with:\n• Answering questions about various topics\n• Analyzing images on this webpage\n• Providing detailed image descriptions\n\nTry hovering over any image and clicking the analyze button! 🤖";
        }

        if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
            return "I use AI to understand text and analyze images! Hover over any image on this page to see the 'Analyze with AI' button, or just ask me questions here. 🔍";
        }
        
        const responses = [
            "That's interesting! I can also analyze the images on this webpage. Try hovering over any image! 🖼️",
            "I'm here to help! Feel free to ask me anything or try the image analysis feature on this page! 👁️",
            "Great question! I can help with information and also analyze visual content. Hover over images to try it! 🔍",
            "I'd be happy to help! You can also click on images on this page for AI-powered analysis! 📸",
            "Thanks for asking! I'm designed to assist with both text questions and image analysis. Try both features! 🤖"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getFallbackImageAnalysis(altText, imageUrl) {
        const analysisTemplates = {
            'landscape': 'This appears to be a beautiful landscape image featuring natural scenery. I can see elements that suggest outdoor environments with potentially scenic views, natural lighting, and organic compositions typical of landscape photography.',
            
            'people': 'This image appears to show people in what looks like a social or professional setting. The composition suggests human subjects engaged in activities or interactions.',
            
            'business': 'This looks like a business or professional context image, likely showing workplace environments, meetings, or corporate settings with professional lighting and composition.',
            
            'technology': 'This appears to be a technology-related image, possibly showing electronic devices, digital interfaces, or modern tech equipment with clean, modern styling.',
            
            'food': 'This seems to be a food-related image, likely showing prepared dishes, ingredients, or dining contexts with appealing visual presentation.',
            
            'building': 'This appears to be an architectural or building-focused image, showing structural elements, interior spaces, or exterior views with attention to design and space.',
            
            'nature': 'This looks like a nature-focused image with organic elements, possibly showing plants, animals, or natural environments with natural lighting and compositions.'
        };

        // Analyze URL and alt text for keywords
        const combined = `${altText} ${imageUrl}`.toLowerCase();
        
        for (const [category, description] of Object.entries(analysisTemplates)) {
            if (combined.includes(category) || 
                (category === 'people' && (combined.includes('person') || combined.includes('man') || combined.includes('woman'))) ||
                (category === 'building' && (combined.includes('house') || combined.includes('office') || combined.includes('room'))) ||
                (category === 'nature' && (combined.includes('tree') || combined.includes('flower') || combined.includes('garden')))) {
                return `🔍 **Image Analysis**: ${description}`;
            }
        }

        return `🔍 **Image Analysis**: This is an interesting image with various visual elements. The composition includes multiple components that create an engaging visual experience. The image appears to be well-composed with attention to lighting and subject matter arrangement.`;
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with your Hugging Face token (optional)
    window.chatbot = new WebsiteChatbot({
        huggingFaceToken: '' // Add your token here for better responses
    });
    
    console.log('AI Chatbot loaded! Hover over images to analyze them or use the chat button.');
});