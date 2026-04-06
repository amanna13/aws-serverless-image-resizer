import { useEffect, useId, useState } from 'react'

function DragDropUpload({ onFileChange }) {
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const updateSelectedFile = (nextFile) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    if (!nextFile || !nextFile.type.startsWith('image/')) {
      setFile(null)
      setPreviewUrl('')
      if (onFileChange) {
        onFileChange(null)
      }
      return
    }

    const objectUrl = URL.createObjectURL(nextFile)
    setFile(nextFile)
    setPreviewUrl(objectUrl)

    if (onFileChange) {
      onFileChange(nextFile)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFile = event.dataTransfer.files?.[0]
    updateSelectedFile(droppedFile)
  }

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0]
    updateSelectedFile(selectedFile)
  }

  return (
    <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
      <label
        htmlFor={inputId}
        className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-slate-600 bg-slate-950/60 hover:border-cyan-300 hover:bg-slate-800/70'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        <p className="text-sm font-medium text-slate-100">Drag and drop an image</p>
        <p className="mt-1 text-xs text-slate-400">or click to select a file</p>

        {file ? (
          <span className="mt-3 rounded-full bg-slate-800 px-3 py-1 text-xs text-cyan-300">
            {file.name}
          </span>
        ) : null}
      </label>

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="h-56 w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  )
}

export default DragDropUpload
