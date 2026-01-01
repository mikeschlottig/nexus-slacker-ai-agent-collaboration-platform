import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { chatService, UserProfile } from '@/lib/chat';
import { toast } from 'sonner';
import { User, Palette, Info, CheckCircle2 } from 'lucide-react';
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
        toast.success("Profile updated");
        onOpenChange(false);
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <div className="flex h-[450px]">
          <div className="w-40 bg-muted/30 border-r p-4 space-y-2">
            <div className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4">Settings</div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-accent text-accent-foreground text-sm font-medium">
              <User className="w-4 h-4" /> Profile
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm font-medium cursor-not-allowed opacity-50">
              <Palette className="w-4 h-4" /> Theme
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-black">User Profile</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg", formData.avatarColor)}>
                  {formData.name?.[0] || 'U'}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      className={cn(
                        "w-6 h-6 rounded-full",
                        color,
                        formData.avatarColor === color ? "ring-2 ring-primary ring-offset-2" : "opacity-60"
                      )}
                      onClick={() => setFormData(p => ({ ...p, avatarColor: color }))}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <Input 
                    placeholder="What's your status?" 
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-4 border-t bg-muted/10">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>Save Changes</Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}