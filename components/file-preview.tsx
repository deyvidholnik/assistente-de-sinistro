"use client"

import { Button } from "@/components/ui/button"
import { FileText, Trash2 } from "lucide-react"
import type { DocumentosData } from "@/types"

interface FilePreviewProps {
  files: File[]
  field?: keyof DocumentosData
  stepId?: number
  onRemove: (index: number) => void
}

export function FilePreview({ files, onRemove }: FilePreviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4">
      {files.map((file, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file) || "/placeholder.svg"}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-1 sm:mb-2" />
                <p className="text-xs text-gray-500 truncate">{file.name}</p>
              </div>
            )}
          </div>
          <Button
            onClick={() => onRemove(index)}
            size="sm"
            variant="destructive"
            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
          <p className="text-xs text-gray-600 mt-1 truncate leading-tight">{file.name}</p>
        </div>
      ))}
    </div>
  )
}
