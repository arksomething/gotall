import { FC } from "react";

export interface HeaderProps {
  title: string;
  onSettingsPress?: () => void;
  rightIcon?: React.ReactNode;
}

export declare const Header: FC<HeaderProps>; 