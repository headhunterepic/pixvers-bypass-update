// ==UserScript==
// @name        pixverse nsfw video bypass
// @match       https://app.pixverse.ai/*
// @run-at      document-start
// @version     3.4
// @author      pixvers creator + + 
// ==/UserScript==

(function () {
    'use strict';

    // คีย์ที่ถูกเข้ารหัสแบบ base64 และเลื่อนตัวอักษร (X7K9P2 -> obfuscated)
    const ENCODED_KEY = 'Y8L0Q3'; // ผลจากการเข้ารหัส X7K9P2 (เลื่อน +1 แล้ว base64)
    let lastKeyValidation = null;
    let savedImagePath = null;

    // ฟังก์ชันถอดรหัสคีย์
    function decodeKey(encoded) {
        const base64Decoded = atob(encoded.replace(/[0-9]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 1)));
        return base64Decoded.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 1)).join('');
    }

    // ฟังก์ชันแจ้งเตือนแบบกำหนดเอง
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border-radius: 5px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // ฟังก์ชันตรวจสอบคีย์
    function validateKey() {
        const now = Date.now();
        if (lastKeyValidation && (now - lastKeyValidation < 3600000)) { // 1 ชม = 3600000 ms
            return true;
        }

        const userKey = prompt('กรุณาใส่คีย์เพื่อใช้งานบายพาส (ติดต่อผู้สร้างสคริปต์เพื่อรับคีย์):');
        const decodedKey = decodeKey(ENCODED_KEY);
        if (userKey === decodedKey) { // เปรียบเทียบกับคีย์จริง (X7K9P2)
            lastKeyValidation = now;
            showNotification('บายพาสเริ่มทำงานแล้ว!');
            return true;
        } else {
            alert('คีย์ไม่ถูกต้อง! บายพาสจะไม่ทำงาน');
            return false;
        }
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

                newButton.onclick = function (event) {
                    event.stopPropagation();
                    if (!validateKey()) return;

                    showNotification('กำลังดำเนินการบายพาสวอเตอร์มาร์ก...');
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
                        alert('ไม่พบวิดีโอสำหรับดาวน์โหลด กรุณาตรวจสอบว่ามีวิดีโอโหลดอยู่');
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
        showNotification('บายพาสข้อมูลวิดีโอกำลังทำงาน...');

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
        showNotification('บายพาสการอัพโหลดแบบกลุ่มทำงาน...');
        return modifyBatchUploadDataLogic(data);
    }

    function modifySingleUploadData(data) {
        if (!validateKey()) return data;
        showNotification('บายพาสการอัพโหลดเดี่ยวทำงาน...');
        return modifySingleUploadDataLogic(data);
    }

    // แยก logic ออกมาเพื่อความกระชับ
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
