import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { deleteMaterial, getMaterials, uploadMaterial } from '../shared/api/endpoints';
import { useTopics } from '../context/TopicContext';
import TopicMaterialsTab from '../features/topics/components/workspace/TopicMaterialsTab';
import TopicOverviewTab from '../features/topics/components/workspace/TopicOverviewTab';
import TopicFlashcardsTab from '../features/topics/components/workspace/TopicFlashcardsTab';
import TopicWorkspaceHeader from '../features/topics/components/workspace/TopicWorkspaceHeader';
import {
  TopicErrorState,
  TopicLoadingState,
  TopicNotFoundState,
} from '../features/topics/components/workspace/TopicWorkspaceStates';
import TopicWorkspaceTabs from '../features/topics/components/workspace/TopicWorkspaceTabs';
import { progressColor, toTopicData } from '../features/topics/components/workspace/topicWorkspaceUtils';

export default function TopicWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTopicById } = useTopics();

  const [activeTab, setActiveTab] = useState('overview');
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Materials tab state
  const [materials, setMaterials] = useState([]);
  const [uploadType, setUploadType] = useState('file');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadText, setUploadText] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deletingMaterialId, setDeletingMaterialId] = useState(null);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const normalizeMaterial = (material) => ({
    _id: material._id || material.id,
    name: material.title || material.file_name || material.source_url || material.text_preview || 'Untitled Material',
    type: material.material_type === 'document' ? 'file' : material.material_type,
    uploadedAt: material.created_at || material.updated_at || new Date().toISOString(),
    ...material,
  });

  const loadMaterials = useCallback(async () => {
    try {
      const res = await getMaterials(id);
      const items = Array.isArray(res?.data) ? res.data : [];
      setMaterials(items.map(normalizeMaterial));
    } catch (err) {
      // Don't block full topic page if materials fetch fails
      console.error('Failed to fetch materials:', err);
      setMaterials([]);
    }
  }, [id]);

  const loadTopic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopicById(id);
      setTopic(data);
      await loadMaterials();
    } catch (err) {
      const message =
        err?.response?.status === 404
          ? 'Topic not found.'
          : err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load topic. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id, getTopicById, loadMaterials]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadType) return;
    
    setIsUploading(true);
    setUploadMessage({ type: '', text: '' });
    
    try {
      if (uploadType === 'file' && uploadFiles.length > 0) {
        const uploads = uploadFiles.map((file) => uploadMaterial(id, { file }));
        await Promise.all(uploads);
        await loadMaterials();
        setUploadMessage({ type: 'success', text: `${uploadFiles.length} material(s) uploaded successfully!` });
        
      } else {
        let uploadCount = 0;
        if (uploadType === 'text' && uploadText) {
          await uploadMaterial(id, { text: uploadText });
          uploadCount = 1;
        } else if (uploadType === 'url' && uploadUrl) {
          await uploadMaterial(id, { url: uploadUrl });
          uploadCount = 1;
        } else {
          throw new Error('Please provide the required material content.');
        }

        await loadMaterials();
        setUploadMessage({ type: 'success', text: `${uploadCount} material uploaded successfully!` });
      }
      
      // Reset form
      setUploadFiles([]);
      setUploadText('');
      setUploadUrl('');
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => {
        setIsModalOpen(false);
        setUploadMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setUploadMessage({ 
        type: 'error', 
        text: err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Failed to upload material.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!materialId) return;

    setDeletingMaterialId(materialId);
    try {
      await deleteMaterial(id, materialId);
      setMaterials((prev) => prev.filter((mat) => (mat._id || mat.id) !== materialId));
      setUploadMessage({ type: 'success', text: 'Material deleted successfully!' });
    } catch (err) {
      setUploadMessage({
        type: 'error',
        text: err?.response?.data?.detail || err?.response?.data?.message || 'Failed to delete material.',
      });
    } finally {
      setDeletingMaterialId(null);
    }
  };

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  if (loading) {
    return <TopicLoadingState />;
  }

  if (error) {
    return <TopicErrorState error={error} navigate={navigate} onRetry={loadTopic} />;
  }

  if (!topic) {
    return <TopicNotFoundState navigate={navigate} />;
  }

  const topicData = toTopicData(topic);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <TopicWorkspaceHeader topicData={topicData} navigate={navigate} />
      <TopicWorkspaceTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <TopicOverviewTab topicData={topicData} navigate={navigate} progressColor={progressColor} />
      )}

      {activeTab === 'materials' && (
        <TopicMaterialsTab
          materials={materials}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          uploadType={uploadType}
          setUploadType={setUploadType}
          uploadFiles={uploadFiles}
          setUploadFiles={setUploadFiles}
          uploadText={uploadText}
          setUploadText={setUploadText}
          uploadUrl={uploadUrl}
          setUploadUrl={setUploadUrl}
          isUploading={isUploading}
          deletingMaterialId={deletingMaterialId}
          uploadMessage={uploadMessage}
          setUploadMessage={setUploadMessage}
          handleUpload={handleUpload}
          onDeleteMaterial={handleDeleteMaterial}
        />
      )}

      {activeTab === 'flashcards' && <TopicFlashcardsTab />}

      {activeTab !== 'overview' && activeTab !== 'materials' && activeTab !== 'flashcards' && (
        <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-white min-h-[400px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-medium text-gray-900 capitalize">{activeTab} View</h3>
            <p className="mt-2">This dedicated section is ready for content integration.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
