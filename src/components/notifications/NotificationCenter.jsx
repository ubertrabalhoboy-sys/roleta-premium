import React from 'react';
import { format } from 'date-fns';
import SoftButton from '../ui/SoftButton';
import { Bell, BellRing, CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

export default function NotificationCenter({ 
  show, 
  notifications = [], 
  onMarkRead, 
  onMarkAllRead,
  onClose 
}) {
  if (!show) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type, priority) => {
    if (type === 'hot_lead') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (type === 'prize_trend') return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    if (type === 'inactivity') return <Clock className="w-5 h-5 text-red-600" />;
    return <Bell className="w-5 h-5 text-blue-600" />;
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'border-l-red-500';
    if (priority === 'medium') return 'border-l-yellow-500';
    return 'border-l-blue-500';
  };

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[3000]"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-[95%] max-w-[700px] max-h-[90vh] rounded-[20px] bg-white overflow-hidden"
        style={{
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
          animation: 'scaleUp 0.3s ease'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BellRing className="w-6 h-6 text-[#6c5ce7]" />
            <div>
              <h3 className="text-xl font-semibold text-[#2d3436]">Central de Notificações</h3>
              <p className="text-sm text-[#636e72]">
                {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <SoftButton onClick={onMarkAllRead} style={{ padding: '5px 15px', fontSize: '0.8rem' }}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Marcar tudo
              </SoftButton>
            )}
            <SoftButton onClick={onClose} style={{ padding: '5px 15px', fontSize: '0.8rem' }}>
              Fechar
            </SoftButton>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#636e72]">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma notificação ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border-l-4 cursor-pointer transition-all ${getPriorityColor(notif.priority)} ${
                    notif.read ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                  onClick={() => !notif.read && onMarkRead(notif.id)}
                  style={{
                    boxShadow: notif.read ? 'none' : '0 2px 8px rgba(108, 92, 231, 0.1)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getIcon(notif.type, notif.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold ${notif.read ? 'text-[#636e72]' : 'text-[#2d3436]'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-[#6c5ce7] rounded-full"></span>
                        )}
                      </div>
                      <p className={`text-sm ${notif.read ? 'text-[#636e72]' : 'text-[#2d3436]'}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#636e72]">
                        <span>
                          {notif.created_date && format(new Date(notif.created_date), 'dd/MM/yyyy HH:mm')}
                        </span>
                        {notif.sent_email && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-envelope"></i> Email
                          </span>
                        )}
                        {notif.sent_whatsapp && (
                          <span className="flex items-center gap-1">
                            <i className="fab fa-whatsapp"></i> WhatsApp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}