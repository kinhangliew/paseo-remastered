import type { ReactElement } from "react";
import { withUnistyles } from "react-native-unistyles";
import { Folder, FolderPlus, GitBranch, GitPullRequest } from "lucide-react-native";
import { ProjectIconView } from "@/components/project-icon-view";
import { ICON_SIZE, type Theme } from "@/styles/theme";

const ThemedFolder = withUnistyles(Folder);
const ThemedFolderPlus = withUnistyles(FolderPlus);
const ThemedGitBranch = withUnistyles(GitBranch);
const ThemedGitPullRequest = withUnistyles(GitPullRequest);
const mutedColor = (theme: Theme) => ({ color: theme.colors.foregroundMuted });

export const folderIcon = <ThemedFolder size={ICON_SIZE.sm} uniProps={mutedColor} />;
export const addProjectIcon = <ThemedFolderPlus size={ICON_SIZE.sm} uniProps={mutedColor} />;
export const branchIcon = <ThemedGitBranch size={ICON_SIZE.sm} uniProps={mutedColor} />;
export const pullRequestIcon = <ThemedGitPullRequest size={ICON_SIZE.sm} uniProps={mutedColor} />;

export function ProjectIcon({
  projectViewKey,
  iconDataUri,
}: {
  projectViewKey: string;
  iconDataUri: string | null;
}): ReactElement {
  return (
    <ProjectIconView
      iconDataUri={iconDataUri}
      projectViewKey={projectViewKey}
      size={ICON_SIZE.md}
    />
  );
}
