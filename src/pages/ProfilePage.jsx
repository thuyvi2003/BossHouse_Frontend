import { useAuthStore } from "@/stores/useAuthStore";
import { PasswordChange } from "@/components/ui/Profile/PasswordChange";
import { DeleteAccount } from "@/components/ui/Profile/DeleteAccount";
import { AccountActivityModal } from "@/components/ui/Profile/AccountActivityModal";
import { EditProfileModal } from "@/components/ui/Profile/EditProfileModal";
import { Button } from "@/components/ui/button";
import { History, Pencil, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { getProfile, uploadAvatar } from "@/services/profileService";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getProfile();
      setProfile(data);
      updateUser(data.user); // Sync useAuthStore user with fetched profile
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const updatedUser = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, user: updatedUser }));
      updateUser(updatedUser); // Update useAuthStore user with new avatar
      toast.success("Avatar uploaded successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    updateUser(updatedProfile.user); // Update useAuthStore user with new profile data
  };

  if (isLoading || !profile) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Profile Content */}
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-yellow-800">Profile</h2>
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => setIsActivityModalOpen(true)}
          >
            <History className="h-4 w-4 mr-2" />
            View Account Activity
          </Button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <img
                src={profile.user.profile_image || "https://via.placeholder.com/128"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-yellow-800 text-white p-2 rounded-full cursor-pointer hover:bg-yellow-900"
              >
                <Upload className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isLoading}
                />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.user.name}
                  </h1>
                  <p className="text-gray-500">{profile.user.email}</p>
                  {profile.veterinarian && (
                    <div className="mt-4">
                      <p className="text-gray-600">
                        <strong>Specialty:</strong> {profile.veterinarian.specialty || "Not specified"}
                      </p>
                      <p className="text-gray-600">
                        <strong>Years of Experience:</strong>{" "}
                        {profile.veterinarian.years_experience || "Not specified"}
                      </p>
                      <p className="text-gray-600">
                        <strong>Bio:</strong> {profile.veterinarian.bio || "Not specified"}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <PasswordChange />
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <DeleteAccount />
        </div>
      </div>

      <AccountActivityModal
        open={isActivityModalOpen}
        onOpenChange={setIsActivityModalOpen}
      />
      <EditProfileModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}