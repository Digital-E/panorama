"use client";

type Props = React.VideoHTMLAttributes<HTMLVideoElement>;

// Video playback is temporarily disabled. When a poster is available, render
// a plain <img> so it displays reliably on all devices including mobile.
// To restore video: bring back IntersectionObserver + src loading logic.
export function FadeVideo({
  className = "",
  src: _src,
  onLoadedData: _onLoadedData,
  autoPlay: _autoPlay,
  loop: _loop,
  muted: _muted,
  playsInline: _playsInline,
  poster,
  ...props
}: Props) {
  if (poster) {
    const { width, height, style } = props as { width?: number; height?: number; style?: React.CSSProperties };
    return (
      <img
        src={poster}
        alt=""
        width={width}
        height={height}
        style={style}
        className={`opacity-100 ${className}`}
      />
    );
  }

  return (
    <video
      {...props}
      preload="none"
      className={`opacity-100 ${className}`}
    />
  );
}
