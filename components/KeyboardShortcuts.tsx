export default function KeyboardShortcuts() {
    return (
        <div className="fixed bottom-4 left-4 z-50 pointer-events-none opacity-50 text-[10px] text-gray-500 font-mono hidden md:block">
            <p>[SPACE] Toggle Play/Pause</p>
            <p>[←/→] +/- 10 Frames</p>
        </div>
    );
}
