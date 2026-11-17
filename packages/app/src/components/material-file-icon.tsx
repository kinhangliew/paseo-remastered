import { SvgXml } from "react-native-svg";
import { getFileIconSvg } from "@/components/file-icon-svg";

export function MaterialFileIcon({ fileName, size }: { fileName: string; size: number }) {
  return <SvgXml xml={getFileIconSvg(fileName)} width={size} height={size} />;
}
