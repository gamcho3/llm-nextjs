// app/components/LoadingSpinner.tsx

export function LoadingSpinner() {
  return (
    <div className="flex justify-start">
      <div className="bg-white p-4 rounded-2xl shadow rounded-bl-md border border-gray-100">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    </div>
  );
}
