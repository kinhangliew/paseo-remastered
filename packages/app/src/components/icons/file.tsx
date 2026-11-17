import type { ComponentType } from "react";
import { MaterialFileIcon } from "@/components/material-file-icon";
import { useSettings } from "@/hooks/use-settings";
import type { PanelIconProps } from "@/panels/panel-registry";
import { OutlineFileIcon } from "./outline-file";

interface FileIconProps {
  fileName: string;
  size: number;
}

/** A file's icon in the style chosen under Settings › Appearance › File icons. */
export function FileIcon({ fileName, size }: FileIconProps) {
  const style = useSettings((settings) => settings.fileIconStyle);
  if (style === "material") return <MaterialFileIcon fileName={fileName} size={size} />;
  return <OutlineFileIcon fileName={fileName} size={size} />;
}

export function createFileIcon(fileName: string): ComponentType<PanelIconProps> {
  function BoundFileIcon({ size }: PanelIconProps) {
    return <FileIcon fileName={fileName} size={size} />;
  }
  return BoundFileIcon;
}
