export const PAGE_SIZE = 8;

export const LIGHT_MODE = "light",
	DARK_MODE = "dark",
	AUTO_MODE = "auto";
export const DEFAULT_THEME = AUTO_MODE;

// Banner height unit: vh
export const BANNER_HEIGHT = 35;
export const BANNER_HEIGHT_EXTEND = 30;
export const BANNER_HEIGHT_HOME = BANNER_HEIGHT + BANNER_HEIGHT_EXTEND;

// The height the main panel overlaps the banner, unit: rem
export const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

/*
 * 以下三个尺寸对齐 Mizuki 参考站（https://mizuki.mysqil.com/）：
 *   --page-width: 90rem          整页（含左右侧栏）的最大宽度
 *   --layout-sidebar-width: 17.5rem  单侧栏宽度
 *   --post-reading-width: 48rem  正文的理想阅读宽度
 */
// Page width: rem
export const PAGE_WIDTH = 90;

// Sidebar width: rem
export const SIDEBAR_WIDTH = 17.5;
