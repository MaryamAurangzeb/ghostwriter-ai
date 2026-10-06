export default function Logo({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden><path d="M4 14a10 10 0 0 1 20 0v13l-3.3-2.6L17.3 27 14 24.4 10.7 27 7.3 24.4 4 27V14Z" fill="#6554F0"/><circle cx="11" cy="14" r="1.8" fill="#fff"/><circle cx="17" cy="14" r="1.8" fill="#fff"/><path d="M22 20h5a2 2 0 0 1 2 2v4l-3-2h-4a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2Z" fill="#1E2235"/></svg>;
}
