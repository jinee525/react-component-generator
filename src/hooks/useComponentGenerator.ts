import { useState, useCallback, useEffect } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { saveComponentHistory, loadComponentHistory, clearComponentHistory } from '../utils/componentStorage';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  streamingCode: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingCode, setStreamingCode] = useState<string | null>(null);

  useEffect(() => {
    const history = loadComponentHistory();
    setComponents(history);
  }, []);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);
    setStreamingCode('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate component');
      }

      const contentType = res.headers.get('content-type') || '';
      const isStreaming = contentType.includes('text/event-stream');

      if (isStreaming) {
        // Anthropic 스트리밍 경로
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let fullCode = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines[lines.length - 1];

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith(':')) continue;
            if (!line.startsWith('data: ')) continue;

            const data = JSON.parse(line.slice(6));
            if (data.error) {
              throw new Error(data.error);
            }
            if (data.done && data.code) {
              fullCode = data.code;
              setStreamingCode(fullCode);
            } else if (data.chunk) {
              fullCode += data.chunk;
              setStreamingCode(fullCode);
            }
          }
        }

        if (!fullCode) {
          throw new Error('No code received');
        }

        const newComponent: GeneratedComponent = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          prompt,
          code: fullCode,
          createdAt: new Date(),
        };

        saveComponentHistory(newComponent);
        setComponents((prev) => [newComponent, ...prev]);
        setStreamingCode(null);
      } else {
        // Google 일반 응답 경로
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.code) {
          throw new Error('No code received');
        }

        const newComponent: GeneratedComponent = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          prompt,
          code: data.code,
          createdAt: new Date(),
        };

        saveComponentHistory(newComponent);
        setComponents((prev) => [newComponent, ...prev]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStreamingCode(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem('componentHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    clearComponentHistory();
    setComponents([]);
  }, []);

  return { components, isLoading, error, streamingCode, generate, removeComponent, clearAll };
}
