import { NotebookPen, SearchX } from "lucide-react";

export default function EmptyState({ isSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {isSearch ? (
        <>
          <SearchX size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No notes match your search</p>
          <p className="text-gray-400 text-sm mt-1">Try a different keyword</p>
        </>
      ) : (
        <>
          <NotebookPen size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No notes yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "New Note" to create your first one</p>
        </>
      )}
    </div>
  );
}
