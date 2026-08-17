import React, { useRef, useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  Download, Sparkles, Upload, Flame, Menu, RotateCw, Layers as LayersIcon,
  Trash2, Copy, ChevronUp, ChevronDown, Lock, Unlock, Eye, EyeOff,
  ZoomIn, ZoomOut, Type, Image as ImageIcon, AlignCenterHorizontal,
  AlignCenterVertical, FlipHorizontal, Maximize2
} from 'lucide-react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../components/ProductCard';

interface CanvasLayer {
  id: string;
  src: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotate: number;
  locked: boolean;
  visible: boolean;
  flipX: boolean;
}

type ActionType = 'move' | 'resize' | 'rotate' | null;
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

const CANVAS_SIZES = {
  feed: { w: 420, h: 420, label: '1:1 Feed' },
  story: { w: 320, h: 568, label: '9:16 Story' },
};

const SNAP_THRESHOLD = 6;

export const MarketingStudio: React.FC = () => {
  const { products } = useProducts();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'feed' | 'story'>('feed');
  const [layoutMode, setLayoutMode] = useState<'floating' | 'full'>('floating');
  const [zoom, setZoom] = useState(1);
  const [showLayersPanel, setShowLayersPanel] = useState(true);

  // Textos da Arte
  const [badgeText, setBadgeText] = useState('PROMOÇÃO');
  const [promoTitle, setPromoTitle] = useState('Combo Promocional');
  const [promoPrice, setPromoPrice] = useState('39,90');
  const [tagline, setTagline] = useState('Acompanha arroz, tropeiro e vinagrete');

  // Camadas de Imagens no Canvas
  const [layers, setLayers] = useState<CanvasLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Estados de Manipulação (Drag, Resize, Rotate)
  const [actionType, setActionType] = useState<ActionType>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [initialLayerState, setInitialLayerState] = useState<CanvasLayer | null>(null);
  const [initialCenter, setInitialCenter] = useState({ x: 0, y: 0 });

  // Guias magnéticas (centro X/Y do canvas)
  const [snapX, setSnapX] = useState(false);
  const [snapY, setSnapY] = useState(false);

  const activeLayer = layers.find((l) => l.id === selectedLayerId) || null;
  const canvasSize = CANVAS_SIZES[aspectRatio];

  // ---------- Seleção de produto ----------
  const handleToggleProduct = (product: Product) => {
    if (!product.image_url) return;
    const exists = layers.some((l) => l.id === product.id);
    if (exists) {
      setLayers((prev) => prev.filter((l) => l.id !== product.id));
      if (selectedLayerId === product.id) setSelectedLayerId(null);
    } else {
      const newLayer: CanvasLayer = {
        id: product.id,
        src: product.image_url,
        name: product.name,
        x: (layers.length * 15) % 60,
        y: (layers.length * 15) % 60,
        width: 170,
        height: 170,
        scale: 1,
        rotate: 0,
        locked: false,
        visible: true,
        flipX: false,
      };
      setLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
      setPromoTitle(product.name);
      if (product.price) setPromoPrice(product.price.toFixed(2).replace('.', ','));
      if (product.description) setTagline(product.description);
    }
  };

  // ---------- Upload de foto extra ----------
  const handleUploadExtra = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const customId = `custom-${Date.now()}`;
        const newLayer: CanvasLayer = {
          id: customId,
          src: reader.result as string,
          name: 'Foto Enviada',
          x: 0,
          y: 0,
          width: 170,
          height: 170,
          scale: 1,
          rotate: 0,
          locked: false,
          visible: true,
          flipX: false,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(customId);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // ---------- Ações de camada (painel de layers) ----------
  const updateLayer = (id: string, patch: Partial<CanvasLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const deleteLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const duplicateLayer = (id: string) => {
    const original = layers.find((l) => l.id === id);
    if (!original) return;
    const copy: CanvasLayer = {
      ...original,
      id: `${id}-copy-${Date.now()}`,
      x: original.x + 18,
      y: original.y + 18,
    };
    setLayers((prev) => [...prev, copy]);
    setSelectedLayerId(copy.id);
  };

  const reorderLayer = (id: string, direction: 'up' | 'down') => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  };

  const centerLayerX = (id: string) => updateLayer(id, { x: 0 });
  const centerLayerY = (id: string) => updateLayer(id, { y: 0 });

  // ---------- Pointer events unificados (mouse + touch) ----------
  const suppressCanvasDeselect = useRef(false);

  const handlePointerDown = (
    e: React.PointerEvent,
    layerId: string,
    action: ActionType,
    handle?: ResizeHandle
  ) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    suppressCanvasDeselect.current = true;

    setSelectedLayerId(layerId);
    setActionType(action);
    setResizeHandle(handle || null);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setInitialLayerState({ ...layer });

    const el = document.getElementById(`layer-${layerId}`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setInitialCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!actionType || !selectedLayerId || !initialLayerState) return;

    const deltaX = (e.clientX - startPoint.x) / zoom;
    const deltaY = (e.clientY - startPoint.y) / zoom;

    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== selectedLayerId) return layer;

        if (actionType === 'move') {
          let newX = initialLayerState.x + deltaX;
          let newY = initialLayerState.y + deltaY;

          const snappedX = Math.abs(newX) < SNAP_THRESHOLD;
          const snappedY = Math.abs(newY) < SNAP_THRESHOLD;
          setSnapX(snappedX);
          setSnapY(snappedY);
          if (snappedX) newX = 0;
          if (snappedY) newY = 0;

          return { ...layer, x: newX, y: newY };
        }

        if (actionType === 'resize' && resizeHandle) {
          let delta = 0;
          if (['nw', 'se', 'ne', 'sw'].includes(resizeHandle)) {
            delta = (deltaX + (resizeHandle === 'ne' || resizeHandle === 'sw' ? -deltaY : deltaY)) / 2;
          } else if (['e', 'w'].includes(resizeHandle)) {
            delta = resizeHandle === 'e' ? deltaX : -deltaX;
          } else {
            delta = resizeHandle === 's' ? deltaY : -deltaY;
          }

          const factor = ['nw', 'sw'].includes(resizeHandle) ? -1 : 1;
          const newScale = Math.max(
            0.25,
            Math.min(3, initialLayerState.scale + (delta * factor) / 120)
          );
          return { ...layer, scale: newScale };
        }

        if (actionType === 'rotate') {
          const angleNow = Math.atan2(e.clientY - initialCenter.y, e.clientX - initialCenter.x) * (180 / Math.PI);
          const angleStart = Math.atan2(startPoint.y - initialCenter.y, startPoint.x - initialCenter.x) * (180 / Math.PI);
          const rawRotate = initialLayerState.rotate + (angleNow - angleStart);

          const nearestSnap = Math.round(rawRotate / 15) * 15;
          const finalRotate = Math.abs(rawRotate - nearestSnap) < 3 ? nearestSnap : rawRotate;

          return { ...layer, rotate: Math.round(finalRotate) };
        }

        return layer;
      })
    );
  };

  const handlePointerUp = () => {
    setActionType(null);
    setResizeHandle(null);
    setInitialLayerState(null);
    setSnapX(false);
    setSnapY(false);
    setTimeout(() => { suppressCanvasDeselect.current = false; }, 0);
  };

  const handleCanvasClick = () => {
    if (suppressCanvasDeselect.current) return;
    setSelectedLayerId(null);
  };

  // ---------- Atalhos de teclado ----------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedLayerId) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteLayer(selectedLayerId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateLayer(selectedLayerId);
      } else if (e.key === 'Escape') {
        setSelectedLayerId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedLayerId, layers]);

  // ---------- Exportar PNG ----------
  const handleExport = async () => {
    if (!canvasRef.current) return;
    const prevSelected = selectedLayerId;
    setSelectedLayerId(null);

    setTimeout(async () => {
      if (!canvasRef.current) return;
      const dataUrl = await htmlToImage.toPng(canvasRef.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `arte-${aspectRatio}.png`;
      link.href = dataUrl;
      link.click();
      setSelectedLayerId(prevSelected);
    }, 100);
  };

  const zoomIn = () => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)));

  const resizeHandles: { handle: ResizeHandle; className: string; cursor: string }[] = [
    { handle: 'nw', className: '-top-1.5 -left-1.5', cursor: 'cursor-nwse-resize' },
    { handle: 'ne', className: '-top-1.5 -right-1.5', cursor: 'cursor-nesw-resize' },
    { handle: 'sw', className: '-bottom-1.5 -left-1.5', cursor: 'cursor-nesw-resize' },
    { handle: 'se', className: '-bottom-1.5 -right-1.5', cursor: 'cursor-nwse-resize' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f1f5] dark:bg-[#09090b] flex flex-col md:flex-row select-none">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        {/* Topo Mobile */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button onClick={() => setIsMobileOpen(true)} className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white">
            <Menu size={20} />
          </button>
          <span className="font-extrabold text-sm text-gray-900 dark:text-white">Estúdio de Artes</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 h-full">

          {/* ================= PAINEL ESQUERDO ================= */}
          <div className="w-full lg:w-[340px] bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-4 max-h-[88vh] overflow-y-auto shadow-sm">
            <h2 className="font-black text-base flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles size={18} className="text-[var(--primary-accent)]" /> Ferramentas
            </h2>

            {/* Formato e Modo */}
            <div className="grid grid-cols-2 gap-2">
              <div className="grid grid-cols-2 gap-1 bg-gray-50 dark:bg-zinc-900 p-1 rounded-xl">
                {(['feed', 'story'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setAspectRatio(key)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                      aspectRatio === key ? 'bg-[var(--primary-accent)] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {CANVAS_SIZES[key].label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 bg-gray-50 dark:bg-zinc-900 p-1 rounded-xl">
                <button onClick={() => setLayoutMode('floating')} className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors ${layoutMode === 'floating' ? 'bg-[var(--primary-accent)] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>Central</button>
                <button onClick={() => setLayoutMode('full')} className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors ${layoutMode === 'full' ? 'bg-[var(--primary-accent)] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>Fundo</button>
              </div>
            </div>

            {/* Escolha dos Pratos */}
            {products.length > 0 && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                  <ImageIcon size={11} /> Pratos no canvas
                </label>
                <div className="mt-1.5 max-h-32 overflow-y-auto space-y-1 p-1.5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 cursor-pointer text-xs transition-colors">
                      <input
                        type="checkbox"
                        checked={layers.some((l) => l.id === p.id)}
                        onChange={() => handleToggleProduct(p)}
                        className="accent-orange-600 rounded"
                      />
                      <span className="font-bold text-gray-800 dark:text-zinc-200 flex-1 truncate">{p.name}</span>
                      <span className="text-[var(--primary-accent)] font-extrabold">R$ {p.price?.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Extra */}
            <div>
              <input type="file" ref={fileInputRef} onChange={handleUploadExtra} className="hidden" accept="image/*" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Upload size={15} /> Adicionar foto ao canvas
              </button>
            </div>

            {/* PAINEL DE CAMADAS */}
            {layers.length > 0 && (
              <div>
                <button
                  onClick={() => setShowLayersPanel((v) => !v)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"
                >
                  <span className="flex items-center gap-1"><LayersIcon size={11} /> Camadas ({layers.length})</span>
                  {showLayersPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {showLayersPanel && (
                  <div className="space-y-1 max-h-52 overflow-y-auto p-1.5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                    {[...layers].reverse().map((layer) => {
                      const isSelected = layer.id === selectedLayerId;
                      return (
                        <div
                          key={layer.id}
                          onClick={() => setSelectedLayerId(layer.id)}
                          className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                            isSelected ? 'bg-[var(--primary-accent)]/10 ring-1 ring-[var(--primary-accent)]' : 'hover:bg-gray-200 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0 border border-gray-200 dark:border-zinc-700">
                            <img src={layer.src} alt={layer.name} className="w-full h-full object-cover" style={{ opacity: layer.visible ? 1 : 0.3 }} />
                          </div>
                          <span className="flex-1 truncate font-semibold text-gray-700 dark:text-zinc-300">{layer.name}</span>

                          <button onClick={(e) => { e.stopPropagation(); reorderLayer(layer.id, 'up'); }} className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white" title="Trazer para frente">
                            <ChevronUp size={13} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); reorderLayer(layer.id, 'down'); }} className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white" title="Enviar para trás">
                            <ChevronDown size={13} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }} className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white" title="Mostrar/ocultar">
                            {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }} className="p-1 text-gray-400 hover:text-gray-800 dark:hover:text-white" title="Bloquear/desbloquear">
                            {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="p-1 text-gray-400 hover:text-red-500" title="Excluir">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Textos */}
            <div className="space-y-2 text-xs pt-1 border-t border-gray-100 dark:border-zinc-800">
              <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1 pt-2">
                <Type size={11} /> Textos da arte
              </label>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Tag superior</label>
                <input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="Ex: PROMOÇÃO" className="w-full mt-1 p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Título</label>
                <input value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} placeholder="Título" className="w-full mt-1 p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Preço (R$)</label>
                <input value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} placeholder="Preço" className="w-full mt-1 p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Frase / acompanhamentos</label>
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Frase" className="w-full mt-1 p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/40" />
              </div>
            </div>

            <button onClick={handleExport} className="w-full bg-[var(--primary-accent)] text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all">
              <Download size={18} /> Baixar arte em PNG
            </button>
          </div>

          {/* ================= ÁREA DO CANVAS ================= */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-2 py-1 shadow-sm">
                <button onClick={zoomOut} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300" title="Diminuir zoom">
                  <ZoomOut size={15} />
                </button>
                <span className="text-xs font-bold text-gray-600 dark:text-zinc-300 w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                <button onClick={zoomIn} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300" title="Aumentar zoom">
                  <ZoomIn size={15} />
                </button>
                <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700 mx-1" />
                <button onClick={() => setZoom(1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300" title="Ajustar à tela">
                  <Maximize2 size={14} />
                </button>
              </div>

              {activeLayer && (
                <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-2 py-1 shadow-sm">
                  <button onClick={() => centerLayerX(activeLayer.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300" title="Centralizar horizontalmente">
                    <AlignCenterVertical size={15} />
                  </button>
                  <button onClick={() => centerLayerY(activeLayer.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300" title="Centralizar verticalmente">
                    <AlignCenterHorizontal size={15} />
                  </button>
                  <button onClick={() => updateLayer(activeLayer.id, { flipX: !activeLayer.flipX })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300" title="Espelhar">
                    <FlipHorizontal size={15} />
                  </button>
                  <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700 mx-1" />
                  <button onClick={() => duplicateLayer(activeLayer.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300" title="Duplicar (Ctrl+D)">
                    <Copy size={15} />
                  </button>
                  <button onClick={() => deleteLayer(activeLayer.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-600 dark:text-zinc-300 hover:text-red-500" title="Excluir (Del)">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={canvasWrapRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="flex-1 flex justify-center items-center rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 touch-none overflow-auto"
              style={{
                minHeight: canvasSize.h + 48,
                backgroundColor: '#e5e7eb',
                backgroundImage:
                  'linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            >
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: actionType ? 'none' : 'transform 0.15s ease' }}
              >
                <div
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="relative bg-[#09090b] text-white flex flex-col justify-between overflow-hidden shadow-2xl rounded-3xl"
                  style={{ width: canvasSize.w, height: canvasSize.h }}
                >
                  {snapX && (
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-cyan-400 z-40 pointer-events-none opacity-90 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  )}
                  {snapY && (
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-cyan-400 z-40 pointer-events-none opacity-90 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  )}

                  {layoutMode === 'full' && layers.length > 0 && layers[0].visible && (
                    <div className="absolute inset-0 z-0">
                      <img src={layers[0].src} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                    </div>
                  )}

                  <div className="relative z-30 p-6 flex justify-between items-start pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-[var(--primary-accent)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                      <Flame size={12} /> {badgeText || 'PROMOÇÃO'}
                    </div>
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md pl-1.5 pr-3 py-1 rounded-xl border border-white/10">
                      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src="/logo.png"
                          alt="Logo"
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => (((e.target as HTMLElement).parentElement as HTMLElement).style.display = 'none')}
                        />
                      </div>
                      <span className="text-[11px] font-black text-white">Wada Mendes</span>
                    </div>
                  </div>

                  {layoutMode === 'floating' && (
                    <div className="relative z-20 flex-1 flex items-center justify-center">
                      {layers.filter((l) => l.visible).map((layer) => {
                        const isSelected = layer.id === selectedLayerId;
                        return (
                          <div
                            key={layer.id}
                            id={`layer-${layer.id}`}
                            onPointerDown={(e) => handlePointerDown(e, layer.id, 'move')}
                            className={`absolute transition-shadow ${layer.locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${
                              isSelected ? 'ring-2 ring-cyan-400 rounded-3xl' : ''
                            }`}
                            style={{
                              transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotate}deg) scaleX(${layer.flipX ? -1 : 1})`,
                              transformOrigin: 'center center',
                            }}
                          >
                            <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-zinc-900">
                              <img src={layer.src} alt={layer.name} className="w-full h-full object-cover pointer-events-none" draggable={false} />
                            </div>

                            {isSelected && !layer.locked && (
                              <>
                                {resizeHandles.map(({ handle, className, cursor }) => (
                                  <div
                                    key={handle}
                                    onPointerDown={(e) => handlePointerDown(e, layer.id, 'resize', handle)}
                                    className={`absolute ${className} w-3.5 h-3.5 bg-white border-2 border-cyan-500 rounded-full ${cursor} z-50 shadow-md hover:scale-125 transition-transform`}
                                  />
                                ))}

                                <div
                                  onPointerDown={(e) => handlePointerDown(e, layer.id, 'rotate')}
                                  className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-transform"
                                  title="Girar imagem"
                                >
                                  <RotateCw size={12} />
                                </div>

                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-zinc-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap pointer-events-none">
                                  {Math.round(layer.rotate)}°
                                </div>
                              </>
                            )}

                            {layer.locked && (
                              <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1">
                                <Lock size={10} className="text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {layers.length === 0 && (
                        <div className="text-center text-xs text-gray-500 p-6 border border-dashed border-zinc-700 rounded-2xl">
                          Marque um prato na lista ao lado ou envie uma foto para começar
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rodapé do Banner */}
                  <div className="relative z-30 p-6 space-y-2 pointer-events-none">
                    <div>
                      <h1 className="text-2xl font-black text-white leading-tight drop-shadow-md">{promoTitle}</h1>
                      <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2">{tagline}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/20">
                      <div>
                        <span className="text-[9px] font-extrabold text-zinc-400 block uppercase">Apenas</span>
                        <div className="text-3xl font-black text-amber-400 leading-none">
                          <span className="text-base">R$ </span>{promoPrice}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-300 block">Peça no WhatsApp</span>
                        <span className="text-xs font-black text-white">(89) 99444-0907</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};