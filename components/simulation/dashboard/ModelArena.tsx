
import React from 'react';
import { Trophy, Award, Crosshair, Wrench, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ModelPerformance, CalibrationSuggestion } from '../../../services/simulation/types';

interface ModelArenaProps {
    leaderboard: ModelPerformance[];
    isLoading: boolean;
    driftData: any[];
    suggestions: CalibrationSuggestion[];
    handleApplyCalibration: (sug: CalibrationSuggestion) => void;
}

export const ModelArena: React.FC<ModelArenaProps> = ({ leaderboard, isLoading, driftData, suggestions, handleApplyCalibration }) => {
    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Champion Card */}
                {leaderboard.length > 0 && (
                    <div className="lg:col-span-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-amber-500/30 p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20"><Trophy className="h-48 w-48 text-amber-500" /></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-amber-500 text-black p-2 rounded-lg font-bold shadow-lg shadow-amber-500/20"><Trophy className="h-6 w-6" /></div>
                                <h2 className="text-2xl font-bold text-on-surface">Accuracy Champion</h2>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">{leaderboard[0].modelType.replace('_', ' ')}</h1>
                            <p className="text-on-surface-muted max-w-xl text-lg">
                                This engine currently holds the highest predictive accuracy score of <strong className="text-amber-300">{leaderboard[0].accuracyScore.toFixed(1)}%</strong>.
                            </p>
                        </div>
                    </div>
                )}
                
                {leaderboard.length === 0 && !isLoading && (
                    <div className="lg:col-span-3 p-12 text-center text-on-surface-muted border-2 border-dashed border-border rounded-3xl">
                        <Crosshair className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-on-surface">No Evaluation Data</h3>
                        <p>Run simulations and wait for data to accumulate.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Detailed Rankings */}
                <div className="space-y-4">
                    <h3 className="font-bold text-xl text-on-surface flex items-center gap-2"><Award className="h-6 w-6 text-secondary" /> Global Leaderboard</h3>
                    {leaderboard.map((model, idx) => (
                        <div key={model.modelType} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/50 transition duration-300 group">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-500 text-black' : 'bg-surface-highlight text-on-surface-muted'}`}>{idx + 1}</div>
                                <div>
                                    <h4 className="font-bold text-on-surface">{model.modelType.replace('_', ' ')}</h4>
                                    <div className="flex items-center gap-2 text-xs text-on-surface-muted">
                                        <span>Error: {model.averageError.toFixed(2)}%</span>
                                        <span>•</span>
                                        <span>{model.biasTrend}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right"><div className="text-2xl font-bold font-mono text-primary">{model.accuracyScore.toFixed(1)}</div></div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Drift Visualization */}
                    {driftData.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl border border-border">
                            <h3 className="font-bold text-lg text-on-surface mb-4">Model Drift</h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={driftData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                        <XAxis dataKey="period" stroke="#666" tick={{fontSize: 10}} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{ backgroundColor: '#111' }} />
                                        <Area type="monotone" dataKey="Predicted" stroke="#8884d8" fillOpacity={0.1} fill="#8884d8" />
                                        <Area type="monotone" dataKey="Actual" stroke="#82ca9d" fillOpacity={0.1} fill="#82ca9d" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Calibration Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl border border-warning/30 bg-warning/5 animate-fade-in">
                            <h3 className="font-bold text-lg text-warning mb-4 flex items-center gap-2"><Wrench className="h-5 w-5" /> Recommended Tuning</h3>
                            <div className="space-y-3">
                                {suggestions.map((sug, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-black/40 border border-warning/20 flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-bold text-white mb-1 capitalize">{sug.parameter.replace(/([A-Z])/g, ' $1')}</div>
                                            <p className="text-xs text-on-surface-muted max-w-xs">{sug.reason}</p>
                                        </div>
                                        <button onClick={() => handleApplyCalibration(sug)} className="px-3 py-1.5 bg-warning text-black text-xs font-bold rounded-lg hover:bg-warning/80 transition flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Apply {sug.suggestedValue}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
