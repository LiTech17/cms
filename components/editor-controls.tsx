'use client';

import React, { ReactNode, useState } from 'react';
import { Save, X, Edit, Loader2 } from 'lucide-react';
import { useAuth } from './auth-provider';
import toast from 'react-hot-toast';

// -------------------------------------------------------------------------
// 1. Button Mock (shadcn/ui style-compatible)
// -------------------------------------------------------------------------
type ButtonVariant = 'default' | 'destructive' | 'outline';

const Button = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-3 py-1.5';
  const variantClasses: Record<ButtonVariant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline:
      'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
  };
  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// -------------------------------------------------------------------------
// 2. Props Interface
// -------------------------------------------------------------------------
interface EditorControlsProps {
  sectionId: string;
  children: ReactNode;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

// -------------------------------------------------------------------------
// 3. Main Component
// -------------------------------------------------------------------------
export const EditorControls: React.FC<EditorControlsProps> = ({
  sectionId,
  children,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}) => {
  const { isAuth } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      toast.success(`Successfully saved ${sectionId}`);
    } catch (error) {
      console.error(`❌ Failed to save section "${sectionId}":`, error);
      toast.error(`Error saving content for ${sectionId}. Check console for details.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuth) return <>{children}</>;

  return (
    <div
      className={`relative transition-all duration-200 ${
        isEditing
          ? 'border-2 border-primary/60 bg-muted/10 p-5 rounded-xl shadow-sm'
          : ''
      }`}
    >
      {/* --- Control Bar --- */}
      <div
        className={`absolute top-0 right-0 flex items-center gap-2 p-2 ${
          isEditing
            ? 'bg-primary text-primary-foreground rounded-bl-xl shadow-lg'
            : ''
        }`}
      >
        {!isEditing ? (
          <Button
            onClick={onStartEdit}
            className="text-xs font-semibold shadow-sm hover:shadow-md"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit {sectionId}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isSaving}
              className="text-xs font-semibold bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-xs font-semibold text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* --- Editable Content --- */}
      <div className={isEditing ? 'mt-10' : ''}>{children}</div>
    </div>
  );
};
