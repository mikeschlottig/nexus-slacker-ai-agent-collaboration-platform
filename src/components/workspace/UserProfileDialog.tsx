import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { chatService, UserProfile } from '@/lib/chat';
import { toast } from 'sonner';
import { User, Palette, Info, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}
const AVATAR_COLORS = [
  'bg-[#E8912D]', 'bg-[#3F0E40]', 'bg-indigo-600', 'bg-teal-600',
  'bg-rose-600', 'bg-emerald-600', 'bg-blue-600'
];
export function UserProfileDialog({ open, onOpenChange, profile, onUpdate }: UserProfileDialogProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: profile.name,
    status: profile.status,
    avatarColor: profile.avatarColor
  });
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await chatService.updateUserProfile(formData);
      if (res.success && res.data) {
        onUpdate(res.data);
        toast.success("Profile updated successfully", {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        });
        onOpenChange(false);
      } else {
        toast.error("Failed to save changes: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Network error saving profile");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col sm:flex-row h-[550px]">
          <div className="w-full sm:w-48 bg-[#3F0E40]/5 border-r border-border p-4 space-y-2 shrink-0">
            <div className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-4 px-2">Account Workspace</div>
            <button className="w-full flex items-center justify-between p-2.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-bold border border-indigo-200/50 dark:border-indigo-900/50">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" /> Profile
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </button>
            <button className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted text-sm font-medium text-muted-foreground transition-all">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" /> Preferences
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted text-sm font-medium text-muted-foreground transition-all">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" /> About Nexus
              </div>
            </button>
          </div>
          <div className="flex-1 flex flex-col bg-background">
            <DialogHeader className="p-8 pb-2">
              <DialogTitle className="text-2xl font-black tracking-tight">Public Profile</DialogTitle>
              <p className="text-sm text-muted-foreground">Manage how you appear to agents and humans in the workspace.</p>
            </DialogHeader>
            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
              <div className="flex flex-col items-center gap-6 py-2">
                <div className={cn(
                  "w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-all hover:scale-105 border-4 border-background ring-2 ring-indigo-500/10",
                  formData.avatarColor
                )}>
                  {formData.name?.[0] || 'U'}
                </div>
                <div className="space-y-3 w-full max-w-sm">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center block">Pick Your Brand Color</Label>
                  <div className="flex flex-wrap justify-center gap-3">
                    {AVATAR_COLORS.map(color => (
                      <button
                        key={color}
                        className={cn(
                          "w-7 h-7 rounded-full transition-all border-2",
                          color,
                          formData.avatarColor === color ? "border-primary scale-125 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                        onClick={() => setFormData(p => ({ ...p, avatarColor: color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-70">Display Name</Label>
                  <Input
                    className="h-11 font-medium bg-muted/30 focus-visible:ring-indigo-500"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  />
                  <p className="text-[11px] text-muted-foreground">This is the name people (and bots) will use to mention you.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest opacity-70">Custom Status</Label>
                  <Input
                    className="h-11 font-medium bg-muted/30 focus-visible:ring-indigo-500"
                    placeholder="e.g. In a meeting, Coding..."
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 border-t bg-muted/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                Updated {new Date(profile.updatedAt).toLocaleTimeString()}
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-bold">Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 shadow-indigo-500/20 shadow-lg">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}