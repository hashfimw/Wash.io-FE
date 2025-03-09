"use client";

import React, { useState } from "react";
import { User as UserType } from "@/types/profile";
import {
  Mail,
  User as UserIcon,
  Clock,
  Shield,
  Check,
  AtSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEditProfile } from "@/hooks/api/profile/useEditProfile";
import ProfileHeader from "./profileHeader";
import AvatarUpload from "./avatarUpload";
import ProfileEditForm from "./profileEditForm";

interface ProfileCardProps {
  user: UserType;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { isUpdating } = useEditProfile();

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // The actual submission is handled in the ProfileEditForm component
    // This function just prepares to exit edit mode
    if (!isUpdating) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ProfileHeader
        user={user}
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <Card className="w-full overflow-hidden backdrop-blur-sm bg-white/70 border shadow-sm transition-all duration-500 animate-scale-in">
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12">
            <div className="flex flex-col items-center space-y-4">
              <AvatarUpload user={user} />

              {!isEditing && (
                <div className="mt-4 text-center space-y-1">
                  <h2 className="text-xl font-semibold animate-fade-in">
                    {user.fullName || "No Name Set"}
                  </h2>
                  <p className="text-muted-foreground text-sm flex items-center justify-center animate-fade-in animate-stagger-1">
                    <AtSign className="h-3.5 w-3.5 mr-1" />
                    {user.email}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <ProfileEditForm
                  userId={user.id}
                  initialValues={{
                    fullName: user.fullName || "", // Pastikan selalu bertipe string
                    email: user.email,
                  }}
                  onSaveComplete={handleSave}
                />
              ) : (
                <div className="space-y-6 animate-fade-in animate-stagger-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    <InfoItem
                      icon={<UserIcon className="h-4 w-4" />}
                      label="Full Name"
                      value={user.fullName || "Not set"}
                    />
                    <InfoItem
                      icon={<Mail className="h-4 w-4" />}
                      label="Email Address"
                      value={user.email}
                    />
                    <InfoItem
                      icon={<Shield className="h-4 w-4" />}
                      label="Account Type"
                      value={user.role.replace("_", " ")}
                    />
                    <InfoItem
                      icon={<Check className="h-4 w-4" />}
                      label="Verified"
                      value={user.isVerified ? "Yes" : "No"}
                    />
                    <InfoItem
                      icon={<Clock className="h-4 w-4" />}
                      label="Joined"
                      value={new Date(user.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3 animate-fade-in">
    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

export default ProfileCard;
