import React from 'react';
import { X, Layers, Cpu, Compass, BookOpen } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="bg-[#161b22] border border-[#30363d] rounded-[10px] max-w-2xl w-full p-6 text-[#e6edf3] shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-[#8b949e] hover:text-white p-1 rounded-md focus:ring-2 focus:ring-[#2f81f7] outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#1f6feb] flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 id="info-title" className="text-[18px] font-semibold text-white">
              About Latent Space Explorer
            </h2>
            <p className="text-[12px] text-[#8b949e]">
              Educational interactive laboratory for understanding dimensionality reduction
            </p>
          </div>
        </div>

        <div className="space-y-4 text-[13px] text-[#c9d1d9] leading-relaxed">
          <section>
            <h3 className="text-[14px] font-semibold text-[#58a6ff] flex items-center gap-2 mb-1.5">
              <Compass className="w-4 h-4" /> What is a Latent Space?
            </h3>
            <p>
              In machine learning, a <strong>latent space</strong> is a compressed, lower-dimensional manifold
              where high-dimensional data items are positioned according to their learned features and semantic
              similarities.
            </p>
          </section>

          <section>
            <h3 className="text-[14px] font-semibold text-[#3fb950] flex items-center gap-2 mb-1.5">
              <Cpu className="w-4 h-4" /> Algorithms Compared
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Variational Autoencoder (VAE):</strong> Regularized with a Gaussian prior. Minimizes dead
                zones and clusters points smoothly so new points can be sampled continuously.
              </li>
              <li>
                <strong>Deterministic Autoencoder:</strong> Only minimizes reconstruction loss. Leads to fragmented
                clusters with unconstrained empty regions.
              </li>
              <li>
                <strong>Principal Component Analysis (PCA):</strong> Purely linear projection preserving global
                variance along orthogonal axes.
              </li>
              <li>
                <strong>UMAP / t-SNE:</strong> Non-linear manifold learning preserving local neighborhood topologies,
                producing tight distinct group islands.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-[14px] font-semibold text-[#d29922] flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4 h-4" /> Controls & Interactivity
            </h3>
            <p>
              Rotate the 3D space by dragging, zoom with scroll, switch color dimensions (Sector, Region, Income,
              Age), and reseed the pseudo-random generator to test stability.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-[#30363d] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium rounded-[6px] transition focus:ring-2 focus:ring-[#2ea043] outline-none"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
