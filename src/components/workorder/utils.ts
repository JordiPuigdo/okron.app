import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";
import React, { JSX } from "react";

export type TabKey = "inspection" | "comments" | "spareParts" | "times";

export interface TabItem {
  key: TabKey;
  icon: JSX.Element;
  visible?: boolean;
}

export const TABS: TabItem[] = [
  {
    key: "inspection",
    icon: React.createElement(MaterialIcons, {
      name: "assignment-turned-in",
      size: 24,
      color: "black",
    }),
    visible: true,
  },
  {
    key: "comments",
    icon: React.createElement(FontAwesome5, {
      name: "comment-alt",
      size: 24,
      color: "black",
      visible: true,
    }),
  },
  {
    key: "spareParts",
    icon: React.createElement(Ionicons, {
      name: "construct",
      size: 24,
      color: "black",
    }),
    visible: true,
  },
  {
    key: "times",
    icon: React.createElement(Entypo, {
      name: "stopwatch",
      size: 24,
      color: "black",
    }),
    visible: true,
  },
];
