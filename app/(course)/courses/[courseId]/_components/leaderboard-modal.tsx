"use client";

import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import {
  ArrowDown,
  ArrowUp,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Medal,
  Minus,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  userId: string;
  rank: number;
  totalScore: number;
  avgTime: number;
  perfectRuns: number;
  perfectRunPercentage: number;
  badges: string[];
  previousRank?: number;
  username?: string;
  imageUrl?: string;
}

interface UserProfile {
  username: string;
  profileImage: string;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboardData: LeaderboardEntry[];
  courseTitle?: string;
}

const ITEMS_PER_PAGE = 8;

const BADGE_TYPES = [
  "All Badges",
  "Speedster",
  "Consistent",
  "Late Bloomer",
  "Perfect Run",
  "Quiz Master",
];

// Function to fetch user details from the API
const fetchUserDetails = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`/api/get-user-detail?userId=${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const json = await response.json();
    const userData = json.data; // Extract the `data` field from the response

    return {
      username: userData.username,
      profileImage: userData.imageUrl,
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

export const LeaderboardModal = ({
  isOpen,
  onClose,
  leaderboardData,
  courseTitle = "Course",
}: LeaderboardModalProps) => {
  const { user } = useUser();
  const [userProfiles, setUserProfiles] = useState<
    Record<string, { username: string; imageUrl: string }>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState("All Badges");

  // Calculate total pages
  const totalPages = Math.ceil(leaderboardData.length / ITEMS_PER_PAGE);

  // Fetch user profiles using the API
  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!isOpen || !leaderboardData.length) return;

      setIsLoading(true);

      try {
        const profiles: Record<string, { username: string; imageUrl: string }> =
          {};

        // Process each user in the leaderboard
        const fetchPromises = leaderboardData.map(async (entry) => {
          // Try to fetch user details from the API
          const userDetails = await fetchUserDetails(entry.userId);

          if (userDetails) {
            profiles[entry.userId] = {
              username: userDetails.username,
              imageUrl:
                userDetails.profileImage ||
                `/placeholder.svg?height=40&width=40&text=${entry.rank}`,
            };
          } else {
            // Fallback if API fails
            profiles[entry.userId] = {
              username: entry.username || `User ${entry.rank}`,
              imageUrl:
                entry.imageUrl ||
                `/placeholder.svg?height=40&width=40&text=${entry.rank}`,
            };
          }
        });

        // Wait for all fetch operations to complete
        await Promise.all(fetchPromises);

        // If the current user is in the leaderboard, use their actual data
        if (user && leaderboardData.some((entry) => entry.userId === user.id)) {
          profiles[user.id] = {
            username: user.username || user.firstName || "You",
            imageUrl:
              user.imageUrl || `/placeholder.svg?height=40&width=40&text=You`,
          };
        }

        setUserProfiles(profiles);
      } catch (error) {
        console.error("Error fetching user profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfiles();
  }, [isOpen, leaderboardData, user]);

  // Find user's rank to auto-navigate to their page
  useEffect(() => {
    if (isOpen && user?.id) {
      const userEntry = leaderboardData.find(
        (entry) => entry.userId === user.id
      );
      if (userEntry) {
        const userPage = Math.ceil(userEntry.rank / ITEMS_PER_PAGE);
        setCurrentPage(userPage);

        // Show confetti if user is in top 3
        if (userEntry.rank <= 3) {
          triggerConfetti();
        }
      }
    }
  }, [isOpen, user?.id, leaderboardData]);

  // Trigger confetti effect
  const triggerConfetti = () => {
    setShowConfetti(true);

    // Use canvas-confetti for a more impressive effect
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#FFD700", "#FFC0CB", "#87CEFA", "#90EE90"];
    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setTimeout(() => setShowConfetti(false), duration);
  };

  // Filter data based on selected badge
  const getFilteredData = () => {
    if (!leaderboardData.length) return [];

    // Filter by badge if a specific badge is selected
    if (selectedBadge !== "All Badges") {
      return leaderboardData.filter((entry) =>
        entry.badges.includes(selectedBadge)
      );
    }

    // Otherwise return all data
    return leaderboardData;
  };

  // Get current page data
  const getCurrentPageData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  };

  // Badge icon mapping
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Speedster":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "Consistent":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "Late Bloomer":
        return <Trophy className="h-4 w-4 text-purple-500" />;
      case "Problem Solver":
        return <Award className="h-4 w-4 text-blue-500" />;
      case "Quiz Master":
        return <Flame className="h-4 w-4 text-orange-500" />;
      default:
        return <Award className="h-4 w-4 text-blue-500" />;
    }
  };

  // Get badge tooltip description
  const getBadgeDescription = (badge: string) => {
    switch (badge) {
      case "Speedster":
        return "Completes challenges faster than 80% of users";
      case "Consistent":
        return "Maintains a steady performance across challenges";
      case "Late Bloomer":
        return "Achieves perfect scores consistently";
      case "Problem Solver":
        return "Excels at solving complex problems";
      case "Quiz Master":
        return "Rapidly improves performance over time";
      default:
        return "Special achievement";
    }
  };

  // Get rank change indicator
  const getRankChangeIndicator = (entry: LeaderboardEntry) => {
    if (!entry.previousRank) return null;

    if (entry.previousRank > entry.rank) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (entry.previousRank < entry.rank) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get rank icon/styling
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg transform hover:scale-110 transition-transform">
            <Crown className="h-7 w-7 animate-pulse" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-md transform hover:scale-105 transition-transform">
            <Medal className="h-6 w-6" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-md transform hover:scale-105 transition-transform">
            <Trophy className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold transform hover:scale-105 transition-transform">
            {rank}
          </div>
        );
    }
  };

  // Pagination controls
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Handle badge filter change
  const handleBadgeChange = (value: string) => {
    setSelectedBadge(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-5xl lg:max-w-6xl xl:max-w-[90vw] 2xl:max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {courseTitle} Leaderboard
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          {/* Badge filter */}
          <Select value={selectedBadge} onValueChange={handleBadgeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by badge" />
            </SelectTrigger>
            <SelectContent>
              {BADGE_TYPES.map((badge) => (
                <SelectItem key={badge} value={badge}>
                  <div className="flex items-center gap-2">
                    {badge !== "All Badges" && getBadgeIcon(badge)}
                    <span>{badge}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4">
          <div className="overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Badges
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        <span>Avg Time</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perfections
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    // Loading state
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                      <tr key={`loading-${index}`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full mr-3" />
                            <div>
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16 mt-1" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-20" />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-12" />
                        </td>
                      </tr>
                    ))
                  ) : getCurrentPageData().length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    getCurrentPageData().map((entry, index) => {
                      const isCurrentUser = user?.id === entry.userId;
                      const isTopThree = entry.rank <= 3;
                      const userProfile = userProfiles[entry.userId];

                      return (
                        <tr
                          key={entry.userId}
                          className={cn(
                            "transition-colors duration-200 group",
                            isCurrentUser ? "bg-blue-50" : "",
                            isTopThree
                              ? "bg-yellow-50/50 hover:bg-yellow-50"
                              : "hover:bg-gray-50",
                            entry.rank === 1 ? "animate-pulse-subtle" : ""
                          )}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              {getRankDisplay(entry.rank)}
                              <div className="ml-1">
                                {getRankChangeIndicator(entry)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative">
                                <Avatar
                                  className={cn(
                                    "h-12 w-12 mr-3 border-2 transition-transform group-hover:scale-110",
                                    isTopThree
                                      ? "border-yellow-400"
                                      : "border-gray-200",
                                    isCurrentUser ? "ring-2 ring-blue-400" : ""
                                  )}
                                >
                                  <AvatarImage
                                    src={
                                      userProfile?.imageUrl ||
                                      `/placeholder.svg?height=40&width=40`
                                    }
                                    alt={
                                      userProfile?.username ||
                                      `User ${entry.rank}`
                                    }
                                  />
                                  <AvatarFallback>
                                    {userProfile?.username?.charAt(0) ||
                                      entry.rank}
                                  </AvatarFallback>
                                </Avatar>
                                {isTopThree && (
                                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {isCurrentUser
                                    ? "You"
                                    : userProfile?.username ||
                                      `User ${entry.rank}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {isCurrentUser
                                    ? "Current position"
                                    : `Rank ${entry.rank}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {entry.badges.map((badge, index) => (
                                <div
                                  key={`${entry.userId}-${badge}-${index}`}
                                  className={cn(
                                    "group/badge relative flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors cursor-help",
                                    selectedBadge === badge
                                      ? "bg-primary/20 hover:bg-primary/30"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  )}
                                  title={getBadgeDescription(badge)}
                                >
                                  {getBadgeIcon(badge)}
                                  <span className="hidden sm:inline">
                                    {badge}
                                  </span>

                                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black text-white text-xs rounded shadow-lg opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-opacity z-10">
                                    <div className="font-bold mb-1">
                                      {badge}
                                    </div>
                                    <div>{getBadgeDescription(badge)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {entry.avgTime > 0 ? (
                              <div className="flex items-center">
                                <span className="font-medium">
                                  {entry.avgTime}s
                                </span>
                                {entry.avgTime < 30 && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 bg-green-50 text-green-700 text-xs"
                                  >
                                    Fast
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {entry.totalScore > 250 ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {entry.perfectRuns}
                                </span>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                            ) : (
                              <span className="text-gray-500">--</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div
                              className={cn(
                                "text-sm font-medium flex items-center gap-1",
                                entry.totalScore > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              )}
                            >
                              {entry.totalScore > 0 ? (
                                <>
                                  <ArrowUp className="h-4 w-4" />+
                                  {entry.totalScore}
                                </>
                              ) : (
                                <>
                                  {entry.totalScore < 0 && (
                                    <ArrowDown className="h-4 w-4" />
                                  )}
                                  {entry.totalScore}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {!isLoading && getFilteredData().length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          getFilteredData().length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {getFilteredData().length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </Button>

                      {/* Page numbers */}
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          // Show at most 5 page numbers
                          let pageNum = i + 1;
                          if (totalPages > 5 && currentPage > 3) {
                            pageNum = currentPage - 3 + i;
                            if (pageNum > totalPages) {
                              pageNum = totalPages - (4 - i);
                            }
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              onClick={() => setCurrentPage(pageNum)}
                              className={cn(
                                "relative inline-flex items-center px-4 py-2 text-sm font-medium",
                                currentPage === pageNum
                                  ? "bg-primary text-white"
                                  : "text-gray-700"
                              )}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}

                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
