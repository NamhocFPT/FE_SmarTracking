import { useState, useEffect, useRef } from 'react';

/**
 * useFaceGuidance — phân tích khung hình webcam thật (client-side, không gọi BE) để hướng dẫn
 * người dùng căn khuôn mặt khi đăng ký sinh trắc học (FaceRegistration/BiometricReminderModal).
 *
 * Dùng MediaPipe Face Detector (@mediapipe/tasks-vision) chạy hoàn toàn trong trình duyệt —
 * đúng ranh giới trách nhiệm đã xác nhận với BE (BE không được làm face-detection, xem
 * capstone-be/docs/BE_PLAN_Realtime_Biometric_Guidance_Alignment.md).
 *
 * @param {object} params
 * @param {React.RefObject<HTMLVideoElement>} params.videoRef - ref tới thẻ <video> đang phát webcam
 * @param {boolean} params.active - true để bắt đầu phân tích, false để dừng (vd khi rời màn hình quét)
 * @param {function} [params.onStable] - callback gọi 1 lần khi trạng thái 'perfect' giữ ổn định đủ số frame yêu cầu
 * @param {number} [params.stableFramesRequired] - số frame liên tiếp ở trạng thái 'perfect' trước khi coi là ổn định (mặc định 8, ~1.2s ở 150ms/frame)
 * @param {number} [params.intervalMs] - khoảng cách giữa 2 lần phân tích (mặc định 150ms)
 *
 * @returns {{ guidance: { state: string, direction: string|null, brightness: number|null }, modelError: string|null }}
 * `state` là một trong: 'loading' | 'no_face' | 'low_light' | 'too_far' | 'too_close' | 'off_center' | 'perfect'.
 * `direction` chỉ có giá trị khi `state === 'off_center'`: 'left' | 'right' | 'up' | 'down' — đã quy đổi đúng theo
 * chiều người dùng NHÌN THẤY trên khung hình đã mirror (CSS scale-x-[-1]), không phải toạ độ thô của camera.
 */
const MEDIAPIPE_VERSION = '1.0.0';
const WASM_FILESET_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_ASSET_URL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

const TOO_FAR_RATIO = 0.22;
const TOO_CLOSE_RATIO = 0.55;
const OFF_CENTER_THRESHOLD = 0.15;
const DARK_THRESHOLD = 60; // luminance 0-255, dưới ngưỡng này coi là thiếu sáng

let detectorPromise = null;
const getFaceDetector = async () => {
    if (!detectorPromise) {
        detectorPromise = (async () => {
            const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
            const vision = await FilesetResolver.forVisionTasks(WASM_FILESET_URL);
            return FaceDetector.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: MODEL_ASSET_URL,
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO'
            });
        })();
    }
    return detectorPromise;
};

const useFaceGuidance = ({ videoRef, active, onStable, stableFramesRequired = 8, intervalMs = 150 }) => {
    const [guidance, setGuidance] = useState({ state: 'loading', direction: null, brightness: null });
    const [modelError, setModelError] = useState(null);

    const stableCountRef = useRef(0);
    const rafRef = useRef(null);
    const lastRunRef = useRef(0);
    const detectorRef = useRef(null);
    const stoppedRef = useRef(true);
    const onStableRef = useRef(onStable);
    onStableRef.current = onStable;

    useEffect(() => {
        if (!active) {
            stoppedRef.current = true;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            stableCountRef.current = 0;
            setGuidance({ state: 'loading', direction: null, brightness: null });
            return;
        }

        stoppedRef.current = false;
        setModelError(null);
        stableCountRef.current = 0;

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 48;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const loop = async (timestamp) => {
            if (stoppedRef.current) return;

            if (!detectorRef.current) {
                try {
                    detectorRef.current = await getFaceDetector();
                } catch (err) {
                    if (!stoppedRef.current) {
                        setModelError('Không thể tải mô hình nhận diện khuôn mặt. Vui lòng kiểm tra kết nối mạng và tải lại trang.');
                    }
                    return;
                }
            }

            if (stoppedRef.current) return;

            const video = videoRef.current;
            if (video && video.readyState >= 2 && timestamp - lastRunRef.current >= intervalMs) {
                lastRunRef.current = timestamp;
                try {
                    // Ước lượng độ sáng trung bình khung hình (luminance) — không cần thư viện riêng
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    let total = 0;
                    for (let i = 0; i < frame.length; i += 4) {
                        total += 0.299 * frame[i] + 0.587 * frame[i + 1] + 0.114 * frame[i + 2];
                    }
                    const brightness = total / (frame.length / 4);

                    const result = detectorRef.current.detectForVideo(video, timestamp);
                    const detection = result?.detections?.[0];

                    let next;
                    if (brightness < DARK_THRESHOLD) {
                        next = { state: 'low_light', direction: null, brightness };
                    } else if (!detection) {
                        next = { state: 'no_face', direction: null, brightness };
                    } else {
                        const box = detection.boundingBox;
                        const ratio = box.width / video.videoWidth;
                        const centerX = box.originX + box.width / 2;
                        const centerY = box.originY + box.height / 2;
                        const offsetX = (centerX - video.videoWidth / 2) / video.videoWidth;
                        const offsetY = (centerY - video.videoHeight / 2) / video.videoHeight;

                        if (ratio < TOO_FAR_RATIO) {
                            next = { state: 'too_far', direction: null, brightness };
                        } else if (ratio > TOO_CLOSE_RATIO) {
                            next = { state: 'too_close', direction: null, brightness };
                        } else if (Math.abs(offsetX) > OFF_CENTER_THRESHOLD || Math.abs(offsetY) > OFF_CENTER_THRESHOLD) {
                            // video đang hiển thị mirror (CSS scale-x-[-1]) — offsetX tính trên toạ độ THÔ của
                            // camera (chưa mirror), nên phải đảo chiều trái/phải để khớp với những gì người
                            // dùng thực sự NHÌN THẤY trên màn hình đã mirror (giống soi gương thật).
                            let direction;
                            if (Math.abs(offsetX) >= Math.abs(offsetY)) {
                                direction = offsetX > 0 ? 'right' : 'left';
                            } else {
                                direction = offsetY > 0 ? 'up' : 'down';
                            }
                            next = { state: 'off_center', direction, brightness };
                        } else {
                            next = { state: 'perfect', direction: null, brightness };
                        }
                    }

                    if (next.state === 'perfect') {
                        stableCountRef.current += 1;
                        if (stableCountRef.current === stableFramesRequired) {
                            onStableRef.current?.();
                        }
                    } else {
                        stableCountRef.current = 0;
                    }

                    setGuidance(next);
                } catch (err) {
                    // Bỏ qua lỗi phân tích 1 frame lẻ tẻ, không dừng cả vòng lặp
                }
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            stoppedRef.current = true;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, intervalMs, stableFramesRequired]);

    return { guidance, modelError };
};

export default useFaceGuidance;
