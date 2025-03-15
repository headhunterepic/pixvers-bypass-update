// ==UserScript==
// @name        pixverse nsfw video bypass
// @match       https://app.pixverse.ai/*
// @run-at      document-start
// @version     4.3
// @author      pixvers creator + +
// ==/UserScript==

(function () {
    'use strict';

    
    const encodedKey = 'SzkjbVB4'; 
    const eK = atob(encodedKey); 
    let isBypassActive = localStorage.getItem('bypassKey') === eK;

    let savedImagePath = null;

  
    function showNotification(message, isError = false) {
        const noti = document.createElement('div');
        noti.textContent = message;
        Object.assign(noti.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: isError ? 'linear-gradient(135deg, #ff4444, #ff9999)' : 'linear-gradient(135deg, #00c4cc, #7b00ff)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: '9999',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            animation: 'fadeInOut 2s ease-in-out'
        });

        document.body.appendChild(noti);
        setTimeout(() => noti.remove(), 2000);

        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-20px); }
                20% { opacity: 1; transform: translateY(0); }
                80% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

   
    function createKeyPrompt() {
        if (isBypassActive) {
            startBypass();
            return;
        }

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            zIndex: '9998',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        });

        const promptBox = document.createElement('div');
        Object.assign(promptBox.style, {
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        const title = document.createElement('h2');
        title.textContent = 'กรุณาใส่คีย์เพื่อเปิดใช้งานบายพาส';
        Object.assign(title.style, { margin: '0 0 20px', color: '#333' });

        const input = document.createElement('input');
        Object.assign(input.style, {
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box'
        });

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'ยืนยัน';
        Object.assign(submitBtn.style, {
            background: 'linear-gradient(135deg, #00c4cc, #7b00ff)',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'transform 0.2s'
        });
        submitBtn.onmouseover = () => submitBtn.style.transform = 'scale(1.05)';
        submitBtn.onmouseout = () => submitBtn.style.transform = 'scale(1)';

        submitBtn.onclick = () => {
            const userInput = input.value;
            console.log('[Debug] คีย์ที่ผู้ใช้ป้อน:', userInput);
            console.log('[Debug] คีย์ที่ถอดรหัสจาก Base64:', eK);
            console.log('[Debug] เปรียบเทียบ:', userInput === eK);

            if (userInput === eK) {
                localStorage.setItem('bypassKey', eK);
                isBypassActive = true;
                document.body.removeChild(overlay);
                showNotification('บายพาสเปิดใช้งาน');
                startBypass();
            } else {
                showNotification('คีย์ไม่ถูกต้อง!', true);
                input.value = '';
            }
        };

        promptBox.append(title, input, submitBtn);
        overlay.appendChild(promptBox);
        document.body.appendChild(overlay);
    }

    // เริ่มการทำงานของบายพาส
    function startBypass() {
        showNotification('บายพาสเปิดใช้งาน');
        setupWatermarkButton();
        waitForAxios();
    }

  
    function setupWatermarkButton() {
        if (!isBypassActive) return;
        showNotification('บายพาสเปิดใช้งาน');

        function replaceWatermarkDivWithButton() {
            const watermarkDiv = Array.from(document.getElementsByTagName('div')).find(
                el => el.textContent.trim() === 'Watermark-free'
            );

            if (!watermarkDiv) {
                setTimeout(replaceWatermarkDivWithButton, 500);
                return;
            }

            const newButton = createWatermarkButton(watermarkDiv);
            watermarkDiv.parentNode.replaceChild(newButton, watermarkDiv);
            console.log('[Watermark-free] Button replaced and listener attached');
        }

        function createWatermarkButton(originalDiv) {
            const button = document.createElement('button');
            button.textContent = 'Watermark-free';
            button.style.cssText = window.getComputedStyle(originalDiv).cssText;

            button.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log('[Watermark-free] Button clicked!');
                downloadVideoWithoutWatermark();
            });

            return button;
        }

        function downloadVideoWithoutWatermark() {
            const videoElement = document.querySelector('.component-video > video');
            if (!videoElement || !videoElement.src) {
                console.error('[Watermark-free] Video element not found or no src attribute');
                alert('Could not find the video to download. Please ensure a video is loaded.');
                return;
            }

            const videoUrl = videoElement.src;
            console.log('[Watermark-free] Video URL:', videoUrl);

            const link = document.createElement('a');
            link.href = videoUrl;
            link.download = videoUrl.split('/').pop() || 'video.mp4';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('[Watermark-free] Download triggered for:', videoUrl);
        }

        replaceWatermarkDivWithButton();
    }

    function waitForAxios() {
        if (!isBypassActive) return;
        showNotification('บายพาสเปิดใช้งาน');
        if (typeof axios === 'undefined') {
            setTimeout(waitForAxios, 10);
            return;
        }
        patchAxios();
    }

    function patchAxios() {
        const originalCreate = axios.create;
        axios.create = function (config) {
            const instance = originalCreate.apply(this, arguments);
            patchInstance(instance);
            return instance;
        };
        console.log('Axios patching for /video/list/personal, /media/batch_upload_media, and /media/upload complete');
    }

    function patchInstance(instance) {
        const originalPost = instance.post;

        instance.post = function (url, data, config) {
            if (url.includes('/video/list/personal')) {
                return originalPost.apply(this, arguments).then(response => {
                    console.log('[Debug] /video/list/personal response:', response);
                    return {
                        ...response,
                        data: modifyResponseData(response.data)
                    };
                }).catch(logError('/video/list/personal'));
            }
            return originalPost.apply(this, arguments);
        };

        instance.interceptors.request.use(
            config => handleRequest(config),
            error => logError('Request Interceptor')(error)
        );

        instance.interceptors.response.use(
            response => handleResponse(response),
            error => logError('Response Interceptor')(error)
        );
    }

    function handleRequest(config) {
        if (config.url && (config.url.includes('/media/batch_upload_media') || config.url.includes('/media/upload'))) {
            console.log(`[Debug] ${config.url.includes('/media/batch_upload_media') ? '/media/batch_upload_media' : '/media/upload'} request payload:`, config);
            savedImagePath = extractPathFromRequest(config);
            console.log('[Debug] Saved path:', savedImagePath);
        }
        return config;
    }

    function extractPathFromRequest(config) {
        if (config.url.includes('/media/batch_upload_media') && config.data?.images?.[0]?.path) {
            return config.data.images[0].path;
        }
        if (config.url.includes('/media/upload') && config.data?.path) {
            return config.data.path;
        }
        return null;
    }

    function handleResponse(response) {
        if (response.config.url.includes('/media/batch_upload_media')) {
            console.log('[Debug] /media/batch_upload_media raw response:', response);
            return { ...response, data: modifyBatchUploadData(response.data) };
        }
        if (response.config.url.includes('/media/upload')) {
            console.log('[Debug] /media/upload raw response:', response);
            return { ...response, data: modifySingleUploadData(response.data) };
        }
        return response;
    }

    function modifyResponseData(data) {
        if (!Array.isArray(data)) return data;
        return data.map(item => ({
            ...item,
            video_status: item.video_status === 7 ? 1 : item.video_status,
            first_frame: item.extended === 1 ? item.customer_paths?.customer_video_last_frame_url : item.customer_paths?.customer_img_url,
            url: 'https://media.pixverse.ai/' + item.video_path
        }));
    }

    function modifyBatchUploadData(data) {
        if (data?.ErrCode !== 400 || !savedImagePath) return data;
        console.log('[Debug] Modifying ErrCode 400 response for batch_upload_media');
        const imageId = Date.now();
        const imageName = savedImagePath.split('/').pop();
        const imageUrl = `https://media.pixverse.ai/${savedImagePath}`;

        return {
            ErrCode: 0,
            ErrMsg: "success",
            Resp: {
                result: [{ id: imageId, category: 0, err_msg: "", name: imageName, path: savedImagePath, size: 0, url: imageUrl }]
            }
        };
    }

    function modifySingleUploadData(data) {
        if (data?.ErrCode !== 400040 || !savedImagePath) return data;
        console.log('[Debug] Modifying ErrCode 400040 response for /media/upload');
        const videoUrl = `https://media.pixverse.ai/${savedImagePath}`;

        return {
            ErrCode: 0,
            ErrMsg: "success",
            Resp: { path: savedImagePath, url: videoUrl }
        };
    }

    function logError(context) {
        return error => {
            console.error(`[Axios ${context}] Error:`, {
                url: error.config?.url,
                error: error.message,
                response: error.response?.data,
                timestamp: new Date().toISOString()
            });
            return Promise.reject(error);
        };
    }

    document.addEventListener('DOMContentLoaded', createKeyPrompt);
})();
