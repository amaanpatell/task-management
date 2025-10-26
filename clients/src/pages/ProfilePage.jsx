import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Briefcase, Calendar } from "lucide-react";
import { useAuthStore } from "../store";
import { formatDate } from "../utils/dateUtils";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-center mb-4">
              Authentication Required
            </h3>
            <p className="text-center text-muted-foreground">
              You must be logged in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="container max-w-4xl py-8">
      <h2 className="text-3xl font-bold mb-8">My Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={user.avatar?.url} alt={user.fullName || user.username} />
                <AvatarFallback className="bg-blue-500 text-white text-3xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-2xl font-semibold">
                {user.fullName || "User"}
              </h3>
              <p className="text-lg text-muted-foreground">
                @{user.username}
              </p>

              <Badge className="text-base px-4 py-1">
                {user.role || "Member"}
              </Badge>

              <p className="text-sm text-muted-foreground text-center mt-2">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
            </div>

            <Separator />

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{user.email}</p>
              </div>
            </div>

            <Separator />

            {/* Role */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{user.role || "Member"}</p>
              </div>
            </div>

            <Separator />

            {/* Account Created */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}