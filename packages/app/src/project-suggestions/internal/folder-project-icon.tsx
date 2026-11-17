import { ProjectIconView } from "@/components/project-icon-view";
import { projectIconDataUri, useProjectIcon } from "@/projects/icons";
import { ICON_SIZE } from "@/styles/theme";

/**
 * The icon of a folder that may not be a project yet: the icon the host discovers in it, or a
 * pastel folder. Keyed on the folder, so a suggestion keeps its color once it is added here.
 */
export function FolderProjectIcon({ serverId, rootPath }: { serverId: string; rootPath: string }) {
  const { icon } = useProjectIcon({ serverId, cwd: rootPath });
  return (
    <ProjectIconView
      iconDataUri={projectIconDataUri(icon)}
      projectViewKey={rootPath}
      size={ICON_SIZE.md}
    />
  );
}
