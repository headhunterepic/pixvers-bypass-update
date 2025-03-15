// ==UserScript==
// @name        pixverse nsfw video bypass
// @match       https://app.pixverse.ai/*
// @run-at      document-start
// @version     3.4
// @author      pixvers creator + + 
// ==/UserScript==

(function () {
    'use strict';

    const ENCRYPTED_KEY = 'eWlwWEUyXiNKYVZC';
    const KEY_EXPIRY = 60 * 60 * 1000;
    let savedImagePath = null;
    let lastKeyEntryTime = localStorage.getItem('lastKeyEntryTime') ? parseInt(localStorage.getItem('lastKeyEntryTime')) : null;

   
    function simpleDecrypt(str) {
        return atob(str);
    }

   
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .auth-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .auth-box {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
                width: 350px;
                text-align: center;
                color: #fff;
                font-family: 'Arial', sans-serif;
            }
            .auth-box h2 {
                margin: 0 0 1.5rem;
                color: #00ffff;
                text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
            }
            .auth-box input {
                width: 100%;
                padding: 0.8rem;
                margin-bottom: 1rem;
                border: 1px solid #00ffff;
                border-radius: 5px;
                background: #0f1626;
                color: #fff;
                font-size: 1rem;
            }
            .auth-box button {
                width: 100%;
                padding: 0.8rem;
                background: #00ffff;
                border: none;
                border-radius: 5px;
                color: #1a1a2e;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }
            .auth-box button:hover {
                background: #00cccc;
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
            }
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
                padding: 1rem 2rem;
                border-radius: 10px;
                color: #1a1a2e;
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
                font-family: 'Arial', sans-serif;
                font-weight: bold;
                z-index: 10000;
                animation: slideIn 0.5s ease-out;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

   
    function showAuthPrompt() {
        const overlay = document.createElement('div');
        overlay.className = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-box">
                <h2>Enter Access Key</h2>
                <input type="password" id="keyInput" placeholder="Enter key here">
                <button id="submitKey">Submit</button>
            </div>
        `;
        document.body.appendChild(overlay);

        const submitButton = document.getElementById('submitKey');
        const keyInput = document.getElementById('keyInput');

        submitButton.onclick = () => {
            const enteredKey = keyInput.value;
            if (simpleDecrypt(ENCRYPTED_KEY) === enteredKey) {
                lastKeyEntryTime = Date.now();
                localStorage.setItem('lastKeyEntryTime', lastKeyEntryTime);
                document.body.removeChild(overlay);
                showNotification('Bypass Activated!');
            } else {
                alert('Invalid key!');
            }
        };

        keyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitButton.click();
        });
    }

    function showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => document.body.removeChild(notif), 500);
        }, 3000);
    }

   
    function checkAuth() {
        const now = Date.now();
        if (!lastKeyEntryTime || (now - lastKeyEntryTime) > KEY_EXPIRY) {
            showAuthPrompt();
            return false;
        }
        return true;
    }

    
    function setupWatermarkButton() {
        function findAndReplaceButton() {
            let watermarkDiv = Array.from(document.getElementsByTagName('div')).find(
                el => el.textContent.trim() === 'Watermark-free'
            );

            if (watermarkDiv) {
                const newButton = document.createElement('button');
                newButton.textContent = 'Watermark-free';

                const computedStyle = window.getComputedStyle(watermarkDiv);
                newButton.style.cssText = computedStyle.cssText;

                newButton.onclick = function (event) {
                    event.stopPropagation();
                    if (!checkAuth()) return;
                    console.log('[Watermark-free] Button clicked!');

                    const videoElement = document.querySelector(".component-video > video");
                    if (videoElement && videoElement.src) {
                        const videoUrl = videoElement.src;
                        console.log('[Watermark-free] Video URL:', videoUrl);

                        const link = document.createElement('a');
                        link.href = videoUrl;
                        link.download = videoUrl.split('/').pop() || 'video.mp4';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        console.log('[Watermark-free] Download triggered for:', videoUrl);
                    } else {
                        console.error('[Watermark-free] Video element not found or no src attribute');
                        alert('Could not find the video to download. Please ensure a video is loaded.');
                    }
                };

                watermarkDiv.parentNode.replaceChild(newButton, watermarkDiv);
                console.log('[Watermark-free] Button replaced and listener attached');
            } else {
                setTimeout(findAndReplaceButton, 500);
            }
        }

        findAndReplaceButton();
    }

    function waitForAxios() {
        if (typeof axios !== 'undefined') {
            patchAxios();
        } else {
            setTimeout(waitForAxios, 10);
        }
    }

    function modifyResponseData(data) {
        if (Array.isArray(data)) {
            return data.map(item => {
                const modifiedItem = item;

                if (item.video_status === 7) {
                    modifiedItem.video_status = 1;
                }

                if (item.extended === 1) {
                    modifiedItem.first_frame = item.customer_paths?.customer_video_last_frame_url;
                } else {
                    modifiedItem.first_frame = item.customer_paths?.customer_img_url;
                }

                modifiedItem.url = 'https://media.pixverse.ai/' + item.video_path;

                return modifiedItem;
            });
        }
        return data;
    }

    function modifyBatchUploadData(data) {
        console.log('[Debug] modifyBatchUploadData called with:', data);
        try {
            if (data && data.ErrCode === 400) {
                console.log('[Debug] Modifying ErrCode 400 response for batch_upload_media');

                if (savedImagePath) {
                    console.log('savedImagePath123: ' + savedImagePath);
                    console.log('[Debug] Transforming batch upload response with saved path:', savedImagePath);
                    const imageId = Date.now();
                    const imageName = savedImagePath.split('/').pop();
                    const imageUrl = `https://media.pixverse.ai/${savedImagePath}`;

                    return {
                        ErrCode: 0,
                        ErrMsg: "success",
                        Resp: {
                            result: [{
                                id: imageId,
                                category: 0,
                                err_msg: "",
                                name: imageName,
                                path: savedImagePath,
                                size: 0,
                                url: imageUrl
                            }]
                        }
                    };
                }
            }

            console.log('[Debug] No saved image path, returning original data for batch_upload_media');
            return data;
        } catch (error) {
            console.error('[Debug] Error in modifyBatchUploadData:', error);
            return data;
        }
    }

    function modifySingleUploadData(data) {
        console.log('[Debug] modifySingleUploadData called with:', data);
        try {
            if (data && data.ErrCode === 400040) {
                console.log('[Debug] Modifying ErrCode 400040 response for /media/upload');

                if (savedImagePath) {
                    console.log('savedImagePath123: ' + savedImagePath);
                    console.log('[Debug] Transforming single upload response with saved path:', savedImagePath);
                    const videoUrl = `https://media.pixverse.ai/${savedImagePath}`;

                    return {
                        ErrCode: 0,
                        ErrMsg: "success",
                        Resp: {
                            path: savedImagePath,
                            url: videoUrl
                        }
                    };
                }
            }

            console.log('[Debug] No saved image path, returning original data for /media/upload');
            return data;
        } catch (error) {
            console.error('[Debug] Error in modifySingleUploadData:', error);
            return data;
        }
    }

    function patchAxios() {
        const originalCreate = axios.create;

        axios.create = function (config) {
            const instance = originalCreate.apply(this, arguments);
            const instancePost = instance.post;

            instance.post = function (url, data, config) {
                if (url && url.includes('/video/list/personal')) {
                    const promise = instancePost.apply(this, arguments);
                    return promise.then(response => {
                        if (!checkAuth()) throw new Error('Authentication required');
                        console.log('[Debug] /video/list/personal response:', response);
                        const modifiedData = modifyResponseData(response.data);
                        return {
                            ...response,
                            data: modifiedData
                        };
                    }).catch(error => {
                        console.error('[Axios Instance POST /video/list/personal] Error:', {
                            url: url,
                            error: error.message,
                            timestamp: new Date().toISOString()
                        });
                        throw error;
                    });
                }
                return instancePost.apply(this, arguments);
            };

            instance.interceptors.request.use(
                function (config) {
                    if (config.url && (config.url.includes('/media/batch_upload_media') || config.url.includes('/media/upload'))) {
                        console.log(`[Debug] ${config.url.includes('/media/batch_upload_media') ? '/media/batch_upload_media' : '/media/upload'} request payload:`, {
                            url: config.url,
                            data: config.data,
                            method: config.method,
                            timestamp: new Date().toISOString()
                        });
                        if (config.url.includes('/media/batch_upload_media')) {
                            if (config.data && config.data.images && config.data.images[0] && config.data.images[0].path) {
                                savedImagePath = config.data.images[0].path;
                                console.log('[Debug] Saved image path from batch_upload_media:', savedImagePath);
                            } else {
                                console.log('[Debug] No image path found in batch_upload_media payload');
                            }
                        } else if (config.url.includes('/media/upload')) {
                            if (config.data && config.data.path) {
                                savedImagePath = config.data.path;
                                console.log('[Debug] Saved video path from /media/upload:', savedImagePath);
                            } else {
                                console.log('[Debug] No video path found in /media/upload payload');
                            }
                        }
                        return config;
                    }
                    return config;
                },
                function (error) {
                    console.error(`[Axios Request Interceptor ${error.config?.url?.includes('/media/batch_upload_media') ? '/media/batch_upload_media' : '/media/upload'}] Error:`, {
                        url: error.config?.url,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                    return Promise.reject(error);
                }
            );

            instance.interceptors.response.use(
                function (response) {
                    if (!checkAuth()) throw new Error('Authentication required');
                    if (response.config.url && response.config.url.includes('/media/batch_upload_media')) {
                        console.log('[Debug] /media/batch_upload_media raw response:', response);
                        const modifiedData = modifyBatchUploadData(response.data);
                        const modifiedResponse = {
                            ...response,
                            data: modifiedData
                        };
                        console.log('[Debug] /media/batch_upload_media modified response:', modifiedResponse);
                        return modifiedResponse;
                    }
                    if (response.config.url && response.config.url.includes('/media/upload')) {
                        console.log('[Debug] /media/upload raw response:', response);
                        const modifiedData = modifySingleUploadData(response.data);
                        const modifiedResponse = {
                            ...response,
                            data: modifiedData
                        };
                        console.log('[Debug] /media/upload modified response:', modifiedResponse);
                        return modifiedResponse;
                    }
                    return response;
                },
                function (error) {
                    if (error.config && error.config.url && (error.config.url.includes('/media/batch_upload_media') || error.config.url.includes('/media/upload'))) {
                        console.error(`[Axios Response Interceptor ${error.config.url.includes('/media/batch_upload_media') ? '/media/batch_upload_media' : '/media/upload'}] Error:`, {
                            url: error.config.url,
                            error: error.message,
                            response: error.response?.data,
                            timestamp: new Date().toISOString()
                        });
                    }
                    return Promise.reject(error);
                }
            );

            return instance;
        };

        console.log('Axios patching for /video/list/personal, /media/batch_upload_media, and /media/upload complete');
    }

    // เริ่มต้น
    injectStyles();
    if (checkAuth()) showNotification('Bypass Activated!');
    document.addEventListener('DOMContentLoaded', setupWatermarkButton);
    waitForAxios();
})();
