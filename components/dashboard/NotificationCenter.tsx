
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Nexa } from '../../services/api';
import { Notification } from '../../services/core/types';

export const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        // Assuming 'admin' user for this prototype
        const data = await Nexa.System.Notifications.getUserNotifications('admin', false);
        setNotifications(data);
    };

    useEffect(() => {
        fetchNotifications();
        
        // Listen for DB updates to refresh notifications in real-time
        const handleUpdate = (e: any) => {
            if (e.detail?.key === 'nexa_db_notifications') {
                fetchNotifications();
            }
        };
        window.addEventListener('nexa-storage-update', handleUpdate);
        return () => window.removeEventListener('nexa-storage-update', handleUpdate);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await Nexa.System.Notifications.markAsRead(id);
        fetchNotifications();
    };

    const markAllRead = async () => {
        await Nexa.System.Notifications.markAllAsRead('admin');
        fetchNotifications();
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-secondary" />;
            case 'WARNING': return <AlertTriangle className="h-4 w-4 text-warning" />;
            case 'ERROR': return <AlertCircle className="h-4 w-4 text-danger" />;
            default: return <Info className="h-4 w-4 text-primary" />;
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-surface border border-border text-on-surface hover:bg-surface-highlight transition shadow-sm"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in backdrop-blur-xl">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-surface-highlight/30">
                        <h3 className="font-bold text-on-surface">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllRead}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-on-surface-muted">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {notifications.map(note => (
                                    <div 
                                        key={note.id} 
                                        className={`p-4 hover:bg-surface-highlight/50 transition flex gap-3 ${!note.isRead ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="mt-1 shrink-0">
                                            {getIcon(note.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-sm font-bold truncate ${!note.isRead ? 'text-on-surface' : 'text-on-surface-muted'}`}>
                                                    {note.title}
                                                </h4>
                                                {!note.isRead && (
                                                    <button 
                                                        onClick={(e) => markAsRead(note.id, e)}
                                                        className="text-on-surface-muted hover:text-primary transition"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-on-surface-muted mt-1 leading-relaxed line-clamp-2">
                                                {note.message}
                                            </p>
                                            <span className="text-[10px] text-on-surface-muted/60 mt-2 block">
                                                {new Date(note.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
