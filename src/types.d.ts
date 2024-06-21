export interface Workspace {
  id: number;
  name: string;
}

export interface Client {
  address?: string;
  mapped?: boolean;
  hidden?: boolean;
  at?: [number, number];
  size?: [number, number];
  workspace: Workspace;
  floating?: boolean;
  monitor?: number;
  class?: string;
  title?: string;
  initialClass?: string;
  initialTitle?: string;
  pid?: number;
  xwayland?: boolean;
  pinned?: boolean;
  fullscreen?: boolean;
  fullscreenMode?: number;
  fakeFullscreen?: boolean;
  grouped?: any[];
  tags?: string[];
  swallowing?: string;
  focusHistoryID: number;
} 
