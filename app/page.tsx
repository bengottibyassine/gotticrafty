export default function Home() {
  return (
    <main className="flex min-h-[100dvh] justify-center bg-[#F7F9FC]">
      <textarea
        autoFocus
        spellCheck
        aria-label="Text editor"
        placeholder="Start typing…"
        className="w-full max-w-3xl flex-1 resize-none bg-transparent px-5 py-10 text-[16px] leading-[1.7] text-[#1A2332] caret-[#E8663D] outline-none placeholder:text-[#5A6B7D]/60 selection:bg-[#E8663D]/20 sm:px-10 sm:py-16 sm:text-[18px] motion-safe:animate-[fade-up_0.4s_ease-out_both]"
      />
    </main>
  );
}