<<<<<<< HEAD
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/useSession';
import { useUser } from '@/hooks/api/profile/useUser';
import ProfileCard from './profileCard';

const Profile = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { data: user, isLoading, isError } = useUser(id || '');
=======
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { useUser } from "@/hooks/api/profile/useUser";
import ProfileCard from "./profileCard";

const Profile = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { data: user, isLoading, isError } = useUser(id || "");
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
  const { isAuth, user: sessionUser } = useSession();
  const router = useRouter();

  // Check if the user is viewing their own profile
  useEffect(() => {
    if (isAuth && sessionUser && id) {
      const isOwnProfile = sessionUser.id === parseInt(id);
      console.log("Is viewing own profile:", isOwnProfile);
    }
  }, [isAuth, sessionUser, id]);

  if (!id) {
<<<<<<< HEAD
    router.push('/');
=======
    router.push("/");
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
    return null;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center px-4">
          <h1 className="text-2xl font-semibold mb-4">User Not Found</h1>
<<<<<<< HEAD
          <p className="text-muted-foreground mb-6">The user profile you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            onClick={() => router.push('/')}
=======
          <p className="text-muted-foreground mb-6">
            The user profile you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to
            view it.
          </p>
          <button
            onClick={() => router.push("/")}
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
            className="text-primary hover:text-primary/90 transition-colors underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      {/* <Sonner position="bottom-right" /> */}
      <ProfileCard user={user} />
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
<<<<<<< HEAD
        
=======

>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
        <div className="flex flex-col items-center text-center space-y-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border bg-white/70 shadow-sm">
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-36 w-36 rounded-full" />
              <div className="mt-4 text-center space-y-1">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-5 w-32" />
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

<<<<<<< HEAD
export default Profile;
=======
export default Profile;
>>>>>>> c4d5fb6e733e1d7fe8d8d0004abc725a930a2da6
