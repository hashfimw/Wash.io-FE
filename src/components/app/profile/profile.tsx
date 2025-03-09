"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { ArrowLeft, Edit, User, Mail, Clock, Shield } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AvatarUpload from "./avatarUpload";
import ProfileEditForm from "./profileEditForm";

export default function ProfilePage() {
  const { user, isAuth } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (user) {
      setIsLoading(false);
    } else if (!isAuth && !isLoading) {
      router.push("/login");
    }
  }, [user, isAuth, router, isLoading]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // The actual submission is handled in the ProfileEditForm component
    // This function just prepares to exit edit mode
    setIsEditing(false);
    toast.success("Profile updated successfully!", {
      position: "bottom-right",
      autoClose: 3000,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-putbir">
        <div className="text-center px-4">
          <h1 className="text-2xl font-semibold mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">
<<<<<<< HEAD
            The user profile you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link
            href="/"
            className="text-birtu hover:text-oren transition-colors underline"
          >
=======
            The user profile you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to
            view it.
          </p>
          <Link href="/" className="text-birtu hover:text-oren transition-colors underline">
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-putbir py-12">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between w-full">
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-birtu transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </Link>

            {isEditing ? (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="transition-all duration-300 hover:bg-red-100"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-birtu hover:bg-oren transition-all duration-300"
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEdit}
                className="transition-all duration-300 hover:bg-birmud"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="text-sm px-3 py-1 rounded-full bg-birmud text-birtu">
              {user.role ? user.role.replace("_", " ") : "CUSTOMER"}
            </div>
            <h1 className="text-3xl font-semibold mt-2">
              {isEditing ? "Edit Your Profile" : "Profile Details"}
            </h1>
            <p className="text-gray-600 max-w-md">
              {isEditing
                ? "Update your personal information and save the changes when you're done."
<<<<<<< HEAD
                : `Member since ${new Date(
                    user.createdAt || new Date()
                  ).toLocaleDateString("en-US", {
=======
                : `Member since ${new Date(user.createdAt || new Date()).toLocaleDateString("en-US", {
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`}
            </p>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-lg border bg-white/70 shadow-sm">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12">
              <div className="flex flex-col items-center space-y-4">
                {isEditing ? (
                  <AvatarUpload user={user} />
                ) : (
                  <div className="h-36 w-36 relative rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={user.avatar || "/default-user-avatar.png"}
                      alt={user.fullName || "User Avatar"}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}

                {!isEditing && (
                  <div className="mt-4 text-center space-y-1">
<<<<<<< HEAD
                    <h2 className="text-xl font-semibold">
                      {user.fullName || "No Name Set"}
                    </h2>
=======
                    <h2 className="text-xl font-semibold">{user.fullName || "No Name Set"}</h2>
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
                    <p className="text-gray-500 text-sm flex items-center justify-center">
                      <Mail className="h-3.5 w-3.5 mr-1" />
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
                      fullName: user.fullName || "",
                      email: user.email,
                    }}
                    onSaveComplete={handleSave}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      <InfoItem
                        icon={<User className="h-4 w-4" />}
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
<<<<<<< HEAD
                        value={
                          user.role ? user.role.replace("_", " ") : "CUSTOMER"
                        }
=======
                        value={user.role ? user.role.replace("_", " ") : "CUSTOMER"}
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
                      />
                      <InfoItem
                        icon={<Clock className="h-4 w-4" />}
                        label="Joined"
<<<<<<< HEAD
                        value={new Date(
                          user.createdAt || new Date()
                        ).toLocaleDateString("en-US", {
=======
                        value={new Date(user.createdAt || new Date()).toLocaleDateString("en-US", {
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="h-8 w-8 rounded-full bg-birmud/50 flex items-center justify-center text-birtu">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-putbir py-12">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between w-full">
            <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-9 w-28 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-72 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-lg border bg-white/70 shadow-sm">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-36 w-36 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="mt-4 text-center space-y-1">
                  <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
                </div>
              </div>

              <div className="flex-1">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                          <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
