"use client";

import { useEffect, useState } from 'react';
import { getAdminFeedback, markFeedbackRead, deleteFeedback, FeedbackItem } from '@/lib/api';
import { MessageSquare, Mail, Phone, Clock, Check, Trash2, ShieldCheck, RefreshCw, User } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await getAdminFeedback();
      setItems(data);
    } catch (e) {
      console.error('Failed to load feedback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleMarkRead = async (id: string) => {
    setActionId(id);
    try {
      await markFeedbackRead(id);
      setItems(items.map(item => item.id === id ? { ...item, isRead: true } : item));
    } catch (e) {
      alert('Failed to mark as read');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    setActionId(id);
    try {
      await deleteFeedback(id);
      setItems(items.filter(item => item.id !== id));
    } catch (e) {
      alert('Failed to delete message');
    } finally {
      setActionId(null);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'read') return item.isRead;
    return true;
  });

  const unreadCount = items.filter(i => !i.isRead).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>CONFIDENTIAL ADMIN FEEDBACK INBOX</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            💬 Route Contributions & Feedback
            {unreadCount > 0 && (
              <span className="bg-cyan-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Messages and bus route updates submitted by public users from the website.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(['all', 'unread', 'read'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} {tab === 'unread' ? `(${unreadCount})` : `(${tab === 'all' ? items.length : items.length - unreadCount})`}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading user contributions...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">No Messages Found</h3>
          <p className="text-sm text-slate-500">
            {filter === 'unread'
              ? 'Great! All user feedback has been read.'
              : 'No contributions have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border transition-all ${
                item.isRead
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-gradient-to-r from-cyan-50/70 to-blue-50/70 border-cyan-300 shadow-md text-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base flex items-center gap-1.5 text-slate-900">
                      <User className="w-4 h-4 text-cyan-600" />
                      {item.name || 'Anonymous User'}
                    </span>
                    {!item.isRead && (
                      <span className="bg-cyan-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        Unread
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    {item.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${item.email}`} className="hover:underline text-cyan-700">
                          {item.email}
                        </a>
                      </span>
                    )}
                    {item.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${item.phone}`} className="hover:underline text-emerald-700 font-mono">
                          {item.phone}
                        </a>
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(item.createdAt), 'PPP p')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      disabled={actionId === item.id}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={actionId === item.id}
                    className="p-2 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner border border-slate-800">
                {item.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
