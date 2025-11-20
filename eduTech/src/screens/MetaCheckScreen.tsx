import React, { useState, useRef, useEffect } from 'react';
import { X, Brain, Loader2, Zap, Mic, Square } from 'lucide-react';
import { ScreenState, MetaResult, Node } from '../utils/types';
import { cleanMarkdown } from '../utils/markdownUtils';

interface MetaCheckScreenProps {
  setScreen: (screen: ScreenState) => void;
  metaResult: MetaResult | null;
  selectedNode: Node | null;
  userExplanation: string;
  setUserExplanation: (text: string) => void;
  submitMetaCheck: () => void;
  isLoading: boolean;
}

export const MetaCheckScreen = ({ setScreen, metaResult, selectedNode, userExplanation, setUserExplanation, submitMetaCheck, isLoading }: MetaCheckScreenProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true; // Keep listening until stopped
      recognition.interimResults = true; // Show interim results

      recognition.onstart = () => {
        console.log('🎤 음성 인식 시작');
        setRecordingStatus('듣고 있습니다...');
        setIsRecording(true);
      };

      recognition.onresult = (e: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setUserExplanation(userExplanation + finalTranscript);
        }

        if (interimTranscript) {
          setRecordingStatus(`인식 중: ${interimTranscript}`);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('❌ 음성 오류:', e.error);
        
        let errorMessage = '';
        switch(e.error) {
          case 'not-allowed':
            errorMessage = '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
            alert('🎤 마이크 권한 필요\n\n브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 마이크 권한을 허용해주세요.');
            break;
          case 'no-speech':
            errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
            break;
          case 'audio-capture':
            errorMessage = '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
            break;
          case 'network':
            errorMessage = '네트워크 오류가 발생했습니다.';
            break;
          default:
            errorMessage = `오류: ${e.error}`;
        }
        
        setRecordingStatus(errorMessage);
        stopRecording();
      };

      recognition.onend = () => {
        if (isRecording) {
          setRecordingStatus('');
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [userExplanation]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Chrome 브라우저를 사용해주세요.');
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingStatus('');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)] animate-subtle-fade" />

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl p-8 relative z-10 animate-smooth-appear">
        <button onClick={() => setScreen('graph')} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>

        {!metaResult ? (
          <>
            <div className="mb-6">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Metacognition Check</span>
              <h2 className="text-3xl font-bold text-white mt-2">설명할 수 있어야<br />진짜 아는 것입니다.</h2>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl mb-6">
              <p className="text-indigo-200 text-sm font-medium">
                Target Concept: <span className="text-white font-bold underline decoration-indigo-500 underline-offset-4">{selectedNode?.label}</span>
              </p>
            </div>

            <div className="relative mb-6">
              <textarea
                value={userExplanation}
                onChange={(e) => setUserExplanation(e.target.value)}
                placeholder="이 개념을 5살 아이에게 설명한다고 생각하고 적거나 말해보세요. 솔직하게 모르면 '모름'이라고 하세요."
                className="w-full h-48 bg-black/40 border border-slate-600 rounded-xl p-5 text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none text-lg leading-relaxed transition-colors"
              />

              {/* Voice Recording Button */}
              <button
                onClick={toggleRecording}
                className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 flex items-center justify-center ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                  }`}
                title={isRecording ? '녹음 중지' : '음성으로 말하기'}
              >
                {isRecording ? <Square className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
            </div>

            {/* Recording Status */}
            {recordingStatus && (
              <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                <p className="text-emerald-300 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  {recordingStatus}
                </p>
              </div>
            )}

            <button
              onClick={submitMetaCheck}
              disabled={isLoading || !userExplanation}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-500/40"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Brain className="w-5 h-5" />}
              {isLoading ? "AI 선생님이 채점 중..." : "평가 받기"}
            </button>
          </>
        ) : (
          <div className="animate-smooth-appear">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="60" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                  <circle cx="64" cy="64" r="60" fill="transparent" stroke={metaResult.score > 80 ? '#10b981' : metaResult.score > 50 ? '#f59e0b' : '#f43f5e'} strokeWidth="8" strokeDasharray={377} strokeDashoffset={377 - (377 * metaResult.score) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{metaResult.score}</span>
                  <span className="text-xs text-slate-400 uppercase">Score</span>
                </div>
              </div>
              <div className="mt-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${metaResult.status === 'known' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : metaResult.status === 'fuzzy' ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30' : 'bg-rose-900/50 text-rose-400 border border-rose-500/30'}`}>
                  Status: {metaResult.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                <h4 className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Brain className="w-4 h-4" /> Feedback</h4>
                <p className="text-slate-200 leading-relaxed text-sm">{cleanMarkdown(metaResult.feedback)}</p>
              </div>
              <div className="bg-indigo-900/20 p-5 rounded-2xl border border-indigo-500/20">
                <h4 className="text-indigo-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Next Step</h4>
                <p className="text-indigo-100 text-sm">{cleanMarkdown(metaResult.nextStep)}</p>
              </div>
            </div>

            <button onClick={() => setScreen('graph')} className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors duration-300">
              그래프에 반영하고 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
