import { useState, useEffect, useRef, useCallback } from 'react';
import { getBackgroundJobStatus } from '../service/businessAdminServices';

/**
 * usePollJob — Hook poll trạng thái background job
 * Dùng chung cho M6 (Export biên bản) và M11 (Export báo cáo)
 *
 * @param {string|null} jobId - ID job cần poll (null = không poll)
 * @param {object} options
 * @param {number} options.intervalMs - Khoảng thời gian poll (ms), mặc định 2000
 * @param {number} options.maxAttempts - Số lần poll tối đa, mặc định 60 (~2 phút)
 * @param {function} options.onCompleted - Callback khi job hoàn thành: (jobData) => void
 * @param {function} options.onFailed - Callback khi job thất bại: (error) => void
 *
 * @returns {{ status, progress, result, isPolling, error }}
 */
const usePollJob = (jobId, { intervalMs = 2000, maxAttempts = 60, onCompleted, onFailed } = {}) => {
    const [status, setStatus] = useState(null);       // 'queued' | 'running' | 'completed' | 'failed'
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState(null);

    const attemptsRef = useRef(0);
    const timerRef = useRef(null);

    const stopPolling = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPolling(false);
    }, []);

    const poll = useCallback(async () => {
        if (!jobId) return;
        attemptsRef.current += 1;

        if (attemptsRef.current > maxAttempts) {
            stopPolling();
            const timeoutErr = 'Quá thời gian chờ. Vui lòng kiểm tra lại sau.';
            setError(timeoutErr);
            onFailed?.(timeoutErr);
            return;
        }

        try {
            const res = await getBackgroundJobStatus(jobId);
            if (!res?.success) return;

            const job = res.data;
            setStatus(job.status);
            setProgress(job.progress ?? 0);

            if (job.status === 'completed') {
                setResult(job.result);
                stopPolling();
                onCompleted?.(job);
            } else if (job.status === 'failed') {
                stopPolling();
                const failErr = job.error || 'Xuất file thất bại.';
                setError(failErr);
                onFailed?.(failErr);
            }
        } catch (e) {
            // Network error — tiếp tục poll, không dừng
            console.warn('[usePollJob] Poll error:', e.message);
        }
    }, [jobId, maxAttempts, stopPolling, onCompleted, onFailed]);

    useEffect(() => {
        if (!jobId) {
            stopPolling();
            setStatus(null);
            setProgress(0);
            setResult(null);
            setError(null);
            attemptsRef.current = 0;
            return;
        }

        setIsPolling(true);
        setError(null);
        attemptsRef.current = 0;

        poll(); // lần đầu gọi ngay
        timerRef.current = setInterval(poll, intervalMs);

        return () => stopPolling();
    }, [jobId, intervalMs, poll, stopPolling]);

    return { status, progress, result, isPolling, error };
};

export default usePollJob;
