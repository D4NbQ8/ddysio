(function() {
    const movieId = document.getElementById('movie-ai-assistant')?.dataset.movieId;
    if (!movieId) return;
    
    const presetBtns = document.querySelectorAll('.ai-preset-btn');
    const chatContainer = document.getElementById('movie-ai-chat');
    const chatMessages = document.getElementById('movie-chat-messages');
    const customInput = document.getElementById('custom-question-input');
    const customBtn = document.getElementById('custom-question-btn');
    
    const chatContainerMobile = document.getElementById('movie-ai-chat-mobile');
    const chatMessagesMobile = document.getElementById('movie-chat-messages-mobile');
    const customInputMobile = document.getElementById('custom-question-input-mobile');
    const customBtnMobile = document.getElementById('custom-question-btn-mobile');
    
    let isProcessing = false;
    
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const questionType = this.dataset.questionType;
            handleQuestion(questionType, null);
        });
    });
    
    if (customBtn) {
        customBtn.addEventListener('click', function() {
            const question = customInput.value.trim();
            if (question) {
                handleQuestion('custom', question);
                customInput.value = '';
            }
        });
    }
    
    if (customInput) {
        customInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                customBtn.click();
            }
        });
    }
    
    if (customBtnMobile) {
        customBtnMobile.addEventListener('click', function() {
            const question = customInputMobile.value.trim();
            if (question) {
                handleQuestion('custom', question);
                customInputMobile.value = '';
            }
        });
    }
    
    if (customInputMobile) {
        customInputMobile.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                customBtnMobile.click();
            }
        });
    }
    
    function handleQuestion(questionType, customQuestion) {
        if (isProcessing) return;
        
        isProcessing = true;
        
        presetBtns.forEach(b => b.disabled = true);
        if (customBtn) customBtn.disabled = true;
        if (customInput) customInput.disabled = true;
        if (customBtnMobile) customBtnMobile.disabled = true;
        if (customInputMobile) customInputMobile.disabled = true;
        
        if (chatContainer) {
            chatContainer.classList.remove('hidden');
            chatMessages.innerHTML = '';
            showThinking('正在思考中，请稍候...');
        }
        if (chatContainerMobile) {
            chatContainerMobile.classList.remove('hidden');
            chatMessagesMobile.innerHTML = '';
            showThinkingMobile('正在思考中，请稍候...');
        }
        
        fetch('/api/ai-movie-assistant.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                movie_id: parseInt(movieId),
                question_type: questionType,
                custom_question: customQuestion
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network error');
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let assistantText = '';
            
            function processStream() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        removeThinking();
                        removeThinkingMobile();
                        
                        if (assistantText) {
                            appendAssistantMessage(assistantText);
                            appendAssistantMessageMobile(assistantText);
                        }
                        
                        isProcessing = false;
                        presetBtns.forEach(b => b.disabled = false);
                        if (customBtn) customBtn.disabled = false;
                        if (customInput) customInput.disabled = false;
                        if (customBtnMobile) customBtnMobile.disabled = false;
                        if (customInputMobile) customInputMobile.disabled = false;
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
                                        showThinkingMobile(data.content);
                                        break;
                                    case 'text':
                                        removeThinking();
                                        removeThinkingMobile();
                                        assistantText += data.content;
                                        break;
                                    case 'error':
                                        removeThinking();
                                        removeThinkingMobile();
                                        appendAssistantMessage('抱歉，' + data.message);
                                        appendAssistantMessageMobile('抱歉，' + data.message);
                                        isProcessing = false;
                                        presetBtns.forEach(b => b.disabled = false);
                                        if (customBtn) customBtn.disabled = false;
                                        if (customInput) customInput.disabled = false;
                                        if (customBtnMobile) customBtnMobile.disabled = false;
                                        if (customInputMobile) customInputMobile.disabled = false;
                                        break;
                                }
                            } catch (e) {
                            }
                        }
                    });
                    
                    processStream();
                }).catch(err => {
                    removeThinking();
                    removeThinkingMobile();
                    appendAssistantMessage('抱歉，AI助手暂时无法响应，请稍后再试');
                    appendAssistantMessageMobile('抱歉，AI助手暂时无法响应，请稍后再试');
                    isProcessing = false;
                    presetBtns.forEach(b => b.disabled = false);
                    if (customBtn) customBtn.disabled = false;
                    if (customInput) customInput.disabled = false;
                    if (customBtnMobile) customBtnMobile.disabled = false;
                    if (customInputMobile) customInputMobile.disabled = false;
                });
            }
            
            processStream();
        }).catch(err => {
            removeThinking();
            removeThinkingMobile();
            appendAssistantMessage('抱歉，AI助手暂时无法响应，请稍后再试');
            appendAssistantMessageMobile('抱歉，AI助手暂时无法响应，请稍后再试');
            isProcessing = false;
            presetBtns.forEach(b => b.disabled = false);
            if (customBtn) customBtn.disabled = false;
            if (customInput) customInput.disabled = false;
            if (customBtnMobile) customBtnMobile.disabled = false;
            if (customInputMobile) customInputMobile.disabled = false;
        });
    }
    
    function showThinking(text) {
        chatMessages.innerHTML = `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div class="flex flex-col items-center justify-center">
                    <svg class="animate-spin h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="text-base text-gray-900 dark:text-gray-100 font-light">正在思考中，请稍候...</p>
                </div>
            </div>
        `;
    }
    
    function removeThinking() {
        if (chatMessages) chatMessages.innerHTML = '';
    }
    
    function appendAssistantMessage(text) {
        if (!chatMessages) return;
        const textDiv = document.createElement('div');
        textDiv.className = 'whitespace-pre-wrap text-gray-800 dark:text-gray-200';
        textDiv.textContent = text;
        chatMessages.appendChild(textDiv);
    }
    
    function showThinkingMobile(text) {
        if (!chatMessagesMobile) return;
        chatMessagesMobile.innerHTML = `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center">
                <svg class="animate-spin h-8 w-8 text-gray-400 dark:text-gray-500 mb-2 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-xs text-gray-900 dark:text-gray-100">正在思考中，请稍候...</p>
            </div>
        `;
    }
    
    function removeThinkingMobile() {
        if (chatMessagesMobile) chatMessagesMobile.innerHTML = '';
    }
    
    function appendAssistantMessageMobile(text) {
        if (!chatMessagesMobile) return;
        const textDiv = document.createElement('div');
        textDiv.className = 'whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-xs';
        textDiv.textContent = text;
        chatMessagesMobile.appendChild(textDiv);
    }
})();