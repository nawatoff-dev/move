import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck, AlertCircle, Plus, Trash2, Zap, Target, ShieldAlert, ShieldQuestion, Pencil, X, Save } from 'lucide-react';
import { ChecklistSection, cn } from '../types';

interface ChecklistProps {
  sections: ChecklistSection[];
  onToggle: (sectionId: string, itemId: string) => void;
  onReset: () => void;
  onRestoreDefaults: () => void;
  onAddItem: (sectionId: string, label: string) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onEditItem: (sectionId: string, itemId: string, label: string) => void;
}

export const Checklist: React.FC<ChecklistProps> = ({ 
  sections, 
  onToggle, 
  onReset, 
  onRestoreDefaults,
  onAddItem,
  onDeleteItem,
  onEditItem
}) => {
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [editingItem, setEditingItem] = useState<{ sectionId: string, itemId: string, label: string } | null>(null);

  const coreSection = sections.find(s => s.type === 'Core');
  const isCoreFull = coreSection ? coreSection.items.every(i => i.checked) && coreSection.items.length > 0 : false;

  const aPlusSection = sections.find(s => s.type === 'A+');
  
  const getEffectiveCounts = (section: ChecklistSection) => {
    if (section.type !== 'A+') {
      return {
        checked: section.items.filter(i => i.checked).length,
        total: section.items.length
      };
    }

    const biasHtf = section.items.find(i => i.id === 'bias-htf');
    const biasCounter = section.items.find(i => i.id === 'bias-counter');
    
    // Filter out optional items for percentage calculation
    const nonOptionalItems = section.items.filter(i => !i.label.toLowerCase().includes('(optional)'));
    const otherRequiredItems = nonOptionalItems.filter(i => i.id !== 'bias-htf' && i.id !== 'bias-counter');
    const otherChecked = otherRequiredItems.filter(i => i.checked).length;
    
    const biasGroupChecked = (biasHtf?.checked || biasCounter?.checked) ? 1 : 0;
    
    return {
      checked: otherChecked + biasGroupChecked,
      total: otherRequiredItems.length + 1
    };
  };

  const getSetupStatus = () => {
    if (!aPlusSection || aPlusSection.items.length === 0) return null;
    
    const { checked: checkedCount, total: totalCount } = getEffectiveCounts(aPlusSection);
    const percentage = (checkedCount / totalCount) * 100;
    
    // Crucial items are those marked with (must) OR the default crucial ones if not explicitly marked
    const allItems = aPlusSection.items;
    const mustIds = allItems.filter(i => i.label.toLowerCase().includes('(must)')).map(i => i.id);
    const defaultCrucialIds = ['bias-htf', 'liquidity-sweep', 'clear-structure', 'structure-choch', 'structure-bos'];
    const crucialIds = mustIds.length > 0 ? [...new Set([...mustIds, 'bias-htf'])] : defaultCrucialIds;

    const areCrucialChecked = crucialIds.every(id => {
      if (id === 'bias-htf') {
        return allItems.find(item => item.id === 'bias-htf')?.checked || 
               allItems.find(item => item.id === 'bias-counter')?.checked;
      }
      return allItems.find(item => item.id === id)?.checked;
    });
    
    if (percentage === 100) {
      return {
        label: 'A+ Setup',
        sub: 'Risk 2%',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        action: 'EXECUTE',
        icon: <Zap className="text-emerald-500" size={20} fill="currentColor" />,
        confidence: 5
      };
    }
    
    if (percentage > 85 && areCrucialChecked) {
      return {
        label: 'A Setup',
        sub: 'Risk 1%',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        action: 'EXECUTE',
        icon: <Target className="text-blue-400" size={20} />,
        confidence: 4
      };
    }
    
    if (areCrucialChecked) {
      return {
        label: 'B Setup',
        sub: 'Risk 0.5% • Optional',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        action: 'OPTIONAL',
        icon: <ShieldQuestion className="text-amber-400" size={20} />,
        confidence: 3
      };
    }
    
    return {
      label: 'C Setup',
      sub: 'Risk 0.0% • Red Flag',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      action: 'AVOID',
      icon: <ShieldAlert className="text-red-400" size={20} />,
      confidence: 1
    };
  };

  const status = getSetupStatus();

  const handleAddItem = (sectionId: string) => {
    if (newItemLabel.trim()) {
      onAddItem(sectionId, newItemLabel.trim());
      setNewItemLabel('');
      setAddingTo(null);
    }
  };

  const handleSaveEdit = () => {
    if (editingItem && editingItem.label.trim()) {
      onEditItem(editingItem.sectionId, editingItem.itemId, editingItem.label.trim());
      setEditingItem(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-main">TRADING <span className="text-brand-primary">CHECKLIST</span></h1>
          <p className="text-text-muted text-sm">Verify edge • Manage risk • Execute</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRestoreDefaults}
            className="px-4 py-2 text-[10px] font-black text-text-muted hover:text-brand-primary transition-colors border border-brand-border rounded-lg hover:border-brand-primary/20"
          >
            RESTORE DEFAULTS
          </button>
          <button 
            onClick={onReset}
            className="px-4 py-2 text-[10px] font-black text-text-muted hover:text-red-400 transition-colors border border-brand-border rounded-lg hover:border-red-400/20"
          >
            UNCHECK ALL
          </button>
        </div>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "mb-8 p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500",
              status.bg,
              status.border
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                status.bg
              )}>
                {status.icon}
              </div>
              <div>
                <h2 className={cn("text-2xl font-black tracking-tighter uppercase", status.color)}>
                  {status.label}
                </h2>
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest">
                  {status.sub}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Confidence Meter</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-6 h-1.5 rounded-full transition-all duration-500",
                        i <= status.confidence
                          ? (status.label === 'C Setup' ? 'bg-red-500' : 
                             status.label === 'B Setup' ? 'bg-amber-500' : 
                             status.label === 'A Setup' ? 'bg-blue-500' : 
                             'bg-emerald-500')
                          : 'bg-brand-border'
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <div className={cn(
                "px-6 py-3 rounded-xl font-black text-sm tracking-widest uppercase shadow-xl transition-colors duration-500",
                status.label === 'C Setup' ? 'bg-red-500 text-white' : 
                status.label === 'B Setup' ? 'bg-amber-500 text-brand-dark' : 
                status.label === 'A Setup' ? 'bg-blue-500 text-white' :
                'bg-emerald-500 text-white'
              )}>
                {status.action}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isCoreFull && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400" />
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Complete Core Rules to unlock Setup Checklists
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, sIdx) => {
          const { checked: checkedCount, total: totalCount } = getEffectiveCounts(section);
          const isFull = checkedCount === totalCount && totalCount > 0;
          const isAPlus = section.type === 'A+';
          const isCore = section.type === 'Core';
          const isDisabled = !isCore && !isCoreFull;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: sIdx * 0.05 }}
              className={cn(
                "glass-card flex flex-col h-full transition-all duration-300",
                isFull ? (isAPlus ? "ring-2 ring-brand-primary/50 bg-brand-primary/[0.02]" : "ring-1 ring-brand-primary/30 bg-brand-primary/[0.01]") : "border-brand-border",
                isDisabled && "border-red-500/20 bg-red-500/[0.01] opacity-60 grayscale-[0.5]"
              )}
            >
              <div className="p-4 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isFull ? "bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.6)]" : "bg-brand-border",
                    isDisabled && "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                  )} />
                  <h3 className={cn(
                    "font-bold text-sm tracking-tight uppercase",
                    isDisabled ? "text-red-400/70" : "text-text-main"
                  )}>{section.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {section.risk && (
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-md",
                      isDisabled ? "bg-red-500/10 text-red-400/50" : "bg-brand-primary/10 text-brand-primary/80"
                    )}>
                      {section.risk}
                    </span>
                  )}
                  {!isDisabled && (
                    <button 
                      onClick={() => setAddingTo(addingTo === section.id ? null : section.id)}
                      className="p-1 text-text-muted hover:text-brand-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>

              {isFull && !isDisabled && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "px-4 py-1.5 flex items-center justify-center gap-2 border-b border-brand-border",
                    isAPlus ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-500"
                  )}
                >
                  <Zap size={12} fill="currentColor" />
                  <span className="text-[9px] font-black tracking-[0.2em] uppercase">
                    {isAPlus ? "Ready • Exceptional" : `${section.type} Setup Valid`}
                  </span>
                </motion.div>
              )}

              <div className="flex-1 p-1 overflow-y-auto max-h-[300px] no-scrollbar">
                <AnimatePresence>
                  {addingTo === section.id && !isDisabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-2"
                    >
                      <div className="flex gap-2">
                        <input 
                          autoFocus
                          type="text"
                          value={newItemLabel}
                          onChange={(e) => setNewItemLabel(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem(section.id)}
                          placeholder="New rule..."
                          className="flex-1 bg-brand-surface/50 border border-brand-border rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-brand-primary/50"
                        />
                        <button 
                          onClick={() => handleAddItem(section.id)}
                          className="px-3 py-2 bg-brand-primary text-text-inverse rounded-lg text-xs font-bold"
                        >
                          ADD
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex items-center gap-3 p-3 rounded-lg transition-colors",
                        !isDisabled && "hover:bg-brand-surface/80"
                      )}
                    >
                      {editingItem?.itemId === item.id ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            autoFocus
                            type="text"
                            value={editingItem.label}
                            onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            className="flex-1 bg-brand-surface/50 border border-brand-border rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-brand-primary/50"
                          />
                          <button onClick={handleSaveEdit} className="text-brand-primary"><Save size={14} /></button>
                          <button onClick={() => setEditingItem(null)} className="text-red-400"><X size={14} /></button>
                        </div>
                      ) : (
                        <>
                          <button
                            disabled={isDisabled}
                            onClick={() => onToggle(section.id, item.id)}
                            className={cn(
                              "flex-1 flex items-center gap-3 text-left",
                              isDisabled && "cursor-not-allowed"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-all",
                              item.checked 
                                ? "bg-brand-primary border-brand-primary" 
                                : isDisabled ? "border-red-500/20" : "border-brand-border"
                            )}>
                              {item.checked && <Check size={10} className="text-text-inverse stroke-[4]" />}
                            </div>
                            <span className={cn(
                              "text-xs font-medium transition-colors",
                              item.checked ? "text-text-main" : isDisabled ? "text-red-900/40" : "text-text-muted"
                            )}>
                              {item.label}
                            </span>
                          </button>
                          {!isDisabled && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => setEditingItem({ sectionId: section.id, itemId: item.id, label: item.label })}
                                className="p-1 text-text-muted hover:text-brand-primary"
                              >
                                <Pencil size={12} />
                              </button>
                              <button 
                                onClick={() => onDeleteItem(section.id, item.id)}
                                className="p-1 text-text-muted hover:text-red-400"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 border-t border-brand-border bg-brand-surface/50 flex items-center justify-between">
                <div className="flex-1 h-1 bg-brand-border rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
                    className={cn(
                      "h-full transition-all duration-500",
                      isDisabled ? "bg-red-500/30" : "bg-brand-primary"
                    )}
                  />
                </div>
                <span className={cn(
                  "ml-3 text-[10px] font-black",
                  isDisabled ? "text-red-900/50" : "text-text-muted"
                )}>
                  {checkedCount}/{totalCount}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-brand-surface border border-brand-border flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
          <AlertCircle size={20} className="text-brand-primary" />
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-brand-primary">Pro Tip</h4>
          <p className="text-text-muted text-[11px]">If it's not an A+ setup, you're just gambling. Wait for alignment.</p>
        </div>
      </div>
    </div>
  );
};
