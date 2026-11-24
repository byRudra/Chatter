export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[36rem] whitespace-pre-wrap [overflow-wrap:anywhere] rounded-[1.5rem] rounded-br-lg bg-white/[0.07] px-5 py-3 text-[15px] leading-relaxed text-white/90 ring-1 ring-white/[0.06]">
        {content}
      </p>
    </div>
  );
}
