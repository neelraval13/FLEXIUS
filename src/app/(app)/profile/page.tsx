// src/app/(app)/profile/page.tsx

import type React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile, getFavorites } from "@/db/queries/profile";
import ProfileClient from "@/components/profile/profile-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

const ProfilePage: React.FC = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getProfile(session.user.id);
  const favorites = await getFavorites(session.user.id);

  return (
    <ProfileClient
      userId={session.user.id}
      profile={profile}
      favorites={favorites}
    />
  );
};

export default ProfilePage;
