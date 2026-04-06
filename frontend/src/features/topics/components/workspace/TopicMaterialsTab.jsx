import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ChevronLeft, Eye, File, FileText, Link as LinkIcon, Loader2, Pencil, Trash2, Type, Upload, X } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';

export default function TopicMaterialsTab({
  materials,
  isModalOpen,
  setIsModalOpen,
  uploadType,
  setUploadType,
  uploadFiles,
  setUploadFiles,
  uploadText,
  setUploadText,
  uploadUrl,
  setUploadUrl,
  isUploading,
  deletingMaterialId,
  uploadMessage,
  setUploadMessage,
  handleUpload,
  onDeleteMaterial,
}) {
  const [uploadStep, setUploadStep] = useState('select');

  const openUploadModal = () => {
    setUploadStep('select');
    setUploadMessage({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const selectUploadType = (type) => {
    setUploadType(type);
    setUploadMessage({ type: '', text: '' });
    setUploadStep('form');
  };

  const goBackToSelection = () => {
    setUploadStep('select');
    setUploadMessage({ type: '', text: '' });
  };

  const getMaterialName = (material) => {
    return material.name || material.title || material.file_name || material.source_url || 'Untitled Material';
  };

  const getMaterialFormat = (material) => {
    const type = material.type || material.material_type || 'unknown';
    if (type === 'file' || type === 'document') return 'File';
    if (type === 'url') return 'URL';
    if (type === 'text') return 'Text';
    return type;
  };

  const getMaterialStatus = (material) => {
    return material.processing_status || material.status || 'uploaded';
  };

  const getShowUrl = (material) => {
    return material.file_url || material.source_url || null;
  };

  const openMaterial = (material) => {
    const targetUrl = getShowUrl(material);
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setUploadMessage({
      type: 'error',
      text: 'No preview URL available for this material.',
    });
  };

  const onEditMaterial = (material) => {
    setUploadMessage({
      type: 'success',
      text: `Edit requested for "${getMaterialName(material)}". Edit flow can be connected to update API next.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white">
        <CardHeader className="flex flex-row items-center justify-between py-5">
          <div className="space-y-1">
            <CardTitle className="text-xl">Topic Materials</CardTitle>
            <CardDescription>All materials uploaded for this topic.</CardDescription>
          </div>
          <Button onClick={openUploadModal} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="h-4 w-4" /> Add Material
          </Button>
        </CardHeader>
        <CardContent>
          {materials.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center bg-gray-50/50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-gray-100">
                <FileText className="h-8 w-8 text-blue-500/70" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No materials yet</h3>
              <p className="max-w-xs text-sm text-gray-500">Upload documents, links, or text notes to build your knowledge base for this topic.</p>
              <Button variant="outline" onClick={openUploadModal} className="mt-6 gap-2 bg-white">
                <Upload className="h-4 w-4" /> Upload your first material
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">File Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Format</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Show</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Edit</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((mat, i) => {
                    const materialId = mat._id || mat.id || i;
                    const status = getMaterialStatus(mat);
                    return (
                      <tr key={materialId} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40">
                        <td className="px-4 py-3 text-gray-900 font-medium max-w-[280px]">
                          <div className="truncate" title={getMaterialName(mat)}>{getMaterialName(mat)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">{getMaterialFormat(mat)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`capitalize border-none ${
                              status === 'completed'
                                ? 'bg-green-50 text-green-700'
                                : status === 'failed'
                                ? 'bg-red-50 text-red-700'
                                : status === 'processing'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {mat.uploadedAt || mat.created_at
                            ? new Date(mat.uploadedAt || mat.created_at).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openMaterial(mat)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditMaterial(mat)}
                            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteMaterial?.(mat._id || mat.id)}
                            disabled={deletingMaterialId === (mat._id || mat.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingMaterialId === (mat._id || mat.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative ring-1 ring-gray-200/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-lg"><Upload className="h-4 w-4 text-blue-700" /></div> Add Material
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setUploadMessage({ type: '', text: '' });
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors bg-white hover:bg-gray-100 rounded-full p-2 border border-gray-200/50 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              {uploadStep === 'select' ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-sm text-gray-600">Choose how you want to add material:</p>
                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={() => selectUploadType('file')}
                      className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-700"><Upload className="h-4 w-4" /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Upload File</p>
                          <p className="text-xs text-gray-500">PDF, DOC, images and more</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectUploadType('text')}
                      className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-2 text-orange-700"><Type className="h-4 w-4" /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Enter Text</p>
                          <p className="text-xs text-gray-500">Paste notes or write custom content</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectUploadType('url')}
                      className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-green-300 hover:bg-green-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2 text-green-700"><LinkIcon className="h-4 w-4" /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Enter URL</p>
                          <p className="text-xs text-gray-500">Add a web link as material</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={goBackToSelection}
                      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <Badge variant="outline" className="capitalize text-xs">
                      {uploadType}
                    </Badge>
                  </div>

                  {uploadType === 'file' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select File(s)</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-colors relative group bg-gray-50/30">
                        <input
                          id="file-upload-input"
                          type="file"
                          multiple
                          onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          required={uploadFiles.length === 0}
                        />
                        <div className="bg-white w-14 h-14 mx-auto rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-3 group-hover:scale-110 group-hover:shadow-md transition-all">
                          <Upload className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-700 font-semibold">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1.5">SVG, PNG, JPG, DOC, PDF (max. 10MB)</p>
                      </div>
                      {uploadFiles.length > 0 && (
                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm relative">
                          <p className="text-sm font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-200 text-blue-800 text-xs py-0.5 px-2 rounded-full">{uploadFiles.length}</span> file{uploadFiles.length > 1 ? 's' : ''} ready for upload
                          </p>
                          <ul className="mt-3 flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                            {uploadFiles.map((f, i) => (
                              <li key={i} className="text-xs text-blue-800 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm">
                                <File className="h-3.5 w-3.5 text-blue-500" /> <span className="truncate font-medium">{f.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadType === 'text' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                      <textarea
                        rows={6}
                        value={uploadText}
                        onChange={(e) => setUploadText(e.target.value)}
                        className="block w-full rounded-xl border-gray-200 shadow-sm border p-4 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 hover:bg-white transition-colors resize-none"
                        placeholder="Type or paste your material text here..."
                        required
                      />
                    </div>
                  )}

                  {uploadType === 'url' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Material Link</label>
                      <input
                        type="url"
                        value={uploadUrl}
                        onChange={(e) => setUploadUrl(e.target.value)}
                        className="block w-full rounded-xl border-gray-200 shadow-sm border px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 hover:bg-white transition-colors"
                        placeholder="https://example.com/useful-resource"
                        required
                      />
                    </div>
                  )}

                  {uploadMessage.text && (
                    <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in zoom-in-95 ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {uploadMessage.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                      {uploadMessage.text}
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading} className="gap-2 min-w-[140px] shadow-sm bg-blue-600 hover:bg-blue-700 text-white">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploading ? 'Uploading...' : 'Save Material'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
