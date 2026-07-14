'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AnimatedLandscape } from '@/components/layout/AnimatedLandscape';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function Header() {
  const { profile, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || '');
  const [schoolInput, setSchoolInput] = useState(profile?.school || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      setNameInput(profile.name);
    }
    if (profile?.school) {
      setSchoolInput(profile.school);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    const { error } = await updateProfile(nameInput.trim(), schoolInput.trim());
    setSaving(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Profile updated successfully! 🎉');
      setProfileOpen(false);
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SF';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      {/* Animated Parallax Landscape */}
      <div className="flex-1 mr-6 h-11 relative max-w-md md:max-w-2xl lg:max-w-4xl">
        <AnimatedLandscape />
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">

        {/* School Display */}
        {profile?.school && (
          <div className="text-xs font-semibold bg-navy-800/40 border border-blue-500/10 px-3 py-1.5 rounded-lg text-muted-foreground flex items-center gap-1.5 max-w-[220px] truncate select-none">
            <span className="shrink-0">🏫</span>
            <span className="truncate">{profile.school}</span>
          </div>
        )}
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-lg text-muted-foreground hover:text-foreground relative w-9 h-9 flex items-center justify-center overflow-hidden"
          title="Toggle light & dark theme"
        >
          <svg className="w-5 h-5 transition-transform duration-500" aria-hidden="true" viewBox="0 0 24 24">
            <mask id="moon-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx="24" cy="10" r="6" fill="black" className="transition-transform duration-500 origin-center dark:-translate-x-2.5 dark:-translate-y-0.5" />
            </mask>
            <circle cx="12" cy="12" r="6" mask="url(#moon-mask)" className="fill-current transition-transform duration-500 origin-center dark:scale-[1.6]" />
            <g className="stroke-current stroke-[2.5px] transition-all duration-500 origin-center dark:-rotate-45 dark:opacity-0">
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </g>
          </svg>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="relative h-9 w-9 rounded-full cursor-pointer hover:opacity-80 transition-opacity focus:outline-none flex items-center justify-center">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{profile?.name || 'Student'}</span>
                <span className="text-xs text-muted-foreground">Student</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setProfileOpen(true)}>
              <User className="w-4 h-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your full name"
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-school">School</Label>
              <Input
                id="profile-school"
                value={schoolInput}
                onChange={(e) => setSchoolInput(e.target.value)}
                placeholder="Enter your school name"
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value="Student" disabled className="bg-muted/40" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
