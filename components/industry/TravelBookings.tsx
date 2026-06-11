
import React from 'react';
import { Plane, Calendar, User, MapPin, Search, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

const MOCK_BOOKINGS = [
    { id: 'BKG-8821', client: 'Acme Corp', travelers: 4, type: 'Flight + Hotel', destination: 'Dubai, UAE', dates: 'Nov 12 - Nov 18', status: 'CONFIRMED', amount: 4500 },
    { id: 'BKG-8822', client: 'Sarah Connor', travelers: 2, type: 'Flight Only', destination: 'Paris, France', dates: 'Dec 05 - Dec 12', status: 'PENDING', amount: 1200 },
    { id: 'BKG-8823', client: 'Tech Solutions', travelers: 1, type: 'Hotel', destination: 'London, UK', dates: 'Oct 30 - Nov 02', status: 'CANCELLED', amount: 850 },
];

export const TravelBookings: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Plane className="h-8 w-8 text-sky-500" /> Travel Bookings
                    </h1>
                    <p className="text-on-surface-muted mt-1">Manage flight reservations, hotel vouchers, and itineraries.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search booking or client..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-sky-500 w-64"
                        />
                    </div>
                    <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> New Booking
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {MOCK_BOOKINGS.map(booking => (
                    <div key={booking.id} className="glass-panel p-6 rounded-xl border border-border hover:border-sky-500/30 transition duration-300 group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${
                                    booking.status === 'CONFIRMED' ? 'bg-sky-500/20 text-sky-500' :
                                    booking.status === 'PENDING' ? 'bg-warning/20 text-warning' :
                                    'bg-danger/20 text-danger'
                                }`}>
                                    <Plane className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-on-surface">{booking.destination}</h3>
                                    <div className="flex items-center gap-4 text-sm text-on-surface-muted mt-1">
                                        <span className="font-mono text-xs">{booking.id}</span>
                                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {booking.client} ({booking.travelers})</span>
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {booking.dates}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-on-surface-muted uppercase">Total Value</p>
                                    <p className="font-mono font-bold text-lg text-on-surface">${booking.amount.toLocaleString()}</p>
                                </div>
                                
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${
                                    booking.status === 'CONFIRMED' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                    booking.status === 'PENDING' ? 'bg-warning/10 text-warning border-warning/20' :
                                    'bg-danger/10 text-danger border-danger/20'
                                }`}>
                                    {booking.status}
                                </span>
                                
                                <button className="p-2 hover:bg-surface-highlight rounded-lg text-on-surface-muted hover:text-sky-500 transition">
                                    View Itinerary
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
