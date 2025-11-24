class PosterGenerator {
    constructor(movieData, userData = null) {
        this.movieData = movieData;
        this.userData = userData;
        this.canvas = null;
        this.ctx = null;
        this.isDarkMode = true;
        this.isMobile = window.innerWidth < 768;

        this.width = this.isMobile ? 540 : 1080;
        this.height = this.isMobile ? 960 : 1920;
        this.scale = this.isMobile ? 0.5 : 1;

        this.textColor = '#ffffff';
        this.textShadowColor = 'rgba(0, 0, 0, 0.9)';
        this.isBackgroundDark = true;
    }

    setTheme(isDark) {
        this.isDarkMode = isDark;
    }

    getAverageBrightness(img, sampleX, sampleY, sampleWidth, sampleHeight) {
        const tempCanvas = document.createElement('canvas');
        const sampleSize = 100;
        tempCanvas.width = sampleSize;
        tempCanvas.height = sampleSize;
        const tempCtx = tempCanvas.getContext('2d');

        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;

        tempCtx.drawImage(
            img,
            sampleX * imgWidth / this.width,
            sampleY * imgHeight / this.height,
            sampleWidth * imgWidth / this.width,
            sampleHeight * imgHeight / this.height,
            0, 0, sampleSize, sampleSize
        );

        const imageData = tempCtx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;

        let totalBrightness = 0;
        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a === 0) continue;

            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += brightness;
            pixelCount++;
        }

        return pixelCount > 0 ? totalBrightness / pixelCount : 128;
    }

    setTextColorByBackground(posterImg) {
        const checkY = this.height * 0.65;
        const checkHeight = this.height * 0.25;

        const brightness = this.getAverageBrightness(
            posterImg,
            0,
            checkY,
            this.width,
            checkHeight
        );

        if (brightness > 140) {
            this.isBackgroundDark = false;
            this.textColor = '#1a1a1a';
            this.textShadowColor = 'rgba(255, 255, 255, 0.9)';
        } else {
            this.isBackgroundDark = true;
            this.textColor = '#ffffff';
            this.textShadowColor = 'rgba(0, 0, 0, 0.9)';
        }
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
    }

    async generate() {
        this.initCanvas();

        try {
            const posterImg = await this.loadImage(this.movieData.poster);

            this.setTextColorByBackground(posterImg);

            this.drawBackground(posterImg);

            this.drawInfoCard();
            
            await this.drawUserInfo();
            
            this.drawDivider();
            
            this.drawTitle();
            
            this.drawSummary();
            
            this.drawMovieInfo();
            
            await this.drawQRCode();
            
            this.drawBrand();
            
            return this.canvas;
        } catch (error) {
            throw error;
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('图片加载失败: ' + src));
            img.src = src;
        });
    }

    drawBackground(posterImg) {
        const ctx = this.ctx;

        ctx.save();

        const imgRatio = posterImg.width / posterImg.height;
        const canvasRatio = this.width / this.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            drawHeight = this.height;
            drawWidth = posterImg.width * (this.height / posterImg.height);
            offsetX = (this.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = this.width;
            drawHeight = posterImg.height * (this.width / posterImg.width);
            offsetX = 0;
            offsetY = (this.height - drawHeight) / 2;
        }

        ctx.drawImage(posterImg, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
    }

    drawInfoCard() {
        const ctx = this.ctx;
        const cardTop = this.height * 0.625;

        const gradient = ctx.createLinearGradient(0, cardTop, 0, this.height);

        if (this.isBackgroundDark) {
            gradient.addColorStop(0, 'rgba(26,26,26,0.85)');
            gradient.addColorStop(1, 'rgba(26,26,26,0.95)');
        } else {
            gradient.addColorStop(0, 'rgba(255,255,255,0.85)');
            gradient.addColorStop(1, 'rgba(255,255,255,0.95)');
        }

        const radius = 30 * this.scale;
        ctx.beginPath();
        ctx.moveTo(0, cardTop + radius);
        ctx.arcTo(0, cardTop, radius, cardTop, radius);
        ctx.lineTo(this.width - radius, cardTop);
        ctx.arcTo(this.width, cardTop, this.width, cardTop + radius, radius);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    async drawUserInfo() {
        const ctx = this.ctx;
        const startX = 80 * this.scale;
        const startY = (1200 + 60) * this.scale;
        let currentX = startX;

        if (this.userData && this.userData.avatar) {
            try {
                const avatarImg = await this.loadImage(this.userData.avatar);
                const avatarSize = 60 * this.scale;
                const avatarRadius = avatarSize / 2;
                const avatarCenterX = currentX + avatarRadius;
                const avatarCenterY = startY;

                ctx.save();
                ctx.beginPath();
                ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(avatarImg, currentX, startY - avatarRadius, avatarSize, avatarSize);
                ctx.restore();

                ctx.beginPath();
                ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
                ctx.strokeStyle = this.isBackgroundDark ? '#ffffff' : '#1a1a1a';
                ctx.lineWidth = 3 * this.scale;
                ctx.stroke();

                currentX += avatarSize + 15 * this.scale;
            } catch (error) {
            }
        }

        ctx.shadowColor = this.textShadowColor;
        ctx.shadowBlur = 8 * this.scale;
        ctx.shadowOffsetX = 2 * this.scale;
        ctx.shadowOffsetY = 2 * this.scale;

        if (this.userData && this.userData.username) {
            ctx.font = `bold ${28 * this.scale}px "Noto Sans SC", sans-serif`;
            ctx.fillStyle = this.textColor;
            ctx.textBaseline = 'middle';
            ctx.fillText(this.userData.username, currentX, startY);

            const usernameWidth = ctx.measureText(this.userData.username).width;
            currentX += usernameWidth + 10 * this.scale;
        }

        ctx.font = `${24 * this.scale}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = this.isBackgroundDark ? '#e0e0e0' : '#555555';
        ctx.fillText('邀你一起免费观看', currentX, startY);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    drawDivider() {
        const ctx = this.ctx;
        const y = (1200 + 60 + 60) * this.scale;
        const startX = 80 * this.scale;
        const endX = (1080 - 80) * this.scale;

        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.strokeStyle = this.isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1 * this.scale;
        ctx.stroke();
    }

    drawTitle() {
        const ctx = this.ctx;
        const startX = 80 * this.scale;
        let y = (1200 + 60 + 60 + 40) * this.scale;
        const maxWidth = 920 * this.scale;
        const fontSize = 56 * this.scale;
        const lineHeight = fontSize * 1.3;

        ctx.shadowColor = this.textShadowColor;
        ctx.shadowBlur = 10 * this.scale;
        ctx.shadowOffsetX = 3 * this.scale;
        ctx.shadowOffsetY = 3 * this.scale;

        ctx.font = `bold ${fontSize}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = this.textColor;
        ctx.textBaseline = 'top';

        const title = this.movieData.title;
        const lines = this.wrapText(ctx, title, maxWidth);

        lines.forEach(line => {
            ctx.fillText(line, startX, y);
            y += lineHeight;
        });

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        return y;
    }

    drawSummary() {
        const ctx = this.ctx;
        const startX = 80 * this.scale;
        let y = (1200 + 60 + 60 + 40 + 100) * this.scale;
        const maxWidth = 920 * this.scale;
        const fontSize = 24 * this.scale;
        const lineHeight = fontSize * 1.6;
        const maxLines = 3;

        const summary = this.extractSummary(this.movieData.intro, 150);

        ctx.shadowColor = this.textShadowColor;
        ctx.shadowBlur = 6 * this.scale;
        ctx.shadowOffsetX = 2 * this.scale;
        ctx.shadowOffsetY = 2 * this.scale;

        ctx.font = `${fontSize}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = this.isBackgroundDark ? '#f0f0f0' : '#333333';
        ctx.textBaseline = 'top';

        const lines = this.wrapText(ctx, summary, maxWidth);
        const displayLines = lines.slice(0, maxLines);

        displayLines.forEach((line, index) => {
            if (index === maxLines - 1 && lines.length > maxLines) {
                line = line.substring(0, line.length - 3) + '...';
            }
            ctx.fillText(line, startX, y);
            y += lineHeight;
        });

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    extractSummary(intro, maxLength = 150) {
        if (!intro) return '';

        const text = intro.replace(/<[^>]*>/g, '').trim();

        const sentences = text.split(/[。！？]/).filter(s => s.trim().length > 0);

        let summary = '';
        for (let i = 0; i < Math.min(3, sentences.length); i++) {
            const sentence = sentences[i].trim();
            if ((summary + sentence).length <= maxLength) {
                summary += sentence + '。';
            } else {
                break;
            }
        }

        if (summary.length > maxLength) {
            summary = summary.substring(0, maxLength - 3) + '...';
        }

        return summary || text.substring(0, maxLength) + '...';
    }

    wrapText(ctx, text, maxWidth) {
        const lines = [];
        let line = '';

        for (let i = 0; i < text.length; i++) {
            const testLine = line + text[i];
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
                lines.push(line);
                line = text[i];
            } else {
                line = testLine;
            }
        }

        if (line) {
            lines.push(line);
        }

        return lines;
    }

    drawMovieInfo() {
        const ctx = this.ctx;
        const startX = 80 * this.scale;
        let y = (1200 + 60 + 60 + 40 + 100 + 150) * this.scale;
        const fontSize = 26 * this.scale;

        ctx.shadowColor = this.textShadowColor;
        ctx.shadowBlur = 6 * this.scale;
        ctx.shadowOffsetX = 2 * this.scale;
        ctx.shadowOffsetY = 2 * this.scale;

        let infoText = '';
        if (this.movieData.rating && this.movieData.rating > 0) {
            infoText += `豆瓣评分 ${this.movieData.rating.toFixed(1)}`;
        }
        if (this.movieData.year) {
            infoText += infoText ? ` | ${this.movieData.year}` : this.movieData.year;
        }
        if (this.movieData.type) {
            infoText += infoText ? ` | ${this.movieData.type}` : this.movieData.type;
        }
        if (this.movieData.region) {
            infoText += infoText ? ` | ${this.movieData.region}` : this.movieData.region;
        }

        ctx.font = `500 ${fontSize}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = this.textColor;
        ctx.textBaseline = 'top';
        ctx.fillText(infoText, startX, y);

        if (this.movieData.genres && this.movieData.genres.length > 0) {
            y += fontSize * 1.5;
            const genreFontSize = 22 * this.scale;

            ctx.font = `${genreFontSize}px "Noto Sans SC", sans-serif`;
            ctx.fillStyle = this.isBackgroundDark ? '#d0d0d0' : '#666666';
            ctx.fillText('分类：', startX, y);

            const labelWidth = ctx.measureText('分类：').width;
            const genresText = this.movieData.genres.join(' / ');
            ctx.fillStyle = this.textColor;
            ctx.fillText(genresText, startX + labelWidth, y);
        }

        if (this.movieData.actors && this.movieData.actors.length > 0) {
            y += fontSize * 1.5;
            const actorFontSize = 22 * this.scale;

            ctx.font = `${actorFontSize}px "Noto Sans SC", sans-serif`;
            ctx.fillStyle = this.isBackgroundDark ? '#d0d0d0' : '#666666';
            ctx.fillText('主演：', startX, y);

            const labelWidth = ctx.measureText('主演：').width;
            const actorsText = this.movieData.actors.slice(0, 3).join(' / ');
            ctx.fillStyle = this.textColor;
            ctx.fillText(actorsText, startX + labelWidth, y);
        }

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    async drawQRCode() {
        const ctx = this.ctx;
        const qrSize = 180 * this.scale;
        const margin = 60 * this.scale;
        const qrX = this.width - qrSize - margin;
        const qrY = this.height - qrSize - margin;

        if (typeof QRCode === 'undefined') {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(qrX, qrY, qrSize, qrSize);
            ctx.fillStyle = '#999999';
            ctx.font = `${16 * this.scale}px "Noto Sans SC", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('二维码加载失败', qrX + qrSize / 2, qrY + qrSize / 2);
            ctx.textAlign = 'left';
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                document.body.appendChild(tempDiv);

                const movieUrl = `https://ddys.io/movie/${this.movieData.slug}`;

                const qrcode = new QRCode(tempDiv, {
                    text: movieUrl,
                    width: qrSize,
                    height: qrSize,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });

                setTimeout(() => {
                    try {
                        const qrImg = tempDiv.querySelector('img');
                        if (qrImg && qrImg.complete) {
                            const padding = 12 * this.scale;
                            const borderRadius = 16 * this.scale;
                            const borderWidth = 3 * this.scale;
                            const containerSize = qrSize + padding * 2;
                            const containerX = qrX - padding;
                            const containerY = qrY - padding;

                            ctx.fillStyle = '#ffffff';
                            this.drawRoundedRect(ctx, containerX, containerY, containerSize, containerSize, borderRadius);
                            ctx.fill();

                            const gradient = ctx.createLinearGradient(
                                containerX, containerY,
                                containerX + containerSize, containerY + containerSize
                            );
                            gradient.addColorStop(0, '#3b82f6');
                            gradient.addColorStop(1, '#8b5cf6');

                            ctx.strokeStyle = gradient;
                            ctx.lineWidth = borderWidth;
                            this.drawRoundedRect(ctx, containerX, containerY, containerSize, containerSize, borderRadius);
                            ctx.stroke();

                            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
                        } else {
                            ctx.fillStyle = '#f0f0f0';
                            ctx.fillRect(qrX, qrY, qrSize, qrSize);
                        }
                    } catch (error) {
                        ctx.fillStyle = '#f0f0f0';
                        ctx.fillRect(qrX, qrY, qrSize, qrSize);
                    } finally {
                        document.body.removeChild(tempDiv);
                        resolve();
                    }
                }, 500);

            } catch (error) {
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(qrX, qrY, qrSize, qrSize);
                resolve();
            }
        });
    }

    drawBrand() {
        const ctx = this.ctx;
        const startX = 80 * this.scale;
        const y = this.height - 150 * this.scale;

        ctx.shadowColor = this.textShadowColor;
        ctx.shadowBlur = 6 * this.scale;
        ctx.shadowOffsetX = 2 * this.scale;
        ctx.shadowOffsetY = 2 * this.scale;

        const brandFontSize = 32 * this.scale;
        ctx.font = `bold ${brandFontSize}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = this.textColor;
        ctx.textBaseline = 'middle';
        ctx.fillText('低端影视', startX, y);

        const brandWidth = ctx.measureText('低端影视').width;

        const separatorX = startX + brandWidth + 15 * this.scale;
        ctx.fillStyle = this.isBackgroundDark ? '#666666' : '#cccccc';
        ctx.fillText('|', separatorX, y);

        const domainX = separatorX + ctx.measureText('|').width + 15 * this.scale;
        const domainFontSize = 28 * this.scale;
        ctx.font = `500 ${domainFontSize}px "Noto Sans SC", sans-serif`;
        ctx.fillStyle = this.isBackgroundDark ? '#e0e0e0' : '#555555';
        ctx.fillText('ddys.io', domainX, y);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }

    toDataURL(quality = 0.85) {
        return this.canvas.toDataURL('image/jpeg', quality);
    }

    toBlob(quality = 0.85) {
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', quality);
        });
    }

    async download(filename = 'poster.jpg') {
        const blob = await this.toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}