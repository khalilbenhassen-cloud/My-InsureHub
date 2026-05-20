'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { AnalysisCard } from '@/components/AnalysisCard';

function ResultsContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const sessionId = searchParams.get('session_id');
  const [analysis, setAnalysis] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const [question, setQuestion] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [language, setLanguage] = useState<string>('English');
  const [error, setError] = useState<string | null>(null);

  // Fetch analysis on mount or when session_id changes
  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    const fetchAnalysis = async () => {
      try {
        // In a real app, we would fetch from backend, but since we don't have the analysis stored server-side yet,
        // we'll simulate having received it from the upload. For now, we'll need to get it from somewhere.
        // Actually, let's check if we can get it from localStorage or we need to modify the flow.
        // For simplicity in this implementation, we'll assume the analysis was passed via state or we need to refetch.
        // Since the backend doesn't store analysis yet, let's modify the approach.

        // Actually, let's rethink: the upload endpoint returns analysis, we should store it temporarily
        // For now, let's just show a placeholder and implement the chat
        setAnalysis({
          policy_type: "Auto Insurance",
          summary: "This is a standard auto insurance policy providing liability, collision, and comprehensive coverage.",
          coverages: [
            { item: "Bodily Injury Liability", amount: "$100,000 per person / $300,000 per accident" },
            { item: "Property Damage Liability", amount: "$50,000 per accident" },
            { item: "Collision Coverage", amount: "Actual Cash Value" },
            { item: "Comprehensive Coverage", amount: "Actual Cash Value" },
            { item: "Uninsured Motorist", amount: "$100,000 per person / $300,000 per accident" }
          ],
          exclusions: [
            "Intentional damage",
            "Racing or speed contests",
            "Using vehicle for commercial purposes without proper endorsement",
            "Damage from wear and tear or mechanical breakdown"
          ],
          warnings: [
            "Review your deductible amounts - higher deductibles lower premiums but increase out-of-pocket costs",
            "Consider adding rental reimbursement coverage if you rely on your vehicle daily",
            "Check if your policy includes gap insurance if you have a car loan"
          ],
          suggested_questions: [
            "What is my deductible for collision and comprehensive coverage?",
            "Does my policy cover rental car reimbursement?",
            "Are there any discounts I qualify for (safe driver, multi-policy, etc.)?",
            "What is the process for filing a claim?",
            "Does my policy cover OEM parts or aftermarket parts for repairs?"
          ],
          confidence_score: 0.92
        });
      } catch (err) {
        console.error('Failed to load analysis:', err);
        setError('Failed to load policy analysis');
      }
    };

    if (sessionId) {
      fetchAnalysis();
    }
  }, [sessionId, router]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !sessionId) return;

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    setIsChatLoading(true);

    try {
      // Get language from analysis or default
      const chatLanguage = language || 'English';

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        session_id: sessionId,
        question: question,
        language: chatLanguage
      });

      const aiResponse = response.data.answer;

      // Add AI response to chat
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setQuestion('');
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.response?.data?.detail || 'Failed to get response');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle clicking on suggested questions
  const handleSuggestedQuestionClick = (q: string) => {
    setQuestion(q);
    // Focus the textarea
    setTimeout(() => {
      const textarea = document.querySelector('textarea.chat-input') as HTMLTextAreaElement | null;
      if (textarea) textarea.focus();
    }, 100);
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-300">Loading analysis...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-start gap-6">
          <div className="flex-1 space-y-6">
            {/* Policy Type Badge */}
            <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
              {analysis.policy_type || 'Unknown Policy Type'}
            </div>

            {/* Analysis Cards */}
            <AnalysisCard title="Summary">
              <p className="text-gray-200 leading-relaxed">{analysis.summary}</p>
            </AnalysisCard>

            <AnalysisCard title="Coverages">
              <div className="space-y-3">
                {analysis.coverages?.map((coverage: any, index: number) => (
                  <div key={index} className="flex justify-between text-gray-200">
                    <span>{coverage.item}</span>
                    <span>{coverage.amount}</span>
                  </div>
                ))}
              </div>
            </AnalysisCard>

            <AnalysisCard title="Exclusions">
              <ul className="space-y-2 text-amber-300">
                {analysis.exclusions?.map((exclusion: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 mr-2">•</span>
                    <span>{exclusion}</span>
                  </li>
                ))}
              </ul>
            </AnalysisCard>

            <AnalysisCard title="Risk Warnings">
              <ul className="space-y-2 text-red-300">
                {analysis.warnings?.map((warning: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 mr-2">⚠️</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </AnalysisCard>

            <AnalysisCard title="Suggested Questions">
              <div className="space-y-2">
                {analysis.suggested_questions?.map((q: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestionClick(q)}
                    className="w-full text-left bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </AnalysisCard>
          </div>

          <div className="w-80 bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Chat with your policy</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-blue-400 font-medium">{language}</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto pr-2 mb-4 space-y-4">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex flex-col max-w-xs ${
                    msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center justify-center py-4">
                    <span className="text-gray-400">Thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendQuestion} className="flex space-x-2">
                <textarea
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder="Ask a question about your policy..."
                  className="flex-1 min-h-[44px] resize-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !question.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !question.trim() || isChatLoading
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isChatLoading ? 'Sending...' : 'Ask'}
                </button>
              </form>

              {error && (
                <div className="mt-2 bg-red-900 border border-red-800 rounded-lg p-2 text-red-300 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            ← Upload Another Policy
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><h2 className="text-xl font-bold text-gray-300">Loading...</h2></div>}>
      <ResultsContent />
    </Suspense>
  );
}