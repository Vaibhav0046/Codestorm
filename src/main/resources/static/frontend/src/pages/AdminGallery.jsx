import React, { useState, useEffect } from 'react';
import api from '../api';
import { Image, Plus, Trash2, ToggleLeft, ToggleRight, X, Upload, Link, Check, Sparkles } from 'lucide-react';

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', active: true });
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const fetchImages = async () => {
    try {
      const res = await api.get('/api/gallery/all');
      setImages(res.data);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (filesList) => {
    const validFiles = [];
    const names = [];
    for (let file of Array.from(filesList)) {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image file (PNG, JPG, WebP).`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Max 10MB.`);
        continue;
      }
      validFiles.push(file);
      names.push(file.name);
    }
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFileNames(prev => [...prev, ...names]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      alert('Please enter an album/folder name.');
      return;
    }

    try {
      if (uploadMode === 'file') {
        if (selectedFiles.length === 0) {
          alert('Please select or upload at least one image file.');
          return;
        }
        
        // Upload all files sequentially to backend first
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const uploadForm = new FormData();
          uploadForm.append('file', file);
          const uploadRes = await api.post('/api/upload', uploadForm, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const downloadUrl = uploadRes.data.url;

          const payload = {
            title: formData.title,
            imageUrl: downloadUrl,
            active: formData.active,
            mainPreview: i === 0
          };
          await api.post('/api/gallery', payload);
        }
      } else {
        if (!formData.imageUrl) {
          alert('Please enter a valid web image URL.');
          return;
        }
        const payload = {
          title: formData.title,
          imageUrl: formData.imageUrl,
          active: formData.active,
          mainPreview: true
        };
        await api.post('/api/gallery', payload);
      }
      
      alert('Images uploaded to album folder successfully!');
      
      // Reset form & state
      setFormData({ title: '', imageUrl: '', active: true });
      setSelectedFiles([]);
      setFileNames([]);
      setShowModal(false);
      fetchImages();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to add image.');
    }
  };

  const handleSetMainPreview = async (id) => {
    try {
      await api.put(`/api/gallery/${id}/main-preview`);
      fetchImages();
    } catch (err) {
      alert('Failed to set cover image.');
    }
  };

  const handleToggleActive = async (image) => {
    try {
      const updatedImage = { ...image, active: !image.active };
      await api.put(`/api/gallery/${image.id}`, updatedImage);
      fetchImages();
    } catch (err) {
      alert('Failed to update image status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image from the carousel?')) return;
    try {
      await api.delete(`/api/gallery/${id}`);
      fetchImages();
    } catch (err) {
      alert('Failed to delete image.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
            <Image className="w-6 h-6 text-sky-400" />
            <span>Portal Gallery Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Manage images showcased in the home/dashboard carousel. Upload new event highlights or toggle slider visibility.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', imageUrl: '', active: true });
            setSelectedFiles([]);
            setFileNames([]);
            setShowModal(true);
          }}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-[10px] tracking-widest uppercase shadow-lg shadow-sky-500/10 flex items-center space-x-2 cursor-pointer transition-all hover:scale-105 duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading portal gallery database...</div>
      ) : images.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl space-y-4">
          <p className="text-sm text-slate-400 font-medium">No images uploaded in the gallery database yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
          >
            Upload the First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {(() => {
            // Group by Title
            const grouped = {};
            images.forEach(img => {
              const folderKey = img.title ? img.title.trim() : 'General Gallery';
              if (!grouped[folderKey]) {
                grouped[folderKey] = [];
              }
              grouped[folderKey].push(img);
            });
            const albums = Object.entries(grouped);

            return albums.map(([title, albumImages], aIdx) => (
              <div key={aIdx} className="space-y-4">
                {/* Album Folder Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h2 className="text-sm font-extrabold tracking-wider text-slate-300 uppercase flex items-center space-x-2">
                    <span className="text-lg">📁</span>
                    <span>Album: {title}</span>
                    <span className="text-[10px] font-black bg-slate-900 border border-white/5 text-slate-500 px-2 py-0.5 rounded-lg normal-case font-mono ml-2">
                      {albumImages.length} {albumImages.length === 1 ? 'image' : 'images'}
                    </span>
                  </h2>
                </div>

                {/* Grid of Images under this Album */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albumImages.map((image) => (
                    <div
                      key={image.id}
                      className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300 flex flex-col group"
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-video bg-slate-950 overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800';
                          }}
                        />
                        
                        {/* Cover Photo Indicator */}
                        {image.mainPreview && (
                          <div className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 font-black px-2.5 py-0.5 rounded text-[8px] tracking-widest uppercase flex items-center shadow-md z-10">
                            ⭐ COVER IMAGE
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            image.active 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${image.active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                            <span>{image.active ? 'Active' : 'Inactive'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Meta details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#0d1426]/40">
                        <div>
                          <h3 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-sky-400 transition-colors">
                            {image.title}
                          </h3>
                          <p className="text-[9px] text-slate-500 mt-1">
                            Uploaded on: {image.uploadedDate ? new Date(image.uploadedDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2 text-xs">
                          {/* Cover Toggle Button */}
                          {!image.mainPreview ? (
                            <button
                              onClick={() => handleSetMainPreview(image.id)}
                              className="text-[9px] text-slate-400 hover:text-amber-400 transition-colors flex items-center space-x-1 font-bold uppercase tracking-wider cursor-pointer"
                            >
                              <span>☆ Set Cover</span>
                            </button>
                          ) : (
                            <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider flex items-center space-x-1 select-none">
                              <span>★ Active Cover</span>
                            </span>
                          )}

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleToggleActive(image)}
                              className={`flex items-center space-x-1 text-[9px] font-bold uppercase tracking-wider cursor-pointer ${
                                image.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
                              }`}
                            >
                              {image.active ? 'Visible' : 'Hidden'}
                            </button>

                            <button
                              onClick={() => handleDelete(image.id)}
                              className="p-1 rounded bg-slate-950/60 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-slate-950 transition-all cursor-pointer border border-transparent"
                              title="Remove slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Upload/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl glass-effect rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950 border border-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <span>Upload Dashboard Image</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Provide image slides to showcase in the Home screen carousel/slider.
              </p>
            </div>

            {/* Mode Selectors */}
            <div className="flex border border-white/5 rounded-xl overflow-hidden p-1 bg-slate-950/80">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  uploadMode === 'file' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Local Files</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  uploadMode === 'url' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Web URL</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                  Album / Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. NRCM 2026 Grand Finale"
                  className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none"
                />
              </div>

              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                    Upload Local Images (Multiple Allowed)
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
                      dragActive 
                        ? 'border-sky-500 bg-sky-500/5' 
                        : base64Files.length > 0
                        ? 'border-emerald-500/40 bg-emerald-500/5' 
                        : 'border-white/10 hover:border-white/20 bg-slate-950/40'
                    }`}
                  >
                    <input
                      type="file"
                      id="gallery-file-upload"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {selectedFiles.length > 0 ? (
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                          <Check className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-200 font-bold max-w-[250px] mx-auto truncate">
                            {selectedFiles.length} images selected
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[300px] mx-auto">
                            {fileNames.join(', ')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles([]);
                            setFileNames([]);
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                        >
                          Clear & Re-select
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="gallery-file-upload" className="cursor-pointer space-y-3 block">
                        <div className="w-10 h-10 rounded-full bg-slate-800/80 text-slate-300 mx-auto flex items-center justify-center border border-slate-700">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-200 font-bold hover:text-sky-400 transition-colors">
                            Click to upload multiple images
                          </span>{' '}
                          <span className="text-slate-400">or drag and drop</span>
                        </div>
                        <p className="text-[10px] text-slate-500">PNG, JPG, WebP up to 10MB per file</p>
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                    Direct Web Image URL
                  </label>
                  <input
                    type="url"
                    required={uploadMode === 'url'}
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">
                    Provide a direct HTTPS URL to a publicly hosted image.
                  </p>
                </div>
              )}

              {/* Multiple Images Preview Grid */}
              {uploadMode === 'file' && selectedFiles.length > 0 && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Preview ({selectedFiles.length} images)</span>
                  <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="aspect-video rounded overflow-hidden bg-black relative border border-white/5">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-slate-950 font-black text-[7px] tracking-widest text-center uppercase py-0.5">
                            COVER
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadMode === 'url' && formData.imageUrl && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Preview</span>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black max-w-[240px] mx-auto">
                    <img
                      src={formData.imageUrl}
                      alt="Upload Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 bg-slate-950/60 p-4 rounded-xl border border-white/5 shadow-inner">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="accent-sky-500 cursor-pointer"
                />
                <label
                  htmlFor="active"
                  className="text-[10px] font-bold uppercase text-slate-300 tracking-widest font-heading cursor-pointer"
                >
                  Publish and Display Active Immediately
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold tracking-widest uppercase py-3.5 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all hover:scale-[1.02] duration-200"
              >
                Upload & Add to Album Folder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
