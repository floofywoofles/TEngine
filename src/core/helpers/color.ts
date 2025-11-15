/**
 * Color System for Terminal Rendering
 * Provides ANSI color codes for styling text in the terminal
 */

/**
 * ANSI color codes for terminal text styling
 */
export enum Color {
  // Foreground colors
  Black = '\x1b[30m',
  Red = '\x1b[31m',
  Green = '\x1b[32m',
  Yellow = '\x1b[33m',
  Blue = '\x1b[34m',
  Magenta = '\x1b[35m',
  Cyan = '\x1b[36m',
  White = '\x1b[37m',
  
  // Bright foreground colors
  BrightBlack = '\x1b[90m',
  BrightRed = '\x1b[91m',
  BrightGreen = '\x1b[92m',
  BrightYellow = '\x1b[93m',
  BrightBlue = '\x1b[94m',
  BrightMagenta = '\x1b[95m',
  BrightCyan = '\x1b[96m',
  BrightWhite = '\x1b[97m',
  
  // Background colors
  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
  
  // Bright background colors
  BgBrightBlack = '\x1b[100m',
  BgBrightRed = '\x1b[101m',
  BgBrightGreen = '\x1b[102m',
  BgBrightYellow = '\x1b[103m',
  BgBrightBlue = '\x1b[104m',
  BgBrightMagenta = '\x1b[105m',
  BgBrightCyan = '\x1b[106m',
  BgBrightWhite = '\x1b[107m',
  
  // Text styles
  Bold = '\x1b[1m',
  Dim = '\x1b[2m',
  Italic = '\x1b[3m',
  Underline = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',
  
  // Reset
  Reset = '\x1b[0m',
}

/**
 * ColoredEntity - Extension of Entity with color support
 * Wraps sprite with ANSI color codes
 */
export class ColorHelper {
  /**
   * Applies a color to a text string
   * @param text - The text to colorize
   * @param color - The color to apply
   * @returns The colorized text with reset code
   */
  public static colorize(text: string, color: Color): string {
    return `${color}${text}${Color.Reset}`;
  }

  /**
   * Applies multiple styles to a text string
   * @param text - The text to style
   * @param styles - Array of colors/styles to apply
   * @returns The styled text with reset code
   */
  public static style(text: string, ...styles: Color[]): string {
    const styleString = styles.join('');
    return `${styleString}${text}${Color.Reset}`;
  }

  /**
   * Applies foreground and background colors
   * @param text - The text to colorize
   * @param fg - The foreground color
   * @param bg - The background color
   * @returns The colorized text with reset code
   */
  public static colorizeWithBg(text: string, fg: Color, bg: Color): string {
    return `${fg}${bg}${text}${Color.Reset}`;
  }

  /**
   * Strips all ANSI color codes from a string
   * @param text - The text to strip
   * @returns The text without color codes
   */
  public static stripColors(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * Gets the visible length of a string (excluding color codes)
   * @param text - The text to measure
   * @returns The visible character count
   */
  public static getVisibleLength(text: string): number {
    return this.stripColors(text).length;
  }
}

