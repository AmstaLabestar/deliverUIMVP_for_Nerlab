import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

export type AppIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
};

const AppIconComponent = ({ name, size = 20, color = "#333333" }: AppIconProps) => {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
};

export const AppIcon = React.memo(AppIconComponent);
