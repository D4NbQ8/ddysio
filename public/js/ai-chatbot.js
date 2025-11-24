(function() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessagesMobile = document.getElementById('chat-messages-mobile');
    const chatInputMobile = document.getElementById('chat-input-mobile');
    const sendBtnMobile = document.getElementById('send-btn-mobile');
    const recommendCount = document.getElementById('recommend-count');
    const quickTopics = document.querySelectorAll('.quick-topic');
    
    let chatHistory = [];
    let excludedMovies = [];
    let isProcessing = false;
    
    quickTopics.forEach(topic => {
        topic.addEventListener('click', function() {
            const message = this.dataset.topic;
            if (chatInput) chatInput.value = message;
            if (chatInputMobile) chatInputMobile.value = message;
            sendMessage();
        });
    });
    
    function loadHistory() {
        try {
            const saved = localStorage.getItem('ddys_chat_session');
            if (saved) {
                const session = JSON.parse(saved);
                chatHistory = session.messages || [];
                excludedMovies = session.excluded_movies || [];
                
                chatHistory.forEach(msg => {
                    if (msg.role === 'user') {
                        appendUserMessage(msg.content);
                    } else {
                        appendAssistantMessage(msg.content, msg.movies || []);
                    }
                });
            }
        } catch (e) {
        }
    }
    
    function saveHistory() {
        try {
            localStorage.setItem('ddys_chat_session', JSON.stringify({
                messages: chatHistory,
                excluded_movies: excludedMovies,
                timestamp: Date.now()
            }));
        } catch (e) {
        }
    }
    
    function clearWelcome() {
        const cursor = chatMessages.querySelector('.animate-pulse');
        if (cursor) {
            cursor.remove();
        }
        const helpMsg = chatMessages.querySelectorAll('p');
        if (helpMsg.length > 0 && helpMsg[0].textContent.includes('help')) {
            chatMessages.innerHTML = '';
        }
    }
    
    function appendUserMessage(text) {
        if (!chatMessages) return;
        clearWelcome();
        const p = document.createElement('p');
        p.className = 'mb-2 text-gray-600 dark:text-gray-400';
        p.textContent = `> user@ddys:~$ ${text}`;
        chatMessages.appendChild(p);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function appendUserMessageMobile(text) {
        if (!chatMessagesMobile) return;
        const div = document.createElement('div');
        div.className = 'flex justify-end';
        div.innerHTML = `<div class="bg-gray-800 dark:bg-gray-700 text-white px-4 py-3 rounded-lg max-w-[85%] text-sm">${escapeHtml(text)}</div>`;
        chatMessagesMobile.appendChild(div);
        chatMessagesMobile.scrollTop = chatMessagesMobile.scrollHeight;
    }
    
    function appendAssistantMessage(text, movies) {
        if (!chatMessages) return;
        const p = document.createElement('p');
        p.className = 'text-gray-900 dark:text-gray-200 mb-2';
        p.textContent = `低端影视 AI: ${text}`;
        chatMessages.appendChild(p);
        
        if (movies && movies.length > 0) {
            const resultsP = document.createElement('p');
            resultsP.className = 'text-gray-700 dark:text-gray-300 mb-4';
            resultsP.textContent = `找到 ${movies.length} 个结果：`;
            chatMessages.appendChild(resultsP);
            
            const listDiv = document.createElement('div');
            listDiv.className = 'mb-4';
            
            movies.forEach((movie, index) => {
                const titleP = document.createElement('p');
                titleP.className = 'text-gray-900 dark:text-white mb-1';
                titleP.innerHTML = `<a href="/movie/${movie.slug}" target="_blank" class="hover:underline">[${index + 1}] ${escapeHtml(movie.title)}</a>`;
                listDiv.appendChild(titleP);
                
                const infoP = document.createElement('p');
                infoP.className = 'text-gray-500 dark:text-gray-500 text-xs mb-2';
                infoP.textContent = `    ${movie.year || ''} | ${movie.genres || ''} | 豆瓣 ${movie.rating || 'N/A'}`;
                listDiv.appendChild(infoP);
            });
            
            chatMessages.appendChild(listDiv);
        }
        
        const cursor = document.createElement('p');
        cursor.className = 'animate-pulse text-gray-600 dark:text-gray-400';
        cursor.textContent = '▊';
        chatMessages.appendChild(cursor);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function appendAssistantMessageMobile(text, movies) {
        if (!chatMessagesMobile) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'flex gap-3';
        
        let html = `<img src="https://ddys.io/avatars/yuebing.jpg" alt="AI" class="w-8 h-8 rounded-full flex-shrink-0"><div class="space-y-2 max-w-[85%]">`;
        html += `<div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-3 rounded-lg"><p class="text-sm text-gray-900 dark:text-white leading-relaxed">${escapeHtml(text)}</p></div>`;
        
        if (movies && movies.length > 0) {
            html += '<div class="space-y-1">';
            movies.forEach((movie) => {
                html += `<div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-2 rounded">`;
                html += `<a href="/movie/${movie.slug}" target="_blank" class="text-xs font-medium text-gray-900 dark:text-white hover:underline">${escapeHtml(movie.title)}</a>`;
                html += `<p class="text-xs text-gray-500 dark:text-gray-400">${movie.year || ''} | ${movie.genres || ''} · 豆瓣 ${movie.rating || 'N/A'}</p>`;
                html += '</div>';
            });
            html += '</div>';
        }
        
        html += '</div>';
        wrapper.innerHTML = html;
        chatMessagesMobile.appendChild(wrapper);
        chatMessagesMobile.scrollTop = chatMessagesMobile.scrollHeight;
    }
    
    function showThinking(text) {
        if (!chatMessages) return;
        const p = document.createElement('p');
        p.className = 'text-gray-900 dark:text-gray-200 mb-2';
        p.id = 'thinking-indicator';
        p.textContent = `低端影视 AI: ${text}`;
        chatMessages.appendChild(p);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showThinkingMobile(text) {
        if (!chatMessagesMobile) return;
        const div = document.createElement('div');
        div.className = 'flex gap-3';
        div.id = 'thinking-indicator-mobile';
        div.innerHTML = `<img src="https://ddys.io/avatars/yuebing.jpg" alt="AI" class="w-8 h-8 rounded-full flex-shrink-0"><div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-3 rounded-lg"><p class="text-sm text-gray-900 dark:text-white">${escapeHtml(text)}</p></div>`;
        chatMessagesMobile.appendChild(div);
        chatMessagesMobile.scrollTop = chatMessagesMobile.scrollHeight;
    }
    
    function removeThinking() {
        if (!chatMessages) return;
        const thinking = document.getElementById('thinking-indicator');
        if (thinking) {
            thinking.remove();
        }
        const cursor = chatMessages.querySelector('.animate-pulse');
        if (cursor) {
            cursor.remove();
        }
    }
    
    function removeThinkingMobile() {
        if (!chatMessagesMobile) return;
        const thinking = document.getElementById('thinking-indicator-mobile');
        if (thinking) {
            thinking.remove();
        }
    }
    
    function sendMessage() {
        if (isProcessing) return;
        
        const message = (chatInput && chatInput.value.trim()) || (chatInputMobile && chatInputMobile.value.trim());
        if (!message) return;
        
        isProcessing = true;
        if (sendBtn) sendBtn.disabled = true;
        if (sendBtnMobile) sendBtnMobile.disabled = true;
        if (chatInput) chatInput.disabled = true;
        if (chatInputMobile) chatInputMobile.disabled = true;
        
        appendUserMessage(message);
        appendUserMessageMobile(message);
        chatHistory.push({ role: 'user', content: message });
        if (chatInput) chatInput.value = '';
        if (chatInputMobile) chatInputMobile.value = '';
        
        showThinking('正在思考中，请稍候...');
        showThinkingMobile('正在思考中，请稍候...');
        
        const count = recommendCount ? parseInt(recommendCount.value) : 5;
        
        fetch('/api/ai-chat.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                count: count,
                history: chatHistory.slice(-6),
                excluded_movies: excludedMovies
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network error');
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let assistantText = '';
            let movies = [];
            
            function processStream() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        removeThinking();
                        removeThinkingMobile();
                        
                        if (assistantText) {
                            appendAssistantMessage(assistantText, movies);
                            appendAssistantMessageMobile(assistantText, movies);
                            chatHistory.push({ 
                                role: 'assistant', 
                                content: assistantText,
                                movies: movies.map(m => m.movie_id)
                            });
                            
                            movies.forEach(m => {
                                if (!excludedMovies.includes(m.movie_id)) {
                                    excludedMovies.push(m.movie_id);
                                }
                            });
                            
                            saveHistory();
                        }
                        
                        isProcessing = false;
                        if (sendBtn) sendBtn.disabled = false;
                        if (sendBtnMobile) sendBtnMobile.disabled = false;
                        if (chatInput) chatInput.disabled = false;
                        if (chatInputMobile) chatInputMobile.disabled = false;
                        if (chatInput) chatInput.focus();
                        if (chatInputMobile) chatInputMobile.focus();
                        return;
                    }
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop();
                    
                    lines.forEach(line => {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                
                                switch (data.type) {
                                    case 'thinking':
                                        showThinking(data.content);
                                        break;
                                    case 'text':
                                        removeThinking();
                                        assistantText += data.content;
                                        break;
                                    case 'movie':
                                        movies.push(data.data);
                                        break;
                                    case 'error':
                                        removeThinking();
                                        appendAssistantMessage('抱歉，' + data.message, []);
                                        isProcessing = false;
                                        if (sendBtn) sendBtn.disabled = false;
                                        if (sendBtnMobile) sendBtnMobile.disabled = false;
                                        if (chatInput) chatInput.disabled = false;
                                        if (chatInputMobile) chatInputMobile.disabled = false;
                                        break;
                                }
                            } catch (e) {
                            }
                        }
                    });
                    
                    processStream();
                }).catch(err => {
                    removeThinking();
                    appendAssistantMessage('抱歉，AI助手暂时无法响应，请稍后再试', []);
                    isProcessing = false;
                    if (sendBtn) sendBtn.disabled = false;
                    if (sendBtnMobile) sendBtnMobile.disabled = false;
                    if (chatInput) chatInput.disabled = false;
                    if (chatInputMobile) chatInputMobile.disabled = false;
                });
            }
            
            processStream();
        }).catch(err => {
            removeThinking();
            appendAssistantMessage('抱歉，AI助手暂时无法响应，请稍后再试', []);
            isProcessing = false;
            if (sendBtn) sendBtn.disabled = false;
            if (sendBtnMobile) sendBtnMobile.disabled = false;
            if (chatInput) chatInput.disabled = false;
            if (chatInputMobile) chatInputMobile.disabled = false;
        });
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (sendBtnMobile) {
        sendBtnMobile.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    if (chatInputMobile) {
        chatInputMobile.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    window.addEventListener('beforeunload', () => {
        localStorage.removeItem('ddys_chat_session');
    });
    
    loadHistory();
})();