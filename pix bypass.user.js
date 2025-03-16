// ==UserScript==
// @name        pixverse nsfw video bypass
// @match       https://app.pixverse.ai/*
// @run-at      document-start
// @version     3.6
// @author      pixvers creator + +
// ==/UserScript==

(function () {
    'use strict';

    const HIDDEN_KEY = ['P', '4', 'X', '8', 'J', '1'].join('');
    let savedImagePath = null;
    let hasShownInitialNotification = false;

    function showNotification(message, callback) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
            color: white;
            border-radius: 8px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.style.opacity = '1', 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
                if (callback) callback();
            }, 300);
        }, 3000); // Each notification lasts 3 seconds
    }

    function showInitialNotification() {
        if (hasShownInitialNotification) return;

        showNotification('We do not support distribution for commercial use, the use of real individuals\' images, or any illegal activities.', () => {
            showNotification('Bypass is active!');
            hasShownInitialNotification = true; // Mark as shown so it doesn’t repeat
        });
    }

    function validateKey() {
        const isKeyValidated = localStorage.getItem('isKeyValidated');

        if (isKeyValidated === 'true') {
            showInitialNotification(); // Show only once on page load if validated
            return true;
        }

        const loginOverlay = document.createElement('div');
        loginOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const loginBox = document.createElement('div');
        loginBox.style.cssText = `
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            width: 320px;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Please enter the key';
        title.style.cssText = `
            margin: 0 0 20px;
            font-size: 24px;
            color: #333;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter 6-character key';
        input.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
            box-sizing: border-box;
        `;

        const button = document.createElement('button');
        button.textContent = 'Confirm';
        button.style.cssText = `
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        `;
        button.onmouseover = () => button.style.transform = 'scale(1.05)';
        button.onmouseout = () => button.style.transform = 'scale(1)';

        button.onclick = () => {
            const userKey = input.value.trim();
            console.log('[Debug] User entered key:', userKey);
            console.log('[Debug] Expected key:', HIDDEN_KEY);

            if (userKey === HIDDEN_KEY) {
                localStorage.setItem('isKeyValidated', 'true');
                document.body.removeChild(loginOverlay);
                showInitialNotification(); // Show only once when key is validated
                console.log('[Debug] Key validated successfully');
            } else {
                input.style.borderColor = '#ff6b6b';
                input.placeholder = 'Invalid key!';
                input.value = '';
                console.log('[Debug] Key validation failed');
            }
        };

        loginBox.appendChild(title);
        loginBox.appendChild(input);
        loginBox.appendChild(button);
        loginOverlay.appendChild(loginBox);
        document.body.appendChild(loginOverlay);

        return false;
    }

    function setupWatermarkButton() {
        function findAndReplaceButton() {
            let watermarkDiv = Array.from(document.getElementsByTagName('div')).find(
                el => el.textContent.trim() === 'Watermark-free'
            );

            if (watermarkDiv) {
                const newButton = document.createElement('button');
                newButton.textContent = 'Watermark-free';
                newButton.style.cssText = `
                    ${window.getComputedStyle(watermarkDiv).cssText}
                    background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: transform 0.2s;
                `;
                newButton.onmouseover = () => newButton.style.transform = 'scale(1.05)';
                newButton.onmouseout = () => newButton.style.transform = 'scale(1)';

                newButton.onclick = async function (event) {
                    event.stopPropagation();
                    if (!validateKey()) return;
                    // No notification here; only shown once initially

                    console.log('[Watermark-free] Button clicked!');
                    const videoElement = document.querySelector(".component-video > video");
                    if (videoElement && videoElement.src) {
                        const videoUrl = videoElement.src;
                        console.log('[Watermark-free] Video URL:', videoUrl);

                        try {
                            const response = await fetch(videoUrl);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = videoUrl.split('/').pop() || 'video.mp4';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                            console.log('[Watermark-free] Download triggered for:', videoUrl);
                        } catch (error) {
                            console.error('[Watermark-free] Download failed:', error);
                            alert('Failed to download video');
                        }
                    } else {
                        console.error('[Watermark-free] Video element not found or no src attribute');
                        alert('No video found for download. Please ensure a video is loaded.');
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
        if (!validateKey()) return data;
        // No notification here; only shown once initially

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
        if (!validateKey()) return data;
        // No notification here; only shown once initially
        return modifyBatchUploadDataLogic(data);
    }

    function modifySingleUploadData(data) {
        if (!validateKey()) return data;
        // No notification here; only shown once initially
        return modifySingleUploadDataLogic(data);
    }

    function modifyBatchUploadDataLogic(data) {
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
            return data;
        } catch (error) {
            console.error('[Debug] Error in modifyBatchUploadData:', error);
            return data;
        }
    }

    function modifySingleUploadDataLogic(data) {
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

    document.addEventListener('DOMContentLoaded', setupWatermarkButton);

    waitForAxios();
})();
