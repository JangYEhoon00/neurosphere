import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Play, Square, MessageCircle } from 'lucide-react';

interface VoiceChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPrompt?: string;
}

interface Message {
    role: 'user' | 'ai' | 'system';
    content: string;
    type?: 'error' | 'success' | 'info';
}

export const VoiceChatModal = ({ isOpen, onClose, initialPrompt }: VoiceChatModalProps) => {
    const apiKey = import.meta.env.VITE_GPT_API_KEY || '';
    const [model, setModel] = useState('gpt-4o');
    const [voice, setVoice] = useState('alloy');
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState(apiKey ? '준비 완료' : 'API 키가 설정되지 않았습니다');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: apiKey ? '안녕하세요! 무엇을 도와드릴까요?' : 'GPT API 키가 설정되지 않았습니다. .env 파일에 VITE_GPT_API_KEY를 추가해주세요.' }
    ]);

    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && initialPrompt) {
            // Optional: Auto-start or set context based on node
        }
    }, [isOpen, initialPrompt]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = 'ko-KR';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                console.log('🎤 음성 인식 시작');
                setStatus('듣고 있습니다...');
                setIsListening(true);
            };

            recognition.onresult = (e: any) => {
                const text = e.results[0][0].transcript;
                console.log('👤 인식:', text);
                addMessage('user', text);
                callGPT(text);
            };

            recognition.onerror = (e: any) => {
                console.error('❌ 음성 오류:', e.error);
                setStatus('오류: ' + e.error);
                stopVoice();
            };

            recognition.onend = () => {
                if (isListening) {
                    // If we want continuous listening, we might restart here, 
                    // but for this implementation we stop after one turn or let user toggle.
                    // For now, let's stop to match the reference logic which seems to be toggle-based.
                    setIsListening(false);
                }
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const addMessage = (role: Message['role'], content: string, type?: Message['type']) => {
        setMessages(prev => [...prev, { role, content, type }]);
    };

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            alert('Chrome 브라우저를 사용해주세요.');
            return;
        }
        if (!apiKey) {
            alert('API Key가 필요합니다.');
            return;
        }

        // Stop current audio if playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (isListening) {
            stopVoice();
        } else {
            startVoice();
        }
    };

    const startVoice = () => {
        setIsListening(true);
        recognitionRef.current.start();
    };

    const stopVoice = () => {
        setIsListening(false);
        setStatus('준비 완료');
        recognitionRef.current.stop();
    };

    const testAPI = async () => {
        if (!apiKey) {
            alert('OpenAI API Key를 입력하세요.');
            return;
        }

        setStatus('🧪 테스트 중...');
        try {
            await speakText("안녕하세요. 목소리가 잘 들리시나요?");
            addMessage('system', '✅ 음성 재생 성공!', 'success');
        } catch (err: any) {
            addMessage('system', '❌ 오류: ' + err.message, 'error');
        }
    };

    const callGPT = async (userMsg: string) => {
        setStatus('🤖 생각하는 중...');

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "당신은 친절하고 자연스러운 한국어를 구사하는 친구입니다. 답변은 1~2문장으로 짧게 하세요." },
                        { role: "user", content: userMsg }
                    ],
                    max_tokens: 300
                })
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error.message);

            const aiText = data.choices[0].message.content;
            addMessage('ai', aiText);

            await speakText(aiText);

        } catch (err: any) {
            console.error(err);
            addMessage('system', '오류: ' + err.message, 'error');
            setStatus('오류 발생');
        }
    };

    const speakText = async (text: string) => {
        setStatus('🔊 음성 생성 중...');

        try {
            const res = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "tts-1",
                    input: text,
                    voice: voice,
                    speed: 1.0
                })
            });

            if (!res.ok) throw new Error('음성 생성 실패');

            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            setStatus('🗣️ 말하는 중...');

            audio.onended = () => {
                setStatus('준비 완료');
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();

        } catch (err) {
            console.error('TTS Error:', err);
            setStatus('음성 오류');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        AI 음성 대화
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Config Section */}
                <div className="p-4 bg-slate-50 border-b space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">GPT 모델</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="gpt-4o">GPT-4o (최신, 빠름)</option>
                                <option value="gpt-4o-mini">GPT-4o Mini (매우 빠름)</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">AI 목소리</label>
                        <select
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="alloy">Alloy (중성적, 깔끔함)</option>
                            <option value="echo">Echo (남성, 차분함)</option>
                            <option value="fable">Fable (남성, 영국 억양)</option>
                            <option value="onyx">Onyx (남성, 깊은 목소리)</option>
                            <option value="nova">Nova (여성, 활기참)</option>
                            <option value="shimmer">Shimmer (여성, 차분함)</option>
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={testAPI}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4" /> API & 음성 테스트
                        </button>
                        <button
                            onClick={toggleVoice}
                            className={`flex-1 py-2 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${isListening
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {isListening ? <><Square className="w-4 h-4" /> 대화 중지</> : <><Mic className="w-4 h-4" /> 음성 대화 시작</>}
                        </button>
                    </div>

                    <div className="text-center text-xs font-bold text-indigo-600 bg-indigo-50 py-1 rounded">
                        상태: {status}
                    </div>
                </div>

                {/* Chat Area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100"
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : msg.type === 'error'
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : msg.type === 'success'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-white text-slate-800 shadow-sm rounded-bl-none'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 border-t">
                    OpenAI TTS API를 사용하여 비용이 발생할 수 있습니다.
                </div>
            </div>
        </div>
    );
};
