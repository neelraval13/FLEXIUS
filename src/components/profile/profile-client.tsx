"use client";

import type React from "react";
import Link from "next/link";
import { ProfileForm } from "./profile-form";
import { FavoritesList } from "./favorites-list";
import { Settings, ChevronRight } from "lucide-react";
import type { UserProfile, FavoriteExercise } from "@/types/profile";

interface ProfileClientProps {
  userId: string;
  profile: UserProfile | null;
  favorites: FavoriteExercise[];
}

const ProfileClient: React.FC<ProfileClientProps> = ({
  profile,
  favorites,
}) => {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pb-24">
      {/* Profile Form */}
      <ProfileForm profile={profile} />

      {/* Favorites */}
      <FavoritesList favorites={favorites} />

      {/* Quick Links */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-400">More</h2>

        <Link
          href="/settings"
          className="flex items-center justify-between rounded-xl bg-neutral-900 px-4 py-3 transition-colors hover:bg-neutral-800"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-neutral-400" />
            <span className="text-sm text-white">
              Exercise &amp; Equipment Settings
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        </Link>
      </div>
    </div>
  );
};

export default ProfileClient;
