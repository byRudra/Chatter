export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-bone-800/80 px-4 py-2.5 text-[15px] leading-7 text-bone-100 [overflow-wrap:anywhere]">
        {content}
      </p>
    </div>
  );
}
