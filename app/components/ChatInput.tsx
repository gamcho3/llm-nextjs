// app/components/ChatInput.tsx

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
}: ChatInputProps) {
  return (
    <footer className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="제주 여행에 대해 물어보세요..."
          className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition"
        >
          전송
        </button>
      </div>
    </footer>
  );
}
