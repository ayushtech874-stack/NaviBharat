import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Loader2, AlertTriangle, CheckCircle, Mail, HelpCircle, X } from "lucide-react";
import { Card } from "./ui/card";

export type ModalType = "alert" | "confirm" | "prompt" | "success" | "error";

interface ActionModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string | ReactNode;
  icon?: ReactNode;
  
  // For Prompt
  inputValue?: string;
  inputPlaceholder?: string;
  onInputChange?: (val: string) => void;
  inputType?: string;

  // Actions
  onConfirm: (val?: string) => void;
  onCancel?: () => void;
  
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ActionModal({
  isOpen, type, title, message, icon,
  inputValue, inputPlaceholder, onInputChange, inputType = "text",
  onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isLoading = false
}: ActionModalProps) {
  
  if (!isOpen) return null;

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case "error": return <AlertTriangle className="text-red-500" size={32} />;
      case "success": return <CheckCircle className="text-teal-400" size={32} />;
      case "prompt": return <Mail className="text-amber-500" size={32} />;
      case "confirm": return <HelpCircle className="text-blue-400" size={32} />;
      default: return <AlertTriangle className="text-amber-500" size={32} />;
    }
  };

  const getThemeColors = () => {
    switch (type) {
      case "error": return "border-red-500/50 shadow-red-900/20";
      case "success": return "border-teal-500/50 shadow-teal-900/20";
      case "prompt": return "border-amber-500/50 shadow-amber-900/20";
      default: return "border-white/10 shadow-black/50";
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case "error": return "bg-red-600 hover:bg-red-500 text-white";
      case "success": return "bg-teal-600 hover:bg-teal-500 text-white";
      case "prompt": return "bg-amber-600 hover:bg-amber-500 text-white";
      default: return "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={type !== "alert" && type !== "error" && type !== "success" ? onCancel : undefined}></div>
      <Card className={`relative z-10 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-2 ${getThemeColors()} shadow-2xl rounded-3xl overflow-hidden`}>
        {onCancel && (
          <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
             <X size={20} />
          </button>
        )}
        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-950/50 border border-white/5 shadow-inner flex items-center justify-center mb-5">
            {getIcon()}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <div className="text-slate-300 font-medium mb-6">
            {message}
          </div>

          {type === "prompt" && onInputChange && (
            <div className="w-full mb-6">
              <input 
                type={inputType}
                value={inputValue || ""}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                autoFocus
                className="w-full h-12 bg-black/50 border border-white/20 rounded-xl px-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium placeholder-slate-500"
              />
            </div>
          )}

          <div className="flex gap-3 w-full">
            {(type === "confirm" || type === "prompt") && onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel} 
                disabled={isLoading}
                className="flex-1 bg-black/40 border-white/10 hover:bg-black/60 text-slate-300 hover:text-white h-12 rounded-xl"
              >
                {cancelText}
              </Button>
            )}
            <Button 
              onClick={() => onConfirm(inputValue)}
              disabled={isLoading || (type === "prompt" && !inputValue?.trim())}
              className={`flex-1 font-bold h-12 rounded-xl transition-transform active:scale-95 ${getConfirmButtonStyles()}`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin text-white flex-shrink-0" /> : confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
