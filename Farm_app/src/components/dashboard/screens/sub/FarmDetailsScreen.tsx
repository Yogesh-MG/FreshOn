import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useFarmer";
import { Icon } from "@/components/freshon/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

export const FarmDetailsScreen = ({ onBack }: Props) => {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    name: "",
    farm_name: "",
    location: "",
    total_acreage: 0,
    speciality: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        farm_name: profile.farm_name || "",
        location: profile.location || "",
        total_acreage: profile.total_acreage || 0,
        speciality: profile.speciality || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      toast.success("Farm profile updated successfully");
      onBack();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-5 h-16 flex items-center gap-4 border-b border-border/60">
        <button onClick={onBack} className="size-10 rounded-xl glass flex items-center justify-center tap">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold">Farm Details</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Farmer Name</Label>
            <Input 
              placeholder="Your full name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="h-12 bg-muted/30 border-border/40 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Farm Name</Label>
            <Input 
              placeholder="e.g. Green Valley Farm"
              value={formData.farm_name}
              onChange={e => setFormData(prev => ({ ...prev, farm_name: e.target.value }))}
              className="h-12 bg-muted/30 border-border/40 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Location / Village</Label>
            <Input 
              placeholder="Where is your farm located?"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="h-12 bg-muted/30 border-border/40 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Acreage</Label>
              <Input 
                type="number"
                placeholder="In acres"
                value={formData.total_acreage}
                onChange={e => setFormData(prev => ({ ...prev, total_acreage: Number(e.target.value) }))}
                className="h-12 bg-muted/30 border-border/40 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Speciality</Label>
              <Input 
                placeholder="e.g. Organic Greens"
                value={formData.speciality}
                onChange={e => setFormData(prev => ({ ...prev, speciality: e.target.value }))}
                className="h-12 bg-muted/30 border-border/40 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Farm Bio / Description</Label>
            <Textarea 
              placeholder="Tell customers about your farm and farming methods..."
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="min-h-[120px] bg-muted/30 border-border/40 rounded-xl resize-none py-3"
            />
          </div>
        </div>
      </main>

      <footer className="p-5 border-t border-border/60">
        <Button 
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="w-full h-14 rounded-2xl text-lg font-bold shadow-glow-primary"
        >
          {updateProfile.isPending ? "Updating..." : "Update Profile"}
        </Button>
      </footer>
    </div>
  );
};
