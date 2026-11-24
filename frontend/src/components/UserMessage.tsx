export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-ink-900/[0.05] bg-surface px-4 py-2.5 text-[15px] leading-7 text-ink-900 shadow-soft [overflow-wrap:anywhere]">
        {content}
      </p>
    </div>
  );
}
