/**
 * 视频捕捉3D建模组件
 * 
 * 引导用户围绕物体拍摄视频
 * 用于生成高斯泼溅3D模型
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Video, Camera, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react';

interface VideoCapture3DProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoCapture: (videoBlob: Blob) => void;
  captureType: 'body' | 'clothing';
}

type CaptureStep = 'intro' | 'recording' | 'preview' | 'uploading';

const VideoCapture3D: React.FC<VideoCapture3DProps> = ({
  isOpen,
  onClose,
  onVideoCapture,
  captureType
}) => {
  const [step, setStep] = useState<CaptureStep>('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [rotationProgress, setRotationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化摄像头
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: captureType === 'body' ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('无法访问摄像头，请检查权限设置');
      console.error('Camera error:', err);
    }
  }, [captureType]);

  // 开始录制
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setStep('preview');
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);
    setRotationProgress(0);

    // 计时器
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        // 模拟旋转进度 (假设15秒完成一圈)
        setRotationProgress(Math.min(100, (newTime / 15) * 100));
        return newTime;
      });
    }, 1000);
  }, []);

  // 停止录制
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  // 重新录制
  const retake = useCallback(() => {
    setRecordedBlob(null);
    setStep('recording');
    setRecordingTime(0);
    setRotationProgress(0);
  }, []);

  // 确认使用
  const confirmVideo = useCallback(() => {
    if (recordedBlob) {
      setStep('uploading');
      onVideoCapture(recordedBlob);
    }
  }, [recordedBlob, onVideoCapture]);

  // 清理
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 打开时初始化
  useEffect(() => {
    if (isOpen && step === 'recording') {
      initCamera();
    }
  }, [isOpen, step, initCamera]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"
      >
        <X size={24} />
      </button>

      {/* 介绍步骤 */}
      {step === 'intro' && (
        <div className="h-full flex flex-col items-center justify-center p-6 text-white">
          <div className="text-6xl mb-6">🎥</div>
          <h2 className="text-2xl font-bold mb-4">
            {captureType === 'body' ? '人体3D扫描' : '服装3D扫描'}
          </h2>
          <p className="text-gray-300 text-center mb-8 max-w-md">
            {captureType === 'body' 
              ? '请让朋友帮你拍摄，围绕你转一圈，保持15-20秒'
              : '将服装平放或挂起，围绕它拍摄一圈，保持15-20秒'
            }
          </p>

          <div className="bg-white/10 rounded-2xl p-6 mb-8 max-w-sm">
            <h3 className="font-semibold mb-4">📋 拍摄技巧</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>保持稳定，缓慢移动</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>确保光线充足均匀</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>完整拍摄360度</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>避免遮挡和反光</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              setStep('recording');
              initCamera();
            }}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold text-lg transition-colors"
          >
            开始拍摄
          </button>
        </div>
      )}

      {/* 录制步骤 */}
      {step === 'recording' && (
        <div className="h-full flex flex-col">
          {/* 视频预览 */}
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* 录制指示器 */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-medium">{formatTime(recordingTime)}</span>
              </div>
            )}

            {/* 旋转进度指示器 */}
            {isRecording && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="#22c55e"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${rotationProgress * 2.26} 226`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                    {Math.round(rotationProgress)}%
                  </div>
                </div>
              </div>
            )}

            {/* 引导文字 */}
            <div className="absolute bottom-24 left-0 right-0 text-center">
              <p className="text-white text-lg font-medium bg-black/50 inline-block px-4 py-2 rounded-full">
                {isRecording 
                  ? '缓慢围绕目标旋转...' 
                  : '点击下方按钮开始录制'
                }
              </p>
            </div>
          </div>

          {/* 控制栏 */}
          <div className="bg-black p-6 flex justify-center items-center gap-8">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Video size={32} className="text-white" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-red-500 rounded-sm"></div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 预览步骤 */}
      {step === 'preview' && recordedBlob && (
        <div className="h-full flex flex-col">
          <div className="flex-1 relative">
            <video
              src={URL.createObjectURL(recordedBlob)}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain bg-black"
            />
          </div>

          <div className="bg-black p-6 flex justify-center items-center gap-4">
            <button
              onClick={retake}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white font-medium flex items-center gap-2"
            >
              <RotateCcw size={18} />
              重新拍摄
            </button>
            <button
              onClick={confirmVideo}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-medium flex items-center gap-2"
            >
              <Check size={18} />
              使用此视频
            </button>
          </div>
        </div>
      )}

      {/* 上传步骤 */}
      {step === 'uploading' && (
        <div className="h-full flex flex-col items-center justify-center p-6 text-white">
          <Loader2 size={48} className="animate-spin mb-6 text-blue-400" />
          <h2 className="text-xl font-bold mb-2">正在生成3D模型</h2>
          <p className="text-gray-400 text-center">
            使用高斯泼溅技术处理中...
            <br />
            这可能需要几分钟时间
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="absolute bottom-20 left-4 right-4 bg-red-500/90 text-white p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCapture3D;
