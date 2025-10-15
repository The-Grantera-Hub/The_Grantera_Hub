'use client'
import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import mammoth from 'mammoth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Download } from 'lucide-react'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

// ✅ Correct PDF worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function DocumentViewer({ url, title }) {
  const [open, setOpen] = useState(false)
  const [fileType, setFileType] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [docxHTML, setDocxHTML] = useState(null)
  const [loading, setLoading] = useState(false)

  // ✅ Detect actual file type properly
  useEffect(() => {
    if (!url) return
    const ext = url.split('.').pop().toLowerCase().split('?')[0]
    setFileType(ext)
  }, [url])

  // ✅ Convert .docx → HTML with Mammoth only for docx files
  useEffect(() => {
    const convertDocx = async () => {
      if (fileType !== 'docx' || !url) return
      setLoading(true)
      try {
        const res = await fetch(url)
        const arrayBuffer = await res.arrayBuffer()
        const { value } = await mammoth.convertToHtml({ arrayBuffer })
        setDocxHTML(value)
      } catch (err) {
        console.error('Error converting DOCX:', err)
      } finally {
        setLoading(false)
      }
    }
    convertDocx()
  }, [fileType, url])

  const handleDocumentLoad = ({ numPages }) => setNumPages(numPages)
  const nextPage = () => setPageNumber((p) => Math.min(p + 1, numPages))
  const prevPage = () => setPageNumber((p) => Math.max(p - 1, 1))

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = title || 'document'
    link.target = '_blank'
    link.click()
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        View Document
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title || 'Preview Document'}</DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin h-6 w-6 mr-2" />
              Loading document...
            </div>
          )}

          {/* ✅ PDF Viewer */}
          {!loading && fileType === 'pdf' && url && (
            <div className="flex flex-col items-center justify-center">
              <Document
                file={url}
                onLoadSuccess={handleDocumentLoad}
                loading={<Loader2 className="animate-spin" />}
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="border rounded-lg my-2 shadow-sm"
                />
              </Document>

              <div className="flex justify-between items-center mt-4 w-full">
                <div className="flex gap-2">
                  <Button onClick={prevPage} disabled={pageNumber <= 1}>
                    Prev
                  </Button>
                  <Button onClick={nextPage} disabled={pageNumber >= numPages}>
                    Next
                  </Button>
                </div>

                <div className="flex gap-2 items-center">
                  <span className="text-sm">
                    Page {pageNumber} of {numPages || '?'}
                  </span>
                  <Button variant="secondary" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ DOCX Viewer */}
          {!loading && fileType === 'docx' && docxHTML && (
            <div
              className="prose max-w-none bg-white p-4 rounded-lg border shadow-sm"
              dangerouslySetInnerHTML={{ __html: docxHTML }}
            />
          )}

          {/* Fallback */}
          {!loading &&
            fileType &&
            fileType !== 'pdf' &&
            fileType !== 'docx' && (
              <p className="text-center text-sm text-muted-foreground py-10">
                This file type ({fileType}) can’t be previewed.
              </p>
            )}
        </DialogContent>
      </Dialog>
    </>
  )
}
