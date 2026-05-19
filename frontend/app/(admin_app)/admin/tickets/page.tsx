'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TicketData {
  id: int;
  user_id: int;
  category: string;
  subject: string;
  message: string;
  admin_response?: string;
  status: string;
  created_at: string;
}

export default function AdminTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) return;
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets`);
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (ticketId: number) => {
    if (!replyText.trim()) return;
    try {
      setIsSending(true);
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${ticketId}/reply`, {
        message: replyText
      });
      setReplyText('');
      setExpandedTicketId(null);
      fetchTickets();
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  if (!user?.is_admin) return null;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Ticket className="h-8 w-8 text-indigo-600" /> Support Inbox
        </h1>
        <p className="text-gray-500 mt-1">Review and resolve issues submitted by users.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">All Tickets</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white text-gray-600 rounded-lg text-sm font-medium border border-gray-200">
              {tickets.filter(t => t.status === 'Open').length} Open
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No support tickets found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map(ticket => (
              <div key={ticket.id} className={`p-6 transition-colors ${ticket.status === 'Resolved' ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        ticket.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                        User ID: {ticket.user_id}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(ticket.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">[{ticket.category}] {ticket.subject}</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      {ticket.message}
                    </p>
                    
                    {ticket.status === 'Resolved' && ticket.admin_response && (
                      <div className="mt-4 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Admin Response</p>
                        <p className="text-indigo-900 text-sm whitespace-pre-wrap">{ticket.admin_response}</p>
                      </div>
                    )}
                    
                    {expandedTicketId === ticket.id && ticket.status === 'Open' && (
                      <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                        <textarea
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your professional response here. It will be emailed directly to the user..."
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setExpandedTicketId(null); setReplyText(''); }}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleReply(ticket.id)}
                            disabled={isSending || !replyText.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {isSending ? (
                              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Send Reply & Resolve
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {ticket.status === 'Open' && expandedTicketId !== ticket.id && (
                    <button 
                      onClick={() => { setExpandedTicketId(ticket.id); setReplyText(''); }}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      Reply to Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
