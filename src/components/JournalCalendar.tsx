import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TradeEntry, cn } from '../types';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { savePdf } from '../services/fileService';

interface JournalCalendarProps {
  trades: TradeEntry[];
  onAddTrade: (trade: TradeEntry) => void;
  onDeleteTrade: (id: string) => void;
  onResetTrades: () => void;
}

export const JournalCalendar: React.FC<JournalCalendarProps> = ({ trades, onAddTrade, onDeleteTrade, onResetTrades }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const winRate = useMemo(() => {
    const monthTrades = trades.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
    if (monthTrades.length === 0) return 0;
    const wins = monthTrades.filter(t => t.result === 'win').length;
    return Math.round((wins / monthTrades.length) * 100);
  }, [trades, currentMonth]);

  const breakEvenRate = useMemo(() => {
    const monthTrades = trades.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
    if (monthTrades.length === 0) return 0;
    const be = monthTrades.filter(t => t.result === 'breakeven').length;
    return Math.round((be / monthTrades.length) * 100);
  }, [trades, currentMonth]);

  const exportToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    let yOffset = margin;

    const addSectionToPdf = async (element: HTMLElement) => {
      if (!element) return;
      const canvas = await toCanvas(element, {
        backgroundColor: '#ffffff',
        width: 800,
        style: { transform: 'scale(1)', left: '0', top: '0' }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const displayWidth = contentWidth;
      const displayHeight = (imgProps.height * displayWidth) / imgProps.width;

      if (yOffset + displayHeight > pageHeight - margin) {
        pdf.addPage();
        yOffset = margin;
      }

      pdf.addImage(imgData, 'PNG', margin, yOffset, displayWidth, displayHeight);
      yOffset += displayHeight + 5;
    };

    const reportContainer = document.createElement('div');
    reportContainer.style.width = '800px';
    reportContainer.style.padding = '40px';
    reportContainer.style.backgroundColor = '#ffffff';
    reportContainer.style.color = '#09090b';
    reportContainer.style.fontFamily = 'Inter, sans-serif';

    const monthTrades = trades.filter(t => format(new Date(t.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM'));

    const sections = [
      // Header
      `
      <div class="pdf-section" style="margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; text-align: center;">
        <h1 style="font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px;">Trading Performance</h1>
        <p style="color: #71717a; margin-top: 5px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">${format(currentMonth, 'MMMM yyyy')}</p>
      </div>
      `,
      // Stats
      `
      <div class="pdf-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
        <div style="background: #f9fafb; padding: 20px; border-radius: 16px; border: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 10px; color: #71717a; font-weight: 900; letter-spacing: 1px; margin: 0 0 10px 0; text-transform: uppercase;">WIN RATE</p>
          <h2 style="font-size: 32px; font-weight: 900; margin: 0; color: #10b981;">${winRate}%</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 16px; border: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 10px; color: #71717a; font-weight: 900; letter-spacing: 1px; margin: 0 0 10px 0; text-transform: uppercase;">BREAK EVEN</p>
          <h2 style="font-size: 32px; font-weight: 900; margin: 0; color: #f59e0b;">${breakEvenRate}%</h2>
        </div>
      </div>
      `,
      // Table Header
      `
      <div class="pdf-section">
        <h3 style="font-size: 14px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; color: #71717a;">Trade Logs</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; border-bottom: 2px solid #f3f4f6;">
              <th style="padding: 12px; color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase;">DATE</th>
              <th style="padding: 12px; color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase;">RESULT</th>
            </tr>
          </thead>
        </table>
      </div>
      `
    ];

    // Add trades in chunks to support multi-page tables
    const chunkSize = 15;
    for (let i = 0; i < monthTrades.length; i += chunkSize) {
      const chunk = monthTrades.slice(i, i + chunkSize);
      sections.push(`
        <div class="pdf-section">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${chunk.map(t => `
                <tr style="border-bottom: 1px solid #f9fafb;">
                  <td style="padding: 12px; font-size: 13px; font-weight: 600; color: #3f3f46;">${format(new Date(t.date), 'MMM dd, yyyy')}</td>
                  <td style="padding: 12px; font-size: 13px; font-weight: 900; color: ${t.result === 'win' ? '#10b981' : t.result === 'breakeven' ? '#f59e0b' : '#ef4444'}">${t.result.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `);
    }

    if (monthTrades.length === 0) {
      sections.push('<div class="pdf-section"><p style="text-align: center; color: #71717a; padding: 40px;">No trades recorded for this month.</p></div>');
    }

    document.body.appendChild(reportContainer);

    for (const html of sections) {
      reportContainer.innerHTML = html;
      const element = reportContainer.firstElementChild as HTMLElement;
      await addSectionToPdf(element);
    }

    document.body.removeChild(reportContainer);
    const blob = pdf.output('blob');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Performance_Report_${dateStr}.pdf`;
    await savePdf(blob, fileName, 'performance');
  };
;

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const addTrade = (result: 'win' | 'loss' | 'breakeven') => {
    if (!selectedDate) return;
    const newTrade: TradeEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate.toISOString(),
      result,
      execution: 'good'
    };
    onAddTrade(newTrade);
    setSelectedDate(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">TRADING <span className="text-brand-primary">JOURNAL</span></h1>
          <p className="text-text-muted">Track your performance and psychology.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2 text-xs font-black text-text-muted hover:text-red-400 transition-colors border border-brand-border rounded-lg hover:border-red-400/20"
          >
            RESET JOURNAL
          </button>
          <button 
            onClick={() => setSelectedDate(new Date())}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface/50 border border-brand-border text-text-main font-bold rounded-xl hover:bg-brand-surface transition-colors"
          >
            <TrendingUp size={18} className="text-brand-primary" />
            LOG TODAY
          </button>
          <div className="flex items-center bg-brand-surface border border-brand-border rounded-xl p-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-brand-surface/50 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-bold min-w-[140px] text-center text-text-main">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-brand-surface/50 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-text-inverse font-bold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
          >
            <Download size={18} />
            EXPORT PDF
          </button>
        </div>
      </div>

      <div id="journal-content" className="grid lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <p className="text-xs font-black text-text-muted tracking-widest uppercase mb-4">Monthly Stats</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-brand-surface/50 border border-brand-border">
                <TrendingUp size={18} className="text-brand-primary mb-1" />
                <p className="text-xl font-black text-text-main">{winRate}%</p>
                <p className="text-[10px] text-text-muted font-bold">WIN RATE</p>
              </div>
              <div className="p-3 rounded-2xl bg-brand-surface/50 border border-brand-border">
                <TrendingUp size={18} className="text-amber-500 mb-1 rotate-90" />
                <p className="text-xl font-black text-text-main">{breakEvenRate}%</p>
                <p className="text-[10px] text-text-muted font-bold">B.E RATE</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="text-xs font-black text-text-muted tracking-widest uppercase mb-4">Recent Trades</p>
            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
              {trades
                .filter(t => format(new Date(t.date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM'))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(trade => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl bg-brand-surface/50 border border-brand-border group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-8 rounded-full",
                        trade.result === 'win' ? "bg-brand-primary" : trade.result === 'breakeven' ? "bg-amber-500" : "bg-red-500"
                      )} />
                      <div>
                        <p className="text-sm font-bold text-text-main">{format(new Date(trade.date), 'MMM dd')}</p>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-tighter">
                          {trade.result}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteTrade(trade.id)}
                      className="p-2 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              {trades.length === 0 && (
                <p className="text-center py-8 text-text-muted text-sm italic">No trades logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Column */}
        <div className="lg:col-span-2">
          <div className="glass-card p-4">
            <div className="grid grid-cols-7 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center py-2 text-[10px] font-black text-text-muted tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                const dayTrades = trades.filter(t => isSameDay(new Date(t.date), day));
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all border",
                      !isCurrentMonth ? "opacity-20 border-transparent" : "border-brand-border hover:bg-brand-surface",
                      isToday(day) && "border-brand-primary/50 bg-brand-primary/5",
                      selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-brand-primary ring-inset"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-bold mb-1",
                      isToday(day) ? "text-brand-primary" : "text-text-main"
                    )}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex gap-0.5">
                      {dayTrades.map((t, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            t.result === 'win' ? "bg-brand-primary" : t.result === 'breakeven' ? "bg-amber-500" : "bg-red-500"
                          )} 
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {isResetModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsResetModalOpen(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md glass-card p-8 border-red-500/30 bg-red-500/[0.02]"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 text-text-main">RESET JOURNAL?</h3>
                    <p className="text-text-muted mb-8">This will permanently delete all your trade logs. This action cannot be undone.</p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          onResetTrades();
                          setIsResetModalOpen(false);
                        }}
                        className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                      >
                        YES, RESET EVERYTHING
                      </button>
                      <button 
                        onClick={() => setIsResetModalOpen(false)}
                        className="w-full py-4 text-text-muted font-bold hover:text-text-main transition-colors"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 p-6 glass-card border-brand-primary/30 bg-brand-primary/[0.02]"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-xl text-text-main">LOG TRADE: <span className="text-brand-primary">{format(selectedDate, 'MMM dd, yyyy')}</span></h3>
                  <button onClick={() => setSelectedDate(null)} className="text-text-muted hover:text-text-main">
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <p className="text-xs font-black text-text-muted tracking-widest uppercase mb-3">Select Result</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addTrade('win')}
                        className="flex-1 py-4 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-black hover:bg-brand-primary hover:text-text-inverse transition-all"
                      >
                        WIN
                      </button>
                      <button 
                        onClick={() => addTrade('breakeven')}
                        className="flex-1 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black hover:bg-amber-500 hover:text-brand-dark transition-all"
                      >
                        B.E
                      </button>
                      <button 
                        onClick={() => addTrade('loss')}
                        className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black hover:bg-red-500 hover:text-brand-dark transition-all"
                      >
                        LOSS
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-xs text-text-muted italic text-center">Clicking any button above will log the trade for this day.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
