'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types/profile';


interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  isEditing, 
  onToggleEdit, 
  onSave, 
  onCancel 
}) => {
  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div className="flex items-center justify-between w-full">
        <Link 
          href="/"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back</span>
        </Link>
        
        {isEditing ? (
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCancel}
              className="transition-all duration-300 hover:bg-destructive/10"
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={onSave}
              className="transition-all duration-300 animate-scale-in"
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleEdit}
            className="transition-all duration-300 hover:bg-primary/10"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
      
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">
          {user.role.replace('_', ' ')}
        </div>
        <h1 className="text-3xl font-semibold mt-2 animate-fade-in">
          {isEditing ? "Edit Your Profile" : "Profile Details"}
        </h1>
        <p className="text-muted-foreground max-w-md animate-fade-in animate-stagger-1">
          {isEditing
            ? "Update your personal information and save the changes when you're done."
            : `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
