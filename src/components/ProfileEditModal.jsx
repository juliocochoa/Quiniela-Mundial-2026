import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export default function ProfileEditModal({ isOpen, onClose, user, onUpdateProfile }) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.name || '');
      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarLoadError(false);
      setError('');
    }
  }, [isOpen, user]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no debe superar los 2MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarLoadError(false);
    setError('');
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let avatarUrl = user.avatar;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `private/${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile_pics')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile_pics')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ name: displayName.trim(), avatar: avatarUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, name: displayName.trim(), avatar: avatarUrl });

        if (insertError) throw insertError;
      }

      queryClient.invalidateQueries({ queryKey: ['profiles'] });

      onUpdateProfile({
        name: displayName.trim(),
        avatar: avatarUrl,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-md font-headline-md text-on-surface">Editar Perfil</h2>
          <button onClick={onClose} className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all">
            close
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-2 border-primary-fixed overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : user.avatar && !avatarLoadError ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" onError={() => setAvatarLoadError(true)} />
              ) : (
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[40px]">person</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-[28px]">camera_alt</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="text-xs text-on-surface-variant mt-2">Toca para cambiar foto</p>
        </div>

        <div className="mb-6">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5 ml-1">NOMBRE</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-3 px-4 text-on-surface outline-none transition-all"
            placeholder="Tu nombre"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low transition-all font-body-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-primary text-on-primary rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all font-body-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="material-symbols-outlined animate-spin text-[18px] inline-block">sync</span>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
