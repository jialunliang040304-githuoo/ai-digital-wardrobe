/**
 * 模型加载诊断组件
 */

import React, { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

interface ModelDiagnosticsProps {
  modelUrl: string;
}

const ModelDiagnostics: React.FC<ModelDiagnosticsProps> = ({ modelUrl }) => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testModel = async () => {
      console.log(`🔍 诊断模型: ${modelUrl}`);
      
      try {
        // 测试HEAD请求
        const headResponse = await fetch(modelUrl, { method: 'HEAD' });
        console.log('📋 HEAD响应:', {
          status: headResponse.status,
          ok: headResponse.ok,
          contentType: headResponse.headers.get('content-type'),
          contentLength: headResponse.headers.get('content-length'),
          cors: headResponse.headers.get('access-control-allow-origin')
        });

        // 测试实际加载
        const startTime = performance.now();
        const response = await fetch(modelUrl);
        const blob = await response.blob();
        const endTime = performance.now();
        
        console.log('📦 实际下载:', {
          size: blob.size,
          type: blob.type,
          loadTime: `${(endTime - startTime).toFixed(2)}ms`
        });

        setDiagnostics({
          head: {
            status: headResponse.status,
            contentType: headResponse.headers.get('content-type'),
            contentLength: headResponse.headers.get('content-length'),
            cors: headResponse.headers.get('access-control-allow-origin')
          },
          download: {
            size: blob.size,
            type: blob.type,
            loadTime: `${(endTime - startTime).toFixed(2)}ms`
          }
        });

      } catch (err) {
        console.error('❌ 诊断失败:', err);
        setError(err instanceof Error ? err.message : '诊断失败');
      }
    };

    testModel();
  }, [modelUrl]);

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔍 模型诊断</div>
      {error ? (
        <div style={{ color: '#ff6b6b' }}>❌ {error}</div>
      ) : (
        <div>
          <div><strong>URL:</strong> {modelUrl}</div>
          {diagnostics.head && (
            <>
              <div><strong>状态:</strong> {diagnostics.head.status}</div>
              <div><strong>Content-Type:</strong> {diagnostics.head.contentType}</div>
              <div><strong>大小:</strong> {diagnostics.head.contentLength} bytes</div>
              <div><strong>CORS:</strong> {diagnostics.head.cors || '未设置'}</div>
            </>
          )}
          {diagnostics.download && (
            <>
              <div><strong>下载大小:</strong> {diagnostics.download.size} bytes</div>
              <div><strong>类型:</strong> {diagnostics.download.type}</div>
              <div><strong>加载时间:</strong> {diagnostics.download.loadTime}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelDiagnostics;