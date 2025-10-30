import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/services/profileService";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "react-toastify";

export function EditProfileModal({ open, onOpenChange, profile, onProfileUpdate }) {
    const { updateUser } = useAuthStore();
    const [formData, setFormData] = useState({
        name: profile?.user?.name || "",
        specialty: profile?.veterinarian?.specialty || "",
        years_experience: profile?.veterinarian?.years_experience || "",
        bio: profile?.veterinarian?.bio || "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const updatedProfile = await updateProfile(formData);
            onProfileUpdate(updatedProfile);
            updateUser(updatedProfile.user); // Update useAuthStore user with new profile data
            toast.success("Profile updated successfully!");
            onOpenChange(false);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const isVeterinarian = profile?.user?.role === "veterinarian";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                                minLength={3}
                            />
                        </div>
                        {isVeterinarian && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="specialty" className="text-right">
                                        Specialty
                                    </Label>
                                    <Input
                                        id="specialty"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="years_experience" className="">
                                        Years of Experience
                                    </Label>
                                    <Input
                                        id="years_experience"
                                        name="years_experience"
                                        type="number"
                                        value={formData.years_experience}
                                        onChange={handleChange}
                                        className="col-span-3"
                                        min={1}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="bio" className="text-right">
                                        Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="col-span-3"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}