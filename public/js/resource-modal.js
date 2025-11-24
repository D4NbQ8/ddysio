function openResourceModal(type) {
    currentResourceType = type;
    const modal = document.getElementById('resourceModal');
    const title = document.getElementById('resourceModalTitle');
    const collectionButton = document.getElementById('collectionButton');
    
    if (type === 'online') {
        title.textContent = '在线播放资源管理';
        if (collectionButton) {
            collectionButton.style.display = 'inline-block';
        }
    } else if (type === 'download') {
        title.textContent = '网盘下载资源管理';
        if (collectionButton) {
            collectionButton.style.display = 'none';
        }
    }
    
    modal.classList.remove('hidden');
    loadResources();
}

function closeResourceModal() {
    document.getElementById('resourceModal').classList.add('hidden');
    closeResourceForm();
    currentResourceType = '';
    editingResourceId = null;
}

function truncateUrl(url, maxLength = 60) {
    if (!url || url.length <= maxLength) {
        return url;
    }
    const start = url.substring(0, Math.floor(maxLength / 2) - 3);
    const end = url.substring(url.length - Math.floor(maxLength / 2) + 3);
    return start + '...' + end;
}

function loadResources() {
    const list = document.getElementById('resourceList');
    const resourceList = resources[currentResourceType] || [];
    
    if (resourceList.length === 0) {
        list.innerHTML = '<p class="text-sm text-gray-500 font-light text-center py-8">暂无资源</p>';
        return;
    }
    
    let html = '<div class="space-y-3">';
    resourceList.forEach(resource => {
        const resourceId = resource.resource_id || resource.id;
        const fullUrl = resource.url || '';
        const displayUrl = truncateUrl(fullUrl, 80);
        const urlId = 'url-' + resourceId;
        
        if (currentResourceType === 'online') {
            html += `
                <div class="flex items-start justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                    <div class="flex-1 min-w-0 mr-4">
                        <div class="text-sm font-medium text-gray-900 mb-1">${resource.name || '源站'}</div>
                        <div class="text-xs text-gray-600 font-light mt-1 break-all word-break-all" title="${fullUrl}">
                            <span id="${urlId}">${displayUrl}</span>
                            ${fullUrl.length > 80 ? `<button onclick="toggleFullUrl('${urlId}', '${fullUrl.replace(/'/g, "\\'")}')" class="text-blue-600 hover:text-blue-800 ml-1 underline text-xs">${displayUrl === fullUrl ? '收起' : '展开'}</button>` : ''}
                        </div>
                        <div class="text-xs text-gray-500 font-light mt-1">${resource.quality || ''} · ${resource.format ? resource.format.toUpperCase() : ''}</div>
                        <button onclick="copyUrl('${fullUrl.replace(/'/g, "\\'")}')" class="mt-2 px-2 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors rounded text-xs font-light">复制链接</button>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button onclick="editResource(${resourceId})" class="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors rounded text-xs font-light whitespace-nowrap">编辑</button>
                        <button onclick="deleteResource(${resourceId})" class="px-3 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors rounded text-xs font-light whitespace-nowrap">删除</button>
                    </div>
                </div>
            `;
        } else {
            const typeNames = {
                'quark': '夸克网盘',
                'baidu': '百度网盘',
                'aliyun': '阿里云盘',
                '115': '115网盘',
                '123': '123网盘',
                'magnet': '磁力链接',
                'ed2k': '电驴链接',
                'uc': 'UC网盘',
                'mobile': '移动云盘',
                'tianyi': '天翼云盘',
                'pikpak': 'PikPak',
                'xunlei': '迅雷网盘',
                'other': '其他'
            };
            html += `
                <div class="flex items-start justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                    <div class="flex-1 min-w-0 mr-4">
                        <div class="text-sm font-medium text-gray-900 mb-1">${typeNames[resource.download_type || resource.type] || resource.download_type || resource.type || '其他'}</div>
                        <div class="text-xs text-gray-600 font-light mt-1 break-all word-break-all" title="${fullUrl}">
                            <span id="${urlId}">${displayUrl}</span>
                            ${fullUrl.length > 80 ? `<button onclick="toggleFullUrl('${urlId}', '${fullUrl.replace(/'/g, "\\'")}')" class="text-blue-600 hover:text-blue-800 ml-1 underline text-xs">${displayUrl === fullUrl ? '收起' : '展开'}</button>` : ''}
                        </div>
                        <div class="text-xs text-gray-500 font-light mt-1">${resource.quality || ''} · ${resource.size || '未知大小'}${resource.extract_code || resource.code ? ' · 提取码：' + (resource.extract_code || resource.code) : ''}</div>
                        <button onclick="copyUrl('${fullUrl.replace(/'/g, "\\'")}')" class="mt-2 px-2 py-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors rounded text-xs font-light">复制链接</button>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button onclick="editResource(${resourceId})" class="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors rounded text-xs font-light whitespace-nowrap">编辑</button>
                        <button onclick="deleteResource(${resourceId})" class="px-3 py-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors rounded text-xs font-light whitespace-nowrap">删除</button>
                    </div>
                </div>
            `;
        }
    });
    html += '</div>';
    list.innerHTML = html;
}

function toggleFullUrl(elementId, fullUrl) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const displayUrl = truncateUrl(fullUrl, 80);
    const isTruncated = element.textContent !== fullUrl;
    
    if (isTruncated) {
        element.textContent = fullUrl;
        const button = element.nextElementSibling;
        if (button) {
            button.textContent = '收起';
        }
    } else {
        element.textContent = displayUrl;
        const button = element.nextElementSibling;
        if (button) {
            button.textContent = '展开';
        }
    }
}

function copyUrl(url) {
    if (!url) return;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            toast.success('链接已复制到剪贴板');
        }).catch(err => {
            fallbackCopyTextToClipboard(url);
        });
    } else {
        fallbackCopyTextToClipboard(url);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            toast.success('链接已复制到剪贴板');
        } else {
            toast.error('复制失败，请手动复制');
        }
    } catch (err) {
        toast.error('复制失败，请手动复制');
    }
    
    document.body.removeChild(textArea);
}

function showAddResourceForm() {
    editingResourceId = null;
    document.getElementById('resourceFormTitle').textContent = '添加资源';
    const saveButton = document.getElementById('saveResourceButton');
    if (saveButton) {
        saveButton.textContent = '添加资源';
    }

    document.getElementById('resourceFormElement').reset();

    document.getElementById('resourceId').value = '';
    document.getElementById('resourceType').value = currentResourceType;
    
    if (currentResourceType === 'download') {
        const downloadTypeSelect = document.getElementById('downloadType');
        if (downloadTypeSelect) {
            downloadTypeSelect.dataset.autoDetected = 'false';
            downloadTypeSelect.dataset.userModified = 'false';
        }
    }

    if (currentResourceType === 'online') {
        document.getElementById('onlineFields').classList.remove('hidden');
        document.getElementById('downloadFields').classList.add('hidden');
    } else {
        document.getElementById('onlineFields').classList.add('hidden');
        document.getElementById('downloadFields').classList.remove('hidden');
    }

    document.getElementById('resourceForm').classList.remove('hidden');
}

function editResource(id) {
    editingResourceId = id;
    const resourceList = resources[currentResourceType] || [];
    const resource = resourceList.find(r => (r.resource_id || r.id) === id);
    
    if (!resource) return;
    
    document.getElementById('resourceFormTitle').textContent = '编辑资源';
    const saveButton = document.getElementById('saveResourceButton');
    if (saveButton) {
        saveButton.textContent = '保存';
    }
    document.getElementById('resourceId').value = resource.resource_id || resource.id;
    document.getElementById('resourceType').value = currentResourceType;
    
    if (currentResourceType === 'online') {
        document.getElementById('onlineFields').classList.remove('hidden');
        document.getElementById('downloadFields').classList.add('hidden');
        document.getElementById('sourceName').value = resource.name || '';
        document.getElementById('sourceUrl').value = resource.url || '';
        document.getElementById('sourceQuality').value = resource.quality || '1080P';
        document.getElementById('sourceFormat').value = resource.format || 'mp4';
    } else {
        document.getElementById('onlineFields').classList.add('hidden');
        document.getElementById('downloadFields').classList.remove('hidden');
        const downloadTypeSelect = document.getElementById('downloadType');
        const downloadType = resource.download_type || resource.type || '';
        downloadTypeSelect.value = downloadType;
        if (downloadType) {
            downloadTypeSelect.dataset.userModified = 'true';
            downloadTypeSelect.dataset.autoDetected = 'false';
        } else {
            downloadTypeSelect.dataset.userModified = 'false';
            downloadTypeSelect.dataset.autoDetected = 'false';
        }
        document.getElementById('downloadUrl').value = resource.url || '';
        document.getElementById('downloadQuality').value = resource.quality || '1080P';
        document.getElementById('downloadSize').value = resource.size || '';
        document.getElementById('downloadCode').value = resource.extract_code || resource.code || '';
    }
    
    document.getElementById('resourceForm').classList.remove('hidden');
}

function closeResourceForm() {
    document.getElementById('resourceForm').classList.add('hidden');
    document.getElementById('resourceFormElement').reset();
    editingResourceId = null;
    
    if (currentResourceType === 'download') {
        const downloadTypeSelect = document.getElementById('downloadType');
        if (downloadTypeSelect) {
            downloadTypeSelect.dataset.autoDetected = 'false';
            downloadTypeSelect.dataset.userModified = 'false';
        }
    }
}

function saveResource() {
    const form = document.getElementById('resourceFormElement');

    let name, url, quality, format, downloadType, size, extractCode;

    if (currentResourceType === 'online') {
        name = document.getElementById('sourceName').value.trim();
        url = document.getElementById('sourceUrl').value.trim();
        quality = document.getElementById('sourceQuality').value;
        format = document.getElementById('sourceFormat').value;

        if (!name || !url) {
            toast.warning('请填写所有必填字段（在线资源需要：源站名称、播放链接）');
            return;
        }
    } else {
        downloadType = document.getElementById('downloadType').value;
        url = document.getElementById('downloadUrl').value.trim();
        quality = document.getElementById('downloadQuality').value;
        size = document.getElementById('downloadSize').value.trim();
        extractCode = document.getElementById('downloadCode').value.trim();

        if (!downloadType || !url) {
            let missingFields = [];
            if (!downloadType) missingFields.push('网盘类型');
            if (!url) missingFields.push('下载链接');
            toast.warning('请填写所有必填字段：' + missingFields.join('、'));
            return;
        }
    }
    
    const resourceId = document.getElementById('resourceId').value;
    const resourceList = resources[currentResourceType] || [];

    if (resourceId && editingResourceId) {
        const index = resourceList.findIndex(r => (r.resource_id || r.id) === parseInt(resourceId));
        if (index !== -1) {
            if (currentResourceType === 'online') {
                resourceList[index] = {
                    ...resourceList[index],
                    name: name,
                    url: url,
                    quality: quality,
                    format: format
                };
            } else {
                resourceList[index] = {
                    ...resourceList[index],
                    download_type: downloadType,
                    type: downloadType,
                    url: url,
                    quality: quality,
                    size: size,
                    extract_code: extractCode,
                    code: extractCode
                };
            }
        }
        toast.success('资源已更新');
    } else {
        const newId = resourceList.length > 0 ? Math.max(...resourceList.map(r => r.resource_id || r.id || 0)) + 1 : 1;
        if (currentResourceType === 'online') {
            resourceList.push({
                id: newId,
                resource_id: newId,
                name: name,
                url: url,
                quality: quality,
                format: format
            });
        } else {
            resourceList.push({
                id: newId,
                resource_id: newId,
                download_type: downloadType,
                type: downloadType,
                url: url,
                quality: quality,
                size: size,
                extract_code: extractCode,
                code: extractCode
            });
        }
        toast.success('资源已添加');
    }

    resources[currentResourceType] = resourceList;
    
    loadResources();
    closeResourceForm();
}

function deleteResource(id) {
    toast.confirm('确定要删除这个资源吗？此操作不可恢复。', function() {
        const resourceList = resources[currentResourceType] || [];
        const index = resourceList.findIndex(r => (r.resource_id || r.id) === id);
        if (index !== -1) {
            resourceList.splice(index, 1);
            resources[currentResourceType] = resourceList;
            
            loadResources();
            toast.success('资源已删除');
        }
    });
}

function autoDetectFormat(url) {
    if (!url || currentResourceType !== 'online') return;
    
    const formatSelect = document.getElementById('sourceFormat');
    if (!formatSelect) return;
    
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('.m3u8') || urlLower.includes('/hls/') || urlLower.includes('m3u8')) {
        formatSelect.value = 'm3u8';
    } else if (urlLower.includes('.mp4') || urlLower.includes('/mp4/')) {
        formatSelect.value = 'mp4';
    } else if (urlLower.includes('.flv') || urlLower.includes('/flv/')) {
        formatSelect.value = 'flv';
    } else if (urlLower.includes('.webm') || urlLower.includes('/webm/')) {
        formatSelect.value = 'webm';
    } else if (urlLower.includes('.ogg') || urlLower.includes('/ogg/')) {
        formatSelect.value = 'ogg';
    }
}

function handleDownloadTypeChange() {
    const downloadTypeSelect = document.getElementById('downloadType');
    if (downloadTypeSelect) {
        downloadTypeSelect.dataset.userModified = 'true';
        downloadTypeSelect.dataset.autoDetected = 'false';
    }
}

function autoDetectDownloadType(url) {
    if (!url || currentResourceType !== 'download') return;
    
    const downloadTypeSelect = document.getElementById('downloadType');
    if (!downloadTypeSelect) return;
    
    if (downloadTypeSelect.dataset.userModified === 'true') {
        return;
    }
    
    const urlLower = url.toLowerCase();
    let detectedType = null;
    
    if (urlLower.includes('pan.baidu.com')) {
        detectedType = 'baidu';
    }
    else if (urlLower.includes('pan.quark.cn')) {
        detectedType = 'quark';
    }
    else if (urlLower.includes('drive.uc.cn')) {
        detectedType = 'uc';
    }
    else if (urlLower.includes('alipan.com') || urlLower.includes('aliyundrive.com')) {
        detectedType = 'aliyun';
    }
    else if (urlLower.includes('115cdn.com') || urlLower.includes('115.com')) {
        detectedType = '115';
    }
    else if (urlLower.includes('123865.com') || urlLower.includes('123684.com') || urlLower.includes('123912.com')) {
        detectedType = '123';
    }
    else if (urlLower.includes('yun.139.com')) {
        detectedType = 'mobile';
    }
    else if (urlLower.includes('cloud.189.cn')) {
        detectedType = 'tianyi';
    }
    else if (urlLower.includes('mypikpak.com')) {
        detectedType = 'pikpak';
    }
    else if (urlLower.includes('pan.xunlei.com')) {
        detectedType = 'xunlei';
    }
    else if (urlLower.startsWith('magnet:?')) {
        detectedType = 'magnet';
    }
    else if (urlLower.startsWith('ed2k://')) {
        detectedType = 'ed2k';
    }
    
    if (detectedType) {
        const currentValue = downloadTypeSelect.value;
        if (!currentValue || currentValue === '') {
            downloadTypeSelect.value = detectedType;
            downloadTypeSelect.dataset.autoDetected = 'true';
            downloadTypeSelect.dataset.userModified = 'false';
        }
    }
}

function getDownloadTypeName(type) {
    const typeNames = {
        'quark': '夸克网盘',
        'baidu': '百度网盘',
        'aliyun': '阿里云盘',
        '115': '115网盘',
        '123': '123网盘',
        'magnet': '磁力链接',
        'ed2k': '电驴链接',
        'uc': 'UC网盘',
        'mobile': '移动云盘',
        'tianyi': '天翼云盘',
        'pikpak': 'PikPak',
        'xunlei': '迅雷网盘',
        'other': '其他'
    };
    return typeNames[type] || type;
}

let collectionResults = [];
let selectedCollectionItems = new Set();

function openCollectionModal() {
    const modal = document.getElementById('collectionModal');
    const titleInput = document.querySelector('input[name="title"]');
    const keywordInput = document.getElementById('collectionKeyword');
    
    if (titleInput && keywordInput) {
        keywordInput.value = titleInput.value.trim();
    }
    
    modal.classList.remove('hidden');
    collectionResults = [];
    selectedCollectionItems.clear();
    updateImportButton();
}

function closeCollectionModal() {
    document.getElementById('collectionModal').classList.add('hidden');
    collectionResults = [];
    selectedCollectionItems.clear();
}

function searchCollection() {
    const keyword = document.getElementById('collectionKeyword').value.trim();
    
    if (!keyword) {
        toast.warning('请输入搜索关键词');
        return;
    }
    
    const resultsDiv = document.getElementById('collectionResults');
    resultsDiv.innerHTML = '<div class="text-center text-gray-500 py-8">搜索中...</div>';
    
    const titleInput = document.querySelector('input[name="title"]');
    const yearInput = document.querySelector('input[name="year"]');
    const movieTitle = titleInput ? titleInput.value.trim() : '';
    const movieYear = yearInput ? yearInput.value.trim() : '';
    
    let apiUrl = `/api/collection-search.php?keyword=${encodeURIComponent(keyword)}`;
    if (movieTitle) apiUrl += `&movie_title=${encodeURIComponent(movieTitle)}`;
    if (movieYear) apiUrl += `&movie_year=${encodeURIComponent(movieYear)}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.results && data.results.length > 0) {
                collectionResults = data.results;
                displayCollectionResults(data.results);
                selectedCollectionItems.clear();
                data.results.forEach((_, index) => selectedCollectionItems.add(index));
                updateImportButton();
            } else {
                resultsDiv.innerHTML = '<div class="text-center text-gray-500 py-8">未找到结果</div>';
            }
        })
        .catch(error => {
            resultsDiv.innerHTML = '<div class="text-center text-red-500 py-8">搜索失败</div>';
            toast.error('搜索失败');
        });
}

function displayCollectionResults(results) {
    const resultsDiv = document.getElementById('collectionResults');
    
    let html = `<div class="mb-3 text-sm text-gray-700">找到 ${results.length} 个结果：</div>`;
    html += '<div class="space-y-2 max-h-96 overflow-y-auto">';
    
    results.forEach((result, index) => {
        const episodeCount = result.episodes ? result.episodes.length : 0;
        html += `
            <div class="flex items-start p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors">
                <input 
                    type="checkbox" 
                    id="collection-${index}" 
                    checked
                    onchange="toggleCollectionItem(${index})"
                    class="mt-1 mr-3"
                >
                <label for="collection-${index}" class="flex-1 cursor-pointer">
                    <div class="text-sm font-medium text-gray-900">${result.name}</div>
                    <div class="text-xs text-gray-600 mt-1">
                        ${result.year ? result.year + ' / ' : ''}${result.area || ''} · ${result.source} · ${episodeCount} 集
                    </div>
                    ${result.note ? `<div class="text-xs text-gray-500 mt-1">${result.note}</div>` : ''}
                </label>
            </div>
        `;
    });
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

function toggleCollectionItem(index) {
    const checkbox = document.getElementById(`collection-${index}`);
    if (checkbox.checked) {
        selectedCollectionItems.add(index);
    } else {
        selectedCollectionItems.delete(index);
    }
    updateImportButton();
}

function updateImportButton() {
    const button = document.getElementById('importButton');
    const count = selectedCollectionItems.size;
    button.textContent = `导入选中 (${count})`;
    button.disabled = count === 0;
}

function importSelectedResources() {
    if (selectedCollectionItems.size === 0) {
        toast.warning('请至少选择一个资源');
        return;
    }
    
    const selectedResults = Array.from(selectedCollectionItems).map(index => collectionResults[index]);
    
    resources[currentResourceType] = [];
    
    let sourceCounter = 1;
    
    selectedResults.forEach(result => {
        if (!result.episodes || result.episodes.length === 0) return;
        
        const episodesBySource = {};
        result.episodes.forEach(ep => {
            const sourceName = ep.source || 'default';
            if (!episodesBySource[sourceName]) {
                episodesBySource[sourceName] = [];
            }
            episodesBySource[sourceName].push(ep);
        });
        
        Object.keys(episodesBySource).forEach(sourceName => {
            const episodes = episodesBySource[sourceName];
            
            if (episodes.length === 1) {
                const ep = episodes[0];
                resources[currentResourceType].push({
                    id: sourceCounter,
                    resource_id: sourceCounter,
                    name: `播放源 ${sourceCounter}`,
                    url: ep.url,
                    quality: detectQuality(ep.url, ep.episode),
                    format: 'm3u8'
                });
                sourceCounter++;
            } else {
                const urlParts = episodes.map(ep => `${ep.episode}$${ep.url}`).join('#');
                resources[currentResourceType].push({
                    id: sourceCounter,
                    resource_id: sourceCounter,
                    name: `播放源 ${sourceCounter}`,
                    url: urlParts,
                    quality: detectQuality(episodes[0].url, episodes[0].episode),
                    format: 'm3u8'
                });
                sourceCounter++;
            }
        });
    });
    
    loadResources();
    closeCollectionModal();
    toast.success(`已导入 ${sourceCounter - 1} 个资源`);
}

function detectQuality(url, note) {
    const urlLower = url.toLowerCase();
    const noteLower = (note || '').toLowerCase();
    
    if (urlLower.includes('4k') || noteLower.includes('4k')) {
        return '4K';
    } else if (urlLower.includes('1080') || noteLower.includes('1080')) {
        return '1080P';
    } else if (urlLower.includes('720') || noteLower.includes('720')) {
        return '720P';
    } else {
        return '1080P';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('resourceModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeResourceModal();
            }
        });
    }
    
    const collectionModal = document.getElementById('collectionModal');
    if (collectionModal) {
        collectionModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCollectionModal();
            }
        });
    }
    
    const collectionKeyword = document.getElementById('collectionKeyword');
    if (collectionKeyword) {
        collectionKeyword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCollection();
            }
        });
    }
});